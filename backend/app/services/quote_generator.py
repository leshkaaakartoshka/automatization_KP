"""Simple quote generator without AI."""

from datetime import datetime, timedelta
from typing import Dict, Any

from app.models.schemas import QuoteForm, LookupResult
from app.utils.hash import generate_lead_id
from app.utils.qr_images import get_default_qr_codes, get_company_logo


class QuoteGenerator:
    """Simple quote generator using templates."""
    
    def __init__(self):
        self.company_name = "CPQ System"
        self.contact_info = "+7 (495) 123-45-67"
    
    def generate_quote_data(
        self,
        quote_form: QuoteForm,
        lookup_result: LookupResult
    ) -> Dict[str, Any]:
        """
        Generate quote data without AI.
        
        Args:
            quote_form: Quote form data
            lookup_result: Lookup result with pricing
            
        Returns:
            Dictionary with quote data
        """
        lead_id = generate_lead_id()
        valid_until = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        # Generate options based on frontend data (final_price and selected_tariff)
        # Calculate prices based on frontend data
        base_price = quote_form.batch_cost or 0
        if base_price > 0 and quote_form.final_price:
            # Use frontend calculated prices
            standard_price = quote_form.final_price if quote_form.selected_tariff == "standard" else base_price
            urgent_price = base_price * 2  # +100% for urgent
            strategic_price = base_price * 0.9  # -10% for strategic
        else:
            # Fallback to lookup result
            standard_price = lookup_result.prices.std.price_per_unit * quote_form.qty
            urgent_price = lookup_result.prices.rush.price_per_unit * quote_form.qty
            strategic_price = lookup_result.prices.strategic.price_per_unit * quote_form.qty
        
        options = [
            {
                "name": "Стандарт",
                "price_per_unit_rub": standard_price / quote_form.qty if quote_form.qty > 0 else 0,
                "total_price": standard_price,
                "lead_time": lookup_result.lead_time.std,
                "margin_pct": 0,
                "notes": ["Стандартные сроки изготовления", "Базовая цена"]
            },
            {
                "name": "Срочно",
                "price_per_unit_rub": urgent_price / quote_form.qty if quote_form.qty > 0 else 0,
                "total_price": urgent_price,
                "lead_time": lookup_result.lead_time.rush,
                "margin_pct": 0,
                "notes": ["Ускоренное изготовление", "Дополнительная плата за срочность"]
            },
            {
                "name": "Стратегический",
                "price_per_unit_rub": strategic_price / quote_form.qty if quote_form.qty > 0 else 0,
                "total_price": strategic_price,
                "lead_time": lookup_result.lead_time.strategic,
                "margin_pct": 0,
                "notes": ["Долгосрочное сотрудничество", "Специальные условия"]
            }
        ]
        
        # Generate what's included (empty - remove this section)
        what_included = []
        
        # Generate important notes
        important = [
            f"Предложение действительно до {valid_until}",
            "Минимальный заказ: 50 шт",
            "Возможна доставка по всей России"
        ]
        
        # Get default QR codes and logo
        default_qr_codes = get_default_qr_codes()
        company_logo = get_company_logo()
        
        # Generate CTA with contact info
        cta = {
            "contact_info": {
                "telegram": "@rusfart1",
                "phone": "+79931401814",
                "whatsapp": "+79931401814"
            },
            "qr_codes": {
                "whatsapp_qr": default_qr_codes.get("whatsapp_qr"),
                "telegram_qr": default_qr_codes.get("telegram_qr")
            },
            "company_logo": company_logo
        }
        
        # Generate HTML content
        html_content = self._generate_html_content(
            quote_form, lookup_result, lead_id, valid_until, options, 
            what_included, important, cta
        )
        
        return {
            "lead_id": lead_id,
            "echo_price_hash": "no-ai-hash",  # Placeholder for compatibility
            "summary": {
                "fefco": quote_form.fefco,
                "dimensions_mm": {
                    "x": quote_form.x_mm,
                    "y": quote_form.y_mm,
                    "z": quote_form.z_mm
                },
                "material": quote_form.cardboard_type,
                "print": quote_form.print or "Нет",
                "qty": quote_form.qty,
                "sku": lookup_result.sku
            },
            "options": options,
            "what_included": what_included,
            "important": important,
            "cta": cta,
            "html_block": html_content
        }
    
    def _generate_html_content(
        self,
        quote_form: QuoteForm,
        lookup_result: LookupResult,
        lead_id: str,
        valid_until: str,
        options: list,
        what_included: list,
        important: list,
        cta: dict
    ) -> str:
        """Generate HTML content for PDF."""
        
        # Use total prices from options
        total_prices = []
        for option in options:
            total_prices.append({
                "name": option["name"],
                "total": option["total_price"]
            })
        
        # Get contact name and prepare greeting
        if quote_form.contact_name and quote_form.contact_name.strip():
            greeting_text = f"Доброго времени суток, {quote_form.contact_name}! Благодарим вас за выбор нашей компании, чтобы наше сотрудничество было наиболее для вас удобным продублировали для вас ваш заказ:"
        else:
            greeting_text = "Доброго времени суток! Благодарим вас за выбор нашей компании, чтобы наше сотрудничество было наиболее для вас удобным продублировали для вас ваш заказ:"
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Коммерческое предложение {lead_id}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .greeting {{
            font-size: 14pt;
            line-height: 1.6;
            margin-bottom: 25px;
            margin-top: 100px;
            padding-top: 20px;
        }}
        .order-info {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .order-info h3 {{
            margin: 0 0 15px 0;
            color: #111827;
            font-size: 16pt;
        }}
        .order-list {{
            margin: 0;
            padding-left: 20px;
        }}
        .order-list li {{
            margin: 8px 0;
            font-size: 14pt;
        }}
        .pricing-section {{
            margin: 25px 0;
        }}
        .pricing-section h3 {{
            margin: 0 0 15px 0;
            color: #111827;
            font-size: 16pt;
        }}
        .pricing-options {{
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
        }}
        .pricing-option {{
            text-align: center;
            padding: 15px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            flex: 1;
            margin: 0 5px;
        }}
        .pricing-option h4 {{
            margin: 0 0 10px 0;
            color: #111827;
            font-size: 14pt;
        }}
        .pricing-option .price {{
            font-size: 18pt;
            font-weight: bold;
            color: #004277;
        }}
        .section {{
            margin-bottom: 25px;
        }}
        .section h2 {{
            background: #f0d020;
            padding: 10px;
            margin: 0 0 15px 0;
            color: #111827;
            font-size: 16pt;
            border-radius: 4px;
        }}
        .list {{
            margin: 10px 0;
        }}
        .list li {{
            margin: 6px 0;
        }}
        .cta {{
            background: #004277;
            color: white;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
            margin-top: 20px;
        }}
        .cta h3 {{
            margin: 0 0 10px 0;
        }}
        .contact-info {{
            margin-top: 15px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }}
        .contact-info p {{
            margin: 8px 0;
            font-size: 14pt;
        }}
        
        /* Стили для ссылок */
        .contact-link {{
            color: #004277;
            text-decoration: none;
            font-weight: bold;
        }}
        
        .contact-link:hover {{
            color: #003366;
            text-decoration: underline;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            text-align: center;
            font-size: 14pt;
            color: #4b5563;
        }}
        .qr-section {{
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }}
        .qr-section h3 {{
            font-size: 14pt;
            color: #111827;
            margin: 0 0 15px 0;
            text-align: center;
        }}
        .qr-codes {{
            display: flex;
            justify-content: center;
            gap: 30px;
            align-items: center;
        }}
        .qr-item {{
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        .qr-code {{
            width: 80px;
            height: 80px;
            margin-bottom: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
        }}
        .qr-label {{
            font-size: 9pt;
            color: #4b5563;
            font-weight: bold;
        }}
        
        /* Company logo */
        .company-logo {{
            position: absolute;
            top: 15px;
            left: 15px;
            max-width: 60px;
            max-height: 30px;
            z-index: 10;
        }}
        
        .header-with-logo {{
            position: relative;
            padding-left: 80px;
            margin-top: 20px;
        }}
        
        .greeting {{
            margin-top: 100px;
            padding-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        {self._generate_logo_html(cta["company_logo"])}
        <div class="greeting">
            <p>{greeting_text}</p>
        </div>
        
        <div class="order-info">
            <h3>Ваш заказ:</h3>
            <ol class="order-list">
                <li>Код FEFCO: {quote_form.fefco.value}</li>
                <li>Тип картона: {quote_form.cardboard_type.value}</li>
                <li>Марка картона: {quote_form.cardboard_grade or "не указана"}</li>
                <li>Печать: {quote_form.print.value if quote_form.print else "Нет"}</li>
                <li>Количество: {quote_form.qty:,} шт</li>
            </ol>
        </div>
        
        <div class="pricing-section">
            <h3>Мы предлагаем всем клиентам сотрудничество в трех вариантах цены:</h3>
            <div class="pricing-options">
        """
        
        for option in options:
            html += f"""
                <div class="pricing-option">
                    <h4>{option["name"]}</h4>
                    <div class="price">{option["total_price"]:,.0f} руб</div>
                </div>
            """
        
        html += """
            </div>
        </div>
        
        <div class="section">
            <h2>Важная информация</h2>
            <ul class="list">
        """
        
        for item in important:
            html += f"<li>{item}</li>"
        
        html += f"""
            </ul>
        </div>
        
        <div class="cta">
            <h3>Готовы заказать?</h3>
            <p>Свяжитесь с нами для подтверждения заказа</p>
            <div class="contact-info">
                <p><strong>Наш Telegram:</strong> <a href="https://t.me/rusfart1" class="contact-link" target="_blank">@rusfart1</a></p>
                <p><strong>Телефон:</strong> <a href="tel:+79931401814" class="contact-link">{cta["contact_info"]["phone"]}</a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/79931401814" class="contact-link" target="_blank">{cta["contact_info"]["whatsapp"]}</a></p>
            </div>
        </div>
        
        {self._generate_qr_section(cta["qr_codes"])}
        
        <div class="footer">
            <p>С уважением ООО "ЭКО-РУСФАРТ"</p>
        </div>
    </div>
</body>
</html>
        """
        
        return html
    
    def _generate_qr_section(self, qr_codes: dict) -> str:
        """Generate QR codes section HTML."""
        whatsapp_qr = qr_codes.get("whatsapp_qr")
        telegram_qr = qr_codes.get("telegram_qr")
        
        if not whatsapp_qr and not telegram_qr:
            return ""
        
        qr_html = """
        <div class="qr-section">
            <h3>Свяжитесь с нами</h3>
            <div class="qr-codes">
        """
        
        if whatsapp_qr:
            qr_html += f"""
                <div class="qr-item">
                    <img src="data:image/png;base64,{whatsapp_qr}" alt="WhatsApp QR" class="qr-code" />
                    <div class="qr-label">WhatsApp</div>
                </div>
            """
        
        if telegram_qr:
            qr_html += f"""
                <div class="qr-item">
                    <img src="data:image/png;base64,{telegram_qr}" alt="Telegram QR" class="qr-code" />
                    <div class="qr-label">Telegram</div>
                </div>
            """
        
        qr_html += """
            </div>
        </div>
        """
        
        return qr_html
    
    def _generate_logo_html(self, company_logo: str) -> str:
        """Generate company logo HTML."""
        if not company_logo:
            return ""
        
        return f"""
        <div class="company-logo">
            <img src="data:image/png;base64,{company_logo}" alt="Rusfart Logo" />
        </div>
        """
