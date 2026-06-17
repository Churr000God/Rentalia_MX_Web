from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .db import init_pool, get_pool
import httpx
import os
import asyncio
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
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

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

# Review Creation Schema
class ReviewCreate(BaseModel):
    author_name: str
    rating: int
    comment: str
    room_id: str | None = None

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
