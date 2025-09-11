"""Pydantic models for all data contracts."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


# Enums for validation
class FEFCOType(str, Enum):
    """Valid FEFCO codes."""
    FEFCO_0200 = "0200"
    FEFCO_0201 = "0201"
    FEFCO_0202 = "0202"
    FEFCO_0203 = "0203"
    FEFCO_0204 = "0204"
    FEFCO_0205 = "0205"
    FEFCO_0206 = "0206"
    FEFCO_0207 = "0207"
    FEFCO_0208 = "0208"
    FEFCO_0209 = "0209"
    FEFCO_0210 = "0210"
    FEFCO_0211 = "0211"
    FEFCO_0215 = "0215"
    FEFCO_0426 = "0426"
    FEFCO_0427 = "0427"
    FEFCO_501 = "501"


class MaterialType(str, Enum):
    """Valid material types."""
    THREE_LAYER = "3-х слойный гофрокартон"
    THREE_LAYER_MICRO = "3-х слойный микрогофрокартон"


class PrintType(str, Enum):
    """Valid print types."""
    YES = "Да"
    NO = "Нет"


class SLAType(str, Enum):
    """Valid SLA types."""
    STANDARD = "стандарт"
    RUSH = "срочно"
    ECONOMY = "эконом"


class OptionType(str, Enum):
    """Valid option types for LLM response."""
    STANDARD = "Стандарт"
    RUSH = "Срочно"
    STRATEGIC = "Стратегический"


# Request/Response Models
class QuoteForm(BaseModel):
    """Quote form data from frontend."""
    
    # Box specifications
    fefco: FEFCOType
    cardboard_type: MaterialType
    cardboard_grade: Optional[str] = Field(None, max_length=50)
    x_mm: int = Field(..., ge=20, le=3000, description="Width in mm")
    y_mm: int = Field(..., ge=20, le=3000, description="Length in mm")
    z_mm: int = Field(..., ge=20, le=3000, description="Height in mm")
    
    # Material and print
    print: Optional[PrintType] = None
    
    # Quantity
    qty: int = Field(..., ge=1, le=100000, description="Quantity")
    sla_type: SLAType
    batch_cost: Optional[int] = Field(None, ge=0, le=10000000)
    
    # Additional fields from frontend
    selected_tariff: Optional[str] = Field(None, max_length=50)
    final_price: Optional[float] = Field(None, ge=0)
    
    # Company information
    company: Optional[str] = Field(None, max_length=200)
    contact_name: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    tg_username: Optional[str] = Field(None, max_length=50)
    
    # Optional consent flag for GDPR/152-FZ
    consent_given: Optional[bool] = Field(False)
    
    @field_validator('print', 'tg_username', mode='before')
    @classmethod
    def convert_undefined_to_none(cls, v):
        """Convert undefined values to None."""
        if v is None or v == 'undefined' or v == '':
            return None
        return v
    
    @field_validator('cardboard_grade')
    @classmethod
    def validate_cardboard_grade(cls, v, info):
        """Validate cardboard_grade is required for 3-х слойный гофрокартон."""
        cardboard_type = info.data.get('cardboard_type')
        if cardboard_type == MaterialType.THREE_LAYER and (not v or v.strip() == ''):
            raise ValueError('Марка картона обязательна для 3-х слойного гофрокартона')
        return v
    
    @model_validator(mode='after')
    def validate_cardboard_grade_required(self):
        """Validate cardboard_grade is required for 3-х слойный гофрокартон."""
        if (self.cardboard_type == MaterialType.THREE_LAYER and 
            (not self.cardboard_grade or self.cardboard_grade.strip() == '')):
            raise ValueError('Марка картона обязательна для 3-х слойного гофрокартона')
        return self


class QuoteResponse(BaseModel):
    """Response from quote endpoint."""
    ok: bool
    pdf_url: Optional[str] = None
    lead_id: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: Literal["ok"] = "ok"


# Lookup Models
class QtyBand(BaseModel):
    """Quantity band definition."""
    min: int
    max: int


class LeadTime(BaseModel):
    """Lead time definitions."""
    std: str
    rush: str
    strategic: str


class PriceInfo(BaseModel):
    """Price information for a specific SLA type."""
    price_per_unit: float
    margin_pct: float


class Prices(BaseModel):
    """Price information for all SLA types."""
    std: PriceInfo
    rush: PriceInfo
    strategic: PriceInfo


class LookupResult(BaseModel):
    """Result from price lookup."""
    sku: str
    qty_band: QtyBand
    lead_time: LeadTime
    prices: Prices
    terms: List[str]


# Quote Generator Models (simplified without AI)
class QuoteData(BaseModel):
    """Generated quote data."""
    lead_id: str
    echo_price_hash: str
    summary: Dict[str, Any]
    options: List[Dict[str, Any]]
    what_included: List[str]
    important: List[str]
    cta: Dict[str, Any]
    html_block: str


# Error Models
class ErrorResponse(BaseModel):
    """Error response format."""
    ok: bool = False
    error: str