FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir fastapi uvicorn gunicorn pymysql sqlalchemy asyncpg httpx supabase python-dotenv
COPY backend/ /app/
EXPOSE 8000
CMD ["gunicorn","-k","uvicorn.workers.UvicornWorker","--bind","0.0.0.0:8000","--workers","2","--timeout","60","app.main:app"]
