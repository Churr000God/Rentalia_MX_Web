from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .db import init_pool, get_pool
import httpx
import os
import re
import asyncio
import smtplib
from email.message import EmailMessage
from supabase import create_client, Client
from dotenv import load_dotenv
import pathlib

# Load .env from root directory (sites/rentalia.mx/.env)
basedir = pathlib.Path(__file__).parent.parent.parent
load_dotenv(basedir / ".env")

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Reviews Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
PLACE_ID = os.getenv("GOOGLE_PLACE_ID")

# Supabase Configuration
SUPABASE_URL         = os.getenv("SUPABASE_URL")
SUPABASE_KEY         = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Cliente anon — para lecturas con RLS (reviews aprobadas, etc.)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Cliente service_role — bypasea RLS para escrituras server-side (visitas, etc.)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_KEY else supabase

@app.on_event("startup")
async def startup():
    try:
        await init_pool()
    except Exception as e:
        print(f"Warning: Database connection failed: {e}")

@app.on_event("shutdown")
async def shutdown():
    pool = get_pool()
    if pool:
        await pool.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/rooms")
async def list_rooms():
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "select id, nombre, detalles, descripcion, precio, capacidad, disponible, direccion, imagen_principal from rentalia.habitaciones where disponible = true order by precio asc"
        )
        return [dict(r) for r in rows]

# Helper function for Google Reviews
async def fetch_google_reviews():
    try:
        if not GOOGLE_API_KEY or not PLACE_ID:
            print("Google API Key or Place ID missing in environment variables")
            return {
                "source": "google",
                "rating": 0,
                "total": 0,
                "reviews": []
            }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://maps.googleapis.com/maps/api/place/details/json',
                params={
                    'place_id': PLACE_ID,
                    'fields': 'rating,user_ratings_total,reviews',
                    'language': 'es',
                    'key': GOOGLE_API_KEY
                }
            )
            
            data = response.json()
            result = data.get('result', {})

            return {
                "source": "google",
                "rating": result.get('rating', 0),
                "total": result.get('user_ratings_total', 0),
                "reviews": (result.get('reviews') or [])[:5]
            }
    except Exception as e:
        print(f"Error fetching Google Reviews: {e}")
        return {
            "source": "google",
            "rating": 0,
            "total": 0,
            "reviews": []
        }

# Helper function for Internal Reviews
async def fetch_internal_reviews(room_id: str = None):
    try:
        if not supabase:
            print("Supabase client not initialized")
            return {
                "source": "internal",
                "rating": 0,
                "total": 0,
                "reviews": []
            }

        query = supabase.table('reviews_internal')\
            .select('author_name, rating, comment, created_at')\
            .eq('approved', True)\
            .order('created_at', desc=True)\
            .limit(5)
        
        if room_id:
            query = query.eq('room_id', room_id)
            
        response = query.execute()
        data = response.data

        if not data:
             return {
                "source": "internal",
                "rating": 0,
                "total": 0,
                "reviews": []
            }

        total_rating = sum(r['rating'] for r in data)
        avg_rating = total_rating / len(data) if data else 0

        return {
            "source": "internal",
            "rating": round(avg_rating, 1),
            "total": len(data),
            "reviews": data
        }

    except Exception as e:
        print(f"Error fetching Internal Reviews: {e}")
        return {
            "source": "internal",
            "rating": 0,
            "total": 0,
            "reviews": []
        }

@app.get("/api/reviews/google")
async def get_google_reviews_endpoint():
    return await fetch_google_reviews()

@app.get("/api/reviews/internal")
async def get_internal_reviews_endpoint(room_id: str = Query(None)):
    return await fetch_internal_reviews(room_id)

@app.get("/api/reviews")
async def get_all_reviews(room_id: str = Query(None)):
    # Run both fetchers in parallel
    google, internal = await asyncio.gather(
        fetch_google_reviews(),
        fetch_internal_reviews(room_id)
    )
    
    return {
        "google": google,
        "internal": internal
    }

# ─── Email helpers ────────────────────────────────────────────────────────────

def _get_notify_email() -> str:
    """Lee el correo de notificación del equipo desde site_config, con fallback a MAIL_TO."""
    fallback = os.getenv("MAIL_TO") or os.getenv("MAIL_FROM") or ""
    client = supabase_admin or supabase
    if not client:
        return fallback
    try:
        res = client.table("site_config").select("value").eq("key", "visitas_notify_email").single().execute()
        return (res.data or {}).get("value") or fallback
    except Exception:
        return fallback


def send_visita_emails(visita: dict) -> None:
    """Envía correo de confirmación al visitante + notificación al equipo via SMTP."""
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    mail_from = os.getenv("MAIL_FROM") or smtp_user

    if not smtp_host or not smtp_user or not smtp_pass:
        print("⚠️  SMTP no configurado — se omite envío de correo")
        return

    nombre    = visita.get("nombre", "")
    email_vis = visita.get("email", "")
    whatsapp  = visita.get("whatsapp", "")
    hab_name  = visita.get("habitacion_nombre") or "No especificado"
    fecha     = visita.get("fecha_preferida")   or "No especificada"
    mensaje   = visita.get("mensaje")           or ""

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)

            # ── 1. Confirmación al visitante ──────────────────────────
            msg_vis = EmailMessage()
            msg_vis["Subject"] = "Recibimos tu solicitud de visita · Rentalia Narvarte"
            msg_vis["From"]    = f"Rentalia <{mail_from}>"
            msg_vis["To"]      = email_vis
            msg_vis.set_content(
                f"Hola {nombre},\n\n"
                "Recibimos tu solicitud de visita a Rentalia Narvarte.\n"
                "Te contactaremos en las próximas horas por WhatsApp o correo para confirmar.\n\n"
                f"  • Cuarto de interés : {hab_name}\n"
                f"  • Preferencia       : {fecha}\n\n"
                "¿Tienes prisa? Escríbenos directamente:\n"
                "  https://wa.me/5215523215421\n\n"
                "— Equipo Rentalia"
            )
            msg_vis.add_alternative(
                f"""<!DOCTYPE html><html lang="es"><body style="font-family:Figtree,sans-serif;color:#221F1A;background:#F3EDE1;padding:32px">
<h2 style="color:#1E4D3C">¡Hola, {nombre}!</h2>
<p>Recibimos tu solicitud de visita a <strong>Rentalia Narvarte</strong>.</p>
<p>Te contactaremos en las próximas horas por WhatsApp o correo para confirmar tu visita.</p>
<table style="border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:4px 12px 4px 0;color:#717974">Cuarto de interés</td><td style="font-weight:600">{hab_name}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#717974">Preferencia</td><td style="font-weight:600">{fecha}</td></tr>
</table>
<p>¿Tienes prisa? <a href="https://wa.me/5215523215421" style="color:#1E4D3C;font-weight:600">Escríbenos por WhatsApp</a>.</p>
<hr style="border:none;border-top:1px solid #EAE2D2;margin:24px 0">
<p style="font-size:12px;color:#717974">Rentalia · Narvarte Poniente, CDMX · <a href="https://rentalia.mx">rentalia.mx</a></p>
</body></html>""",
                subtype="html"
            )
            server.send_message(msg_vis)

            # ── 2. Notificación al equipo ─────────────────────────────
            notify_to = _get_notify_email()
            if not notify_to:
                print("⚠️  Sin correo de notificación del equipo configurado")
                return

            msg_team = EmailMessage()
            msg_team["Subject"] = f"🗓 Nueva solicitud de visita — {nombre}"
            msg_team["From"]    = f"Rentalia Notificaciones <{mail_from}>"
            msg_team["To"]      = notify_to
            msg_team.set_content(
                f"Nueva solicitud de visita desde rentalia.mx\n\n"
                f"  Nombre   : {nombre}\n"
                f"  WhatsApp : {whatsapp}\n"
                f"  Correo   : {email_vis}\n"
                f"  Cuarto   : {hab_name}\n"
                f"  Fecha    : {fecha}\n"
                f"  Mensaje  : {mensaje or '—'}\n\n"
                f"Accede al admin: https://admin.rentalia.mx/dashboard/visitas"
            )
            msg_team.add_alternative(
                f"""<!DOCTYPE html><html lang="es"><body style="font-family:Figtree,sans-serif;color:#221F1A;background:#F3EDE1;padding:32px">
<h2 style="color:#1E4D3C">🗓 Nueva solicitud de visita</h2>
<table style="border-collapse:collapse;margin:16px 0;width:100%;max-width:480px">
  <tr style="background:#EAE2D2"><td style="padding:8px 12px;color:#717974;font-size:13px">Nombre</td><td style="padding:8px 12px;font-weight:600">{nombre}</td></tr>
  <tr><td style="padding:8px 12px;color:#717974;font-size:13px">WhatsApp</td><td style="padding:8px 12px"><a href="https://wa.me/{whatsapp}" style="color:#1E4D3C;font-weight:600">{whatsapp}</a></td></tr>
  <tr style="background:#EAE2D2"><td style="padding:8px 12px;color:#717974;font-size:13px">Correo</td><td style="padding:8px 12px"><a href="mailto:{email_vis}" style="color:#1E4D3C">{email_vis}</a></td></tr>
  <tr><td style="padding:8px 12px;color:#717974;font-size:13px">Cuarto</td><td style="padding:8px 12px">{hab_name}</td></tr>
  <tr style="background:#EAE2D2"><td style="padding:8px 12px;color:#717974;font-size:13px">Preferencia</td><td style="padding:8px 12px">{fecha}</td></tr>
  <tr><td style="padding:8px 12px;color:#717974;font-size:13px">Mensaje</td><td style="padding:8px 12px">{mensaje or '—'}</td></tr>
</table>
<p><a href="https://admin.rentalia.mx/dashboard/visitas" style="background:#1E4D3C;color:#F3EDE1;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Ver en el admin panel</a></p>
</body></html>""",
                subtype="html"
            )
            server.send_message(msg_team)

            print(f"✅ Correos enviados para visita de {nombre} ({email_vis})")

    except Exception as e:
        print(f"❌ Error enviando correo SMTP: {e}")


# ─── Review Creation Schema ───────────────────────────────────────────────────

# Review Creation Schema
class ReviewCreate(BaseModel):
    author_name: str
    rating: int
    comment: str
    room_id: str | None = None

# ─── Visitas (agendamiento de visitas) ───────────────────────────────────────

class VisitaCreate(BaseModel):
    nombre: str
    whatsapp: str
    email: str
    habitacion_id: str | None = None
    habitacion_nombre: str | None = None
    fecha_preferida: str | None = None
    mensaje: str | None = None


@app.post("/api/visitas")
async def create_visita(visita: VisitaCreate):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Database connection not available")

    # Validación básica
    if not visita.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    if not visita.whatsapp.strip():
        raise HTTPException(status_code=400, detail="El número de WhatsApp es obligatorio")
    email_pattern = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    if not email_pattern.match(visita.email.strip()):
        raise HTTPException(status_code=400, detail="El correo no tiene un formato válido")

    data: dict = {
        "nombre":            visita.nombre.strip(),
        "whatsapp":          visita.whatsapp.strip(),
        "email":             visita.email.strip().lower(),
        "fecha_preferida":   visita.fecha_preferida or None,
        "mensaje":           visita.mensaje or None,
        "habitacion_nombre": visita.habitacion_nombre or None,
    }
    if visita.habitacion_id:
        data["habitacion_id"] = visita.habitacion_id

    try:
        supabase_admin.table("visitas").insert(data).execute()
    except Exception as e:
        print(f"Error guardando visita: {e}")
        raise HTTPException(status_code=500, detail="Error al guardar la solicitud")

    # Correo best-effort — no tumba la respuesta si el SMTP falla
    try:
        await asyncio.to_thread(send_visita_emails, data)
    except Exception as e:
        print(f"Error en envío de correo (best-effort): {e}")

    return {"message": "Solicitud recibida. Te contactaremos pronto."}


@app.post("/api/reviews/internal")
async def create_review(review: ReviewCreate):
    if not supabase:
            raise HTTPException(status_code=500, detail="Database connection not available")

    # Validate rating
    if not (1 <= review.rating <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    try:
        data = {
            "author_name": review.author_name,
            "rating": review.rating,
            "comment": review.comment,
            "approved": False  # Requires approval
        }
        
        if review.room_id:
            data["room_id"] = review.room_id
            
        response = supabase.table("reviews_internal").insert(data).execute()
        
        return {"message": "Reseña recibida. Pendiente de aprobación."}
    except Exception as e:
        print(f"Error creating review: {e}")
        raise HTTPException(status_code=500, detail="Error al guardar la reseña")
