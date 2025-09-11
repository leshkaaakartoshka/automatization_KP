"""Tests for data validation."""

import pytest
from pydantic import ValidationError

from app.models.schemas import (
    QuoteForm, FEFCOType, MaterialType, PrintType, SLAType
)


class TestValidation:
    """Test data validation."""
    
    def test_valid_quote_form(self):
        """Test valid quote form."""
        form = QuoteForm(
            fefco=FEFCOType.FEFCO_0201,
            cardboard_type=MaterialType.THREE_LAYER,
            cardboard_grade="Т21 крафт",
            x_mm=300,
            y_mm=200,
            z_mm=150,
            print=PrintType.YES,
            qty=1000,
            sla_type=SLAType.STANDARD,
            company="ООО Ромашка",
            contact_name="Иван",
            city="Уфа",
            phone="+7 999 000-00-00",
            email="test@example.com",
            consent_given=True
        )
        
        assert form.fefco == FEFCOType.FEFCO_0201
        assert form.x_mm == 300
        assert form.email == "test@example.com"
        assert form.cardboard_type == MaterialType.THREE_LAYER
        assert form.cardboard_grade == "Т21 крафт"
    
    def test_invalid_dimensions(self):
        """Test invalid dimensions."""
        with pytest.raises(ValidationError):
            QuoteForm(
                fefco=FEFCOType.FEFCO_0201,
                cardboard_type=MaterialType.THREE_LAYER,
                cardboard_grade="Т21 крафт",
                x_mm=10,  # Too small
                y_mm=200,
                z_mm=150,
                print=PrintType.YES,
                qty=1000,
                sla_type=SLAType.STANDARD,
                company="ООО Ромашка",
                contact_name="Иван",
                city="Уфа",
                phone="+7 999 000-00-00",
                email="test@example.com"
            )
    
    def test_invalid_quantity(self):
        """Test invalid quantity."""
        with pytest.raises(ValidationError):
            QuoteForm(
                fefco=FEFCOType.FEFCO_0201,
                cardboard_type=MaterialType.THREE_LAYER,
                cardboard_grade="Т21 крафт",
                x_mm=300,
                y_mm=200,
                z_mm=150,
                print=PrintType.YES,
                qty=0,  # Too small
                sla_type=SLAType.STANDARD,
                company="ООО Ромашка",
                contact_name="Иван",
                city="Уфа",
                phone="+7 999 000-00-00",
                email="test@example.com"
            )
    
    def test_invalid_email(self):
        """Test invalid email format."""
        with pytest.raises(ValidationError):
            QuoteForm(
                fefco=FEFCOType.FEFCO_0201,
                cardboard_type=MaterialType.THREE_LAYER,
                cardboard_grade="Т21 крафт",
                x_mm=300,
                y_mm=200,
                z_mm=150,
                print=PrintType.YES,
                qty=1000,
                sla_type=SLAType.STANDARD,
                company="ООО Ромашка",
                contact_name="Иван",
                city="Уфа",
                phone="+7 999 000-00-00",
                email="invalid-email"  # Invalid format
            )
    
    def test_cardboard_grade_required_for_three_layer(self):
        """Test that cardboard_grade is required for 3-х слойный гофрокартон."""
        with pytest.raises(ValidationError):
            QuoteForm(
                fefco=FEFCOType.FEFCO_0201,
                cardboard_type=MaterialType.THREE_LAYER,
                # cardboard_grade missing - should fail
                x_mm=300,
                y_mm=200,
                z_mm=150,
                print=PrintType.YES,
                qty=1000,
                sla_type=SLAType.STANDARD,
                company="ООО Ромашка",
                contact_name="Иван",
                city="Уфа",
                phone="+7 999 000-00-00",
                email="test@example.com"
            )
    
    def test_cardboard_grade_not_required_for_micro(self):
        """Test that cardboard_grade is not required for микрогофрокартон."""
        form = QuoteForm(
            fefco=FEFCOType.FEFCO_0201,
            cardboard_type=MaterialType.THREE_LAYER_MICRO,
            # cardboard_grade missing - should be OK
            x_mm=300,
            y_mm=200,
            z_mm=150,
            print=PrintType.YES,
            qty=1000,
            sla_type=SLAType.STANDARD,
            company="ООО Ромашка",
            contact_name="Иван",
            city="Уфа",
            phone="+7 999 000-00-00",
            email="test@example.com"
        )
        
        assert form.cardboard_type == MaterialType.THREE_LAYER_MICRO
        assert form.cardboard_grade is None
    
    def test_additional_fields_from_frontend(self):
        """Test additional fields from frontend."""
        form = QuoteForm(
            fefco=FEFCOType.FEFCO_0201,
            cardboard_type=MaterialType.THREE_LAYER,
            cardboard_grade="Т21 крафт",
            x_mm=300,
            y_mm=200,
            z_mm=150,
            print=PrintType.YES,
            qty=1000,
            sla_type=SLAType.STANDARD,
            selected_tariff="standard",
            final_price=50000.0,
            company="ООО Ромашка",
            contact_name="Иван",
            city="Уфа",
            phone="+7 999 000-00-00",
            email="test@example.com",
            tg_username="@testuser",
            consent_given=True
        )
        
        assert form.selected_tariff == "standard"
        assert form.final_price == 50000.0
        assert form.tg_username == "@testuser"
        assert form.consent_given is True