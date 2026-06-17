from unittest.mock import MagicMock
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock asyncpg because it is not installed in the environment but used by app.db
sys.modules["asyncpg"] = MagicMock()

# We also need to mock app.db if we want to bypass its internal logic or imports completely
# But since we mocked asyncpg, app.db should be importable now (unless it has other issues)

from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_create_review_success():
    # We mock app.main.supabase to simulate a successful DB connection
    with patch("app.main.supabase") as mock_supabase:
        # Mock the chain: supabase.table().insert().execute()
        mock_table = MagicMock()
        mock_insert = MagicMock()
        mock_execute = MagicMock()
        
        mock_supabase.table.return_value = mock_table
        mock_table.insert.return_value = mock_insert
        mock_insert.execute.return_value = mock_execute
        
        payload = {
            "author_name": "Test User",
            "rating": 5,
            "comment": "Great place!"
        }
        
        response = client.post("/api/reviews/internal", json=payload)
        
        assert response.status_code == 200
        assert response.json() == {"message": "Reseña recibida. Pendiente de aprobación."}
        
        # Verify calls
        mock_supabase.table.assert_called_with("reviews_internal")
        mock_table.insert.assert_called_with({
            "author_name": "Test User",
            "rating": 5,
            "comment": "Great place!",
            "approved": False
        })

def test_create_review_invalid_rating():
    # Even if DB is connected, validation should fail first
    with patch("app.main.supabase") as mock_supabase:
        payload = {
            "author_name": "Test User",
            "rating": 6,
            "comment": "Invalid rating"
        }
        
        response = client.post("/api/reviews/internal", json=payload)
        
        assert response.status_code == 400
        assert "Rating must be between 1 and 5" in response.json()["detail"]

def test_create_review_no_db():
    # Simulate supabase client being None
    with patch("app.main.supabase", None):
        payload = {
            "author_name": "Test User",
            "rating": 5,
            "comment": "No DB"
        }
        
        response = client.post("/api/reviews/internal", json=payload)
        
        assert response.status_code == 500
        assert "Database connection not available" in response.json()["detail"]
