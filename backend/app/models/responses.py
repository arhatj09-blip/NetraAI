"""
Response Models for API Endpoints
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, List


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Health status (healthy/unhealthy)")
    message: str = Field(..., description="Status message")
    timestamp: datetime = Field(..., description="Current server timestamp")


class PipelineStatusResponse(BaseModel):
    """Pipeline status response"""
    status: str = Field(..., description="Pipeline status (operational/processing/error)")
    message: str = Field(..., description="Status message")
    last_ingestion: datetime = Field(..., description="Timestamp of last data ingestion")
    next_refresh: datetime = Field(..., description="Timestamp of next scheduled refresh")
    records_processed: int = Field(..., description="Total records processed")
    analytics_updated: datetime = Field(..., description="Timestamp of last analytics update")
    health_index: float = Field(..., description="Pipeline health index (0-100)")
    active_platforms: List[str] = Field(..., description="List of active platforms")
    platform_records: Dict[str, int] = Field(..., description="Record count per platform")


class PlatformResponse(BaseModel):
    """Platform information response"""
    id: str = Field(..., description="Platform identifier (x, reddit, telegram)")
    name: str = Field(..., description="Platform display name")
    description: str = Field(..., description="Platform description")
    icon: str = Field(..., description="Icon identifier")
    color: str = Field(..., description="Platform accent color (hex)")
    active: bool = Field(..., description="Whether platform is active")
    record_count: int = Field(..., description="Number of records for this platform")


class DatasetValidationResponse(BaseModel):
    """Validation summary for a processed dataset."""
    total_records: int
    valid_records: int
    invalid_records: int
    duplicate_records: int
    missing_values: Dict[str, int]
    available_columns: List[str]
    required_columns: List[str]
    missing_required_columns: List[str]
    timestamp_range: Dict[str, Dict[str, str]]
    source_file: str
    platform: str
    rejected_reasons: Dict[str, int] = Field(default_factory=dict)


class DatasetProcessingResponse(BaseModel):
    """Processed dataset payload returned by the API."""
    platform: str
    source_file: str
    total_records: int
    data: List[Dict[str, object]]
    validation: DatasetValidationResponse
