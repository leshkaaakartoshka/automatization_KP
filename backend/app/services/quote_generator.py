"""Simple quote generator without AI."""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import base64
from pathlib import Path

from app.models.schemas import QuoteForm, LookupResult
from app.utils.hash import generate_lead_id
from app.utils.qr_images import get_default_qr_codes, get_company_logo
from app.utils.workdays import get_tariff_delivery_dates


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
        valid_until = (datetime.now() + timedelta(hours=72)).strftime("%Y-%m-%d")
        
        # Calculate prices based on unit_price from frontend
        unit_price = quote_form.unit_price
        qty = quote_form.qty
        
        # Get delivery dates for all tariffs based on custom days
        delivery_dates = get_tariff_delivery_dates(
            10,  # Default delivery days
            custom_standard_days=quote_form.custom_standard_days,
            custom_urgent_days=quote_form.custom_urgent_days,
            custom_strategic_days=quote_form.custom_strategic_days
        )
        
        # Calculate base prices for each tariff
        base_price = unit_price * qty
        
        # Use custom prices if provided, otherwise calculate based on delivery days
        standard_price = quote_form.custom_standard_price or base_price
        urgent_price = quote_form.custom_urgent_price or (base_price * 1.2)
        strategic_price = quote_form.custom_strategic_price or (base_price * 0.85)
        
        # Filter options based on selected tariffs
        all_options = [
            {
                "name": "Стандарт",
                "type": "standard",
                "price_per_unit_rub": standard_price / qty,
                "total_price": standard_price,
                "lead_time": f"{delivery_dates['standard']['days']} рабочих дней",
                "delivery_date": delivery_dates['standard']['formatted_date'],
                "margin_pct": 0,
                "notes": ["Базовая цена без изменений", f"{delivery_dates['standard']['days']} рабочих дней"],
                "is_custom_price": quote_form.custom_standard_price is not None,
                "is_custom_days": quote_form.custom_standard_days is not None
            },
            {
                "name": "Срочно",
                "type": "urgent",
                "price_per_unit_rub": urgent_price / qty,
                "total_price": urgent_price,
                "lead_time": f"{delivery_dates['urgent']['days']} рабочих дней",
                "delivery_date": delivery_dates['urgent']['formatted_date'],
                "margin_pct": 0,
                "notes": ["Ускоренное изготовление", f"{delivery_dates['urgent']['days']} рабочих дней"],
                "is_custom_price": quote_form.custom_urgent_price is not None,
                "is_custom_days": quote_form.custom_urgent_days is not None
            },
            {
                "name": "Стратегический",
                "type": "strategic",
                "price_per_unit_rub": strategic_price / qty,
                "total_price": strategic_price,
                "lead_time": f"{delivery_dates['strategic']['days']} рабочих дней",
                "delivery_date": delivery_dates['strategic']['formatted_date'],
                "margin_pct": 0,
                "notes": ["Долгосрочное сотрудничество", f"{delivery_dates['strategic']['days']} рабочих дней"],
                "is_custom_price": quote_form.custom_strategic_price is not None,
                "is_custom_days": quote_form.custom_strategic_days is not None
            }
        ]
        
        # Filter options based on selected tariffs
        if quote_form.selected_tariffs and len(quote_form.selected_tariffs) > 0:
            options = [opt for opt in all_options if opt["type"] in quote_form.selected_tariffs]
        else:
            options = []
        
        # Generate what's included (empty - remove this section)
        what_included = []
        
        # Generate important notes
        important = [
            f"Предложение действительно до {valid_until}",
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
            what_included, important, cta, delivery_dates
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
        cta: dict,
        delivery_dates: dict
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
        contact_name = quote_form.contact_name.strip() if quote_form.contact_name else ""
        if contact_name:
            greeting_text = f"Доброго времени суток, {contact_name}! Благодарим вас за выбор нашей компании, чтобы наше сотрудничество было наиболее для вас удобным продублировали для вас ваш заказ:"
        else:
            greeting_text = "Доброго времени суток! Благодарим вас за выбор нашей компании, чтобы наше сотрудничество было наиболее для вас удобным продублировали для вас ваш заказ:"
        
        # Prepare SVG emoji data URIs using paths relative to this file
        base_dir = Path(__file__).resolve().parents[1]  # backend/app
        emoji_dir = base_dir / "static" / "emoji"
        emoji_paths = {
            "Стандарт": str(emoji_dir / "checkpoint.svg"),
            "Срочно": str(emoji_dir / "fire.svg"),
            "Стратегический": str(emoji_dir / "biceps.svg"),
        }
        emoji_data_uris: Dict[str, str] = {}
        for name, p in emoji_paths.items():
            try:
                svg_bytes = Path(p).read_bytes()
                b64 = base64.b64encode(svg_bytes).decode("utf-8")
                emoji_data_uris[name] = f"data:image/svg+xml;base64,{b64}"
            except Exception:
                # If file is missing, log and skip icon for this tariff
                print(f"SVG icon missing or unreadable for {name}: {p}")

        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Коммерческое предложение {lead_id}</title>
    <style>
        @font-face {{
            font-family: "DejaVuSans";
            src: local("DejaVu Sans"),
                 url("file:///usr/share/fonts/truetype/dejavu/DejaVuSans.ttf") format("truetype");
            font-weight: 400; font-style: normal;
        }}
        @font-face {{
            font-family: "DejaVuSans";
            src: local("DejaVu Sans Bold"),
                 url("file:///usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf") format("truetype");
            font-weight: 700; font-style: normal;
        }}
        body {{
            font-family: "DejaVu Sans", "Liberation Sans", Arial, Helvetica, "Noto Sans", "Nimbus Sans", sans-serif;
            letter-spacing: 0;
            word-spacing: 0;
            font-kerning: normal;
            font-variant-numeric: normal;
            font-feature-settings: normal;
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
        .tariff-list {{
            margin: 20px 0;
        }}
        .tariff-item {{
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            background-color: #f9fafb;
        }}
        .tariff-header {{
            font-size: 16pt;
            font-weight: bold;
            color: #111827;
            margin-bottom: 10px;
        }}
        .tariff-calculation {{
            font-size: 14pt;
            color: #374151;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
        }}
        .tariff-timeline {{
            font-size: 12pt;
            color: #6b7280;
            margin: 8px 0;
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
            color: #ffffff;
            font-weight: 700;
        }}
        /* Numeric tabular alignment utility */
        .nums {{
            font-variant-numeric: tabular-nums;
            font-feature-settings: 'tnum' 1, 'lnum' 1;
        }}
        /* Inline emoji icon */
        .emoji-img {{
            width: 18px;
            height: 18px;
            vertical-align: -3px;
            margin-right: 6px;
        }}
        
        /* Стили для ссылок */
        .contact-link {{
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
        }}
        
        .contact-link:hover {{
            color: #e0e0e0;
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
        
        /* Volume-price section */
        .volume-price-list {{
            margin: 15px 0;
        }}
        
        .volume-price-item {{
            font-size: 14pt;
            margin: 8px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }}
        
        .volume-price-item:last-child {{
            border-bottom: none;
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
            <ol class="order-list nums">
                <li>Код FEFCO: {quote_form.fefco.value}</li>
                <li>Тип картона: {quote_form.cardboard_type.value}</li>
                <li>Марка картона: {quote_form.cardboard_grade or "не указано"}</li>
                <li>Печать: {quote_form.print.value if quote_form.print else "не указано"}</li>
                <li>Количество: {quote_form.qty:,} шт</li>
                <li>Размеры коробки: {quote_form.x_mm} мм/{quote_form.y_mm} мм/{quote_form.z_mm} мм</li>
                <li>Штамп: {self._format_die_cut_form(quote_form.die_cut_form)}</li>
            </ol>
        </div>
        """
        
        # Generate tariff section only if there are selected tariffs
        if options:
            html += """
        <div class="pricing-section">
            <h3>Мы предлагаем всем клиентам сотрудничество в трех вариантах цены:</h3>
            <div class="tariff-list">
        """
            
            # Generate tariff items with SVG icons
            
            for option in options:
                img_src = emoji_data_uris.get(option["name"]) or ""
                emoji_html = f'<img src="{img_src}" class="emoji-img" alt="" />' if img_src else ""
                custom_price_indicator = " (цена настроена)" if option.get("is_custom_price", False) else ""
                custom_days_indicator = " (срок настроен)" if option.get("is_custom_days", False) else ""
                indicators = custom_price_indicator + custom_days_indicator
                # Точный расчет цены за единицу без округления
                price_per_unit = option['total_price'] / quote_form.qty
                price_per_unit_str = f"{price_per_unit:,.10f}".rstrip('0').rstrip('.')
                qty_formatted = f"{quote_form.qty:,}"
                total_price = f"{option['total_price']:,.0f}"
                
                html += f"""
                    <div class="tariff-item">
                        <div class="tariff-header">{emoji_html}{option["name"].lower()}</div>
                        <div class="tariff-calculation nums">
                            {price_per_unit_str} руб x {qty_formatted} шт = {total_price} руб
                        </div>
                        <div class="tariff-timeline nums">
                            Сроки работ: {option["lead_time"]}<br>
                            Готовность: {option["delivery_date"]}
                        </div>
                    </div>
                """
            
            html += """
            </div>
        </div>
        """
        
        # Generate volume-price section if there are pairs
        if quote_form.volume_price_pairs and len(quote_form.volume_price_pairs) > 0:
            html += """
        <div class="pricing-section">
            <h3>Соотношение цены к количеству:</h3>
            <div class="tariff-list">
        """
            for idx, pair in enumerate(quote_form.volume_price_pairs, 1):
                if pair.get("volume") and pair.get("price"):
                    html += f"""
                <div class="tariff-item">
                    <div class="tariff-calculation">
                        {idx}. {pair["volume"]} шт — {pair["price"]} руб. за штуку
                    </div>
                </div>
            """
            html += """
            </div>
        </div>
        """
        
        html += """
        <div class="section">
            <h2>Важная информация</h2>
            <ul class="list nums">
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
                <p><strong>Телефон:</strong> <a href="tel:+79931401814" class="contact-link"><span class="nums">{cta["contact_info"]["phone"]}</span></a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/79931401814" class="contact-link" target="_blank"><span class="nums">{cta["contact_info"]["whatsapp"]}</span></a></p>
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
    
    def _format_die_cut_form(self, die_cut_form: Optional[float]) -> str:
        """Format die cut form value for display."""
        if die_cut_form is None or die_cut_form == 0:
            return "не указано"
        
        # Convert to thousands and format with comma
        value_in_thousands = die_cut_form / 1000
        return f"{value_in_thousands:,.1f} т.р."
    
    def _generate_logo_html(self, company_logo: str) -> str:
        """Generate company logo HTML."""
        if not company_logo:
            return ""
        
        return f"""
        <div class="company-logo">
            <img src="data:image/png;base64,{company_logo}" alt="Rusfart Logo" />
        </div>
        """
