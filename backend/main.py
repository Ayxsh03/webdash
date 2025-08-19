from fastapi import FastAPI, HTTPException, Query, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncpg
import json
from datetime import datetime, timedelta
from typing import List, Optional
import os
from pydantic import BaseModel, Field
import uuid

app = FastAPI(title="Person Detection API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/detection_db")
API_KEY = os.getenv("API_KEY", "secure-detection-api-key-2024")

# API Key validation
async def validate_api_key(x_api_key: str | None = Header(default=None)):
    if x_api_key is None or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

async def get_db():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# Pydantic models
class DetectionEvent(BaseModel):
    timestamp: datetime
    person_id: int
    confidence: float
    camera_name: str
    image_path: Optional[str] = None
    alert_sent: bool = False
    metadata: dict = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CameraDevice(BaseModel):
    id: Optional[str] = None
    name: str
    rtsp_url: str
    status: str = "offline"
    location: Optional[str] = None
    last_heartbeat: Optional[datetime] = None

class DashboardStats(BaseModel):
    total_events: int
    active_devices: int
    inactive_devices: int
    online_devices: int
    offline_devices: int
    people_detected: int
    events_trend: float
    devices_trend: float
    people_trend: float

# API Routes

@app.get("/api/v1/events/stats", response_model=DashboardStats)
async def get_dashboard_stats(conn: asyncpg.Connection = Depends(get_db)):
    """Get dashboard statistics"""
    try:
        result = await conn.fetchval("SELECT get_dashboard_stats()")
        stats = json.loads(result)
        return DashboardStats(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/events")
async def get_detection_events(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    conn: asyncpg.Connection = Depends(get_db)
):
    """Get paginated detection events"""
    try:
        offset = (page - 1) * limit
        
        # Base query
        where_clause = "WHERE 1=1"
        params = []
        
        if search:
            where_clause += " AND (camera_name ILIKE $1 OR CAST(person_id AS TEXT) ILIKE $1)"
            params.append(f"%{search}%")
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM detection_events {where_clause}"
        total = await conn.fetchval(count_query, *params)
        
        # Get events
        query = f"""
            SELECT id, timestamp, person_id, confidence, camera_name, 
                   image_path, alert_sent, metadata
            FROM detection_events 
            {where_clause}
            ORDER BY timestamp DESC 
            LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}
        """
        params.extend([limit, offset])
        
        rows = await conn.fetch(query, *params)
        events = [dict(row) for row in rows]
        
        return {
            "events": events,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/events")
async def create_detection_event(
    event: DetectionEvent,
    conn: asyncpg.Connection = Depends(get_db),
    api_key_valid: bool = Depends(validate_api_key)
):
    """Create a new detection event"""
    try:
        query = """
            INSERT INTO detection_events 
            (timestamp, person_id, confidence, camera_name, image_path, alert_sent, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, timestamp, person_id, confidence, camera_name, image_path, alert_sent, metadata
        """
        
        # Always convert metadata to JSON string for database storage
        metadata_str = json.dumps(event.metadata) if event.metadata else "{}"
        
        row = await conn.fetchrow(
            query,
            event.timestamp,
            event.person_id,
            event.confidence,
            event.camera_name,
            event.image_path,
            event.alert_sent,
            metadata_str
        )
        
        # Convert the row to a dict and handle metadata parsing
        result = dict(row)
        if isinstance(result['metadata'], str):
            result['metadata'] = json.loads(result['metadata'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/cameras")
async def get_cameras(conn: asyncpg.Connection = Depends(get_db)):
    """Get all cameras"""
    try:
        query = """
            SELECT id, name, rtsp_url, status, location, last_heartbeat
            FROM camera_devices
            ORDER BY name
        """
        rows = await conn.fetch(query)
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/hourly")
async def get_hourly_data(conn: asyncpg.Connection = Depends(get_db)):
    """Get hourly event data for charts"""
    try:
        query = """
            SELECT 
                TO_CHAR(DATE_TRUNC('hour', timestamp), 'HH24:MI') as hour,
                COUNT(*) as events,
                COUNT(DISTINCT person_id) as footfall,
                0 as vehicles
            FROM detection_events 
            WHERE timestamp >= NOW() - INTERVAL '24 hours'
            GROUP BY DATE_TRUNC('hour', timestamp)
            ORDER BY DATE_TRUNC('hour', timestamp)
        """
        rows = await conn.fetch(query)
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/trends")
async def get_trends(conn: asyncpg.Connection = Depends(get_db)):
    """Get trend data"""
    try:
        result = await conn.fetchval("SELECT get_dashboard_stats()")
        stats = json.loads(result)
        return {
            "events_trend": stats.get("events_trend", 0),
            "devices_trend": stats.get("devices_trend", 0),
            "people_trend": stats.get("people_trend", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/cameras/{camera_id}/status")
async def update_camera_status(
    camera_id: str,
    status_data: dict,
    conn: asyncpg.Connection = Depends(get_db)
):
    """Update camera status"""
    try:
        query = """
            UPDATE camera_devices 
            SET status = $1, last_heartbeat = NOW(), updated_at = NOW()
            WHERE id = $2
        """
        await conn.execute(query, status_data["status"], camera_id)
        return {"message": "Status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)