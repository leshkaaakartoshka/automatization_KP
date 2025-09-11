"""Mock lookup provider for testing."""

from typing import Optional

from app.core.config import Settings
from app.models.schemas import LookupResult, PriceInfo, Prices, QtyBand, LeadTime
from app.providers.lookup.base import LookupProvider


class MockLookupProvider(LookupProvider):
    """Mock implementation of lookup provider for testing."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
    
    async def lookup_price(
        self,
        fefco: str,
        x_mm: int,
        y_mm: int,
        z_mm: int,
        material: str,
        print: str,
        sla_type: str,
        qty: int,
    ) -> Optional[LookupResult]:
        """Return mock lookup result for testing."""
        
        # Return mock data for any request
        return LookupResult(
            sku=f"SKU-{fefco}-{x_mm}x{y_mm}x{z_mm}",
            qty_band=QtyBand(min=100, max=10000),
            lead_time=LeadTime(
                std="5-7 рабочих дней",
                rush="2-3 рабочих дня",
                strategic="10-14 рабочих дней"
            ),
            prices=Prices(
                std=PriceInfo(price_per_unit=15.50, margin_pct=25.0),
                rush=PriceInfo(price_per_unit=18.50, margin_pct=30.0),
                strategic=PriceInfo(price_per_unit=12.50, margin_pct=20.0)
            ),
            terms=[
                "Цены указаны без учета НДС",
                "Минимальный заказ 100 штук",
                "Доставка по Москве бесплатно",
                "Предоплата 50%"
            ]
        )
    
    async def health_check(self) -> bool:
        """Always return True for mock."""
        return True
