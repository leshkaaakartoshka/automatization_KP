"""PDF generation service using WeasyPrint."""

import os
from pathlib import Path
from typing import Optional

from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

from app.core.config import Settings


class PDFService:
    """Service for generating PDFs from HTML."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.pdf_dir = Path(settings.pdf_dir)
        self.pdf_dir.mkdir(exist_ok=True)
        
        # Font configuration for Cyrillic support
        self.font_config = FontConfiguration()
    
    def _get_css_styles(self) -> str:
        """Get CSS styles for PDF generation."""
        return """
        @font-face {
            font-family: "DejaVuSans";
            src: local("DejaVu Sans"),
                 url("file:///usr/share/fonts/truetype/dejavu/DejaVuSans.ttf") format("truetype");
            font-weight: 400; font-style: normal;
        }
        @font-face {
            font-family: "DejaVuSans";
            src: local("DejaVu Sans Bold"),
                 url("file:///usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf") format("truetype");
            font-weight: 700; font-style: normal;
        }
        @page {
            size: A4;
            margin: 2cm;
            @top-center {
                content: "Коммерческое предложение";
                font-family: Arial, sans-serif;
                font-size: 12pt;
                color: #666;
            }
        }
        
        body {
            font-family: "DejaVu Sans", "Liberation Sans", Arial, Helvetica, "Noto Sans", "Nimbus Sans", sans-serif;
            letter-spacing: 0;
            word-spacing: 0;
            font-kerning: normal;
            font-variant-numeric: normal;
            font-feature-settings: normal;
            font-size: 11pt;
            line-height: 1.4;
            color: #333;
        }
        
        
        .header {
            text-align: center;
            margin-bottom: 2cm;
            border-bottom: 2px solid #007bff;
            padding-bottom: 1cm;
        }
        
        .header h1 {
            color: #007bff;
            font-size: 24pt;
            margin: 0;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 12pt;
            margin-top: 0.5cm;
        }
        
        .lead-info {
            background-color: #f8f9fa;
            padding: 1cm;
            border-radius: 5px;
            margin-bottom: 1cm;
        }
        
        .lead-info h2 {
            color: #007bff;
            font-size: 14pt;
            margin-top: 0;
        }
        
        .lead-info .info-row {
            display: flex;
            margin-bottom: 0.5cm;
        }
        
        .lead-info .info-label {
            font-weight: bold;
            width: 3cm;
            flex-shrink: 0;
        }
        
        .options {
            margin-top: 1cm;
        }
        
        .option {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 1cm;
            margin-bottom: 1cm;
            page-break-inside: avoid;
        }
        
        .option-header {
            background-color: #007bff;
            color: white;
            padding: 0.5cm;
            margin: -1cm -1cm 1cm -1cm;
            border-radius: 5px 5px 0 0;
        }
        
        .option-header h3 {
            margin: 0;
            font-size: 16pt;
        }
        
        .price {
            font-size: 18pt;
            font-weight: bold;
            color: #28a745;
            margin: 0.5cm 0;
        }
        
        .lead-time {
            color: #666;
            font-style: italic;
        }
        
        .notes {
            margin-top: 0.5cm;
        }
        
        .notes ul {
            margin: 0;
            padding-left: 1cm;
        }
        
        .what-included, .important {
            margin-top: 1cm;
        }
        
        .what-included h3, .important h3 {
            color: #007bff;
            font-size: 14pt;
        }
        
        .what-included ul, .important ul {
            margin: 0;
            padding-left: 1cm;
        }
        
        .cta {
            background-color: #28a745;
            color: white;
            padding: 1cm;
            border-radius: 5px;
            text-align: center;
            margin-top: 1cm;
        }
        
        .cta h3 {
            margin-top: 0;
            font-size: 16pt;
        }
        
        .cta .confirm-variants {
            font-size: 14pt;
            font-weight: bold;
            margin: 0.5cm 0;
        }

        /* Ensure contact numbers render white and bold on blue background */
        .contact-info p {
            color: #ffffff;
            font-weight: 700;
        }
        
        .footer {
            margin-top: 2cm;
            text-align: center;
            font-size: 10pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 1cm;
        }
        
        .valid-until {
            color: #dc3545;
            font-weight: bold;
        }
        
        /* QR codes section */
        .qr-section {
            margin-top: 1cm;
            padding: 0.5cm;
            background-color: #f8f9fa;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        
        .qr-section h3 {
            font-size: 14pt;
            color: #333;
            margin: 0 0 0.5cm 0;
            text-align: center;
        }
        
        .qr-codes {
            display: flex;
            justify-content: center;
            gap: 1cm;
            align-items: center;
        }
        
        .qr-item {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .qr-code {
            width: 80px;
            height: 80px;
            margin-bottom: 0.2cm;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .qr-label {
            font-size: 9pt;
            color: #666;
            font-weight: bold;
        }
        """
    
    async def html_to_pdf(
        self,
        html_content: str,
        output_path: str,
        lead_id: str
    ) -> str:
        """
        Convert HTML to PDF using WeasyPrint.
        
        Args:
            html_content: HTML content to convert
            output_path: Path where to save the PDF
            lead_id: Lead ID for logging
            
        Returns:
            Path to the generated PDF file
            
        Raises:
            Exception: If PDF generation fails
        """
        try:
            # Ensure output directory exists
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Create HTML document
            html_doc = HTML(string=html_content)
            
            # Create CSS
            css = CSS(string=self._get_css_styles(), font_config=self.font_config)
            
            # Generate PDF
            html_doc.write_pdf(
                str(output_file),
                stylesheets=[css],
                font_config=self.font_config
            )
            
            return str(output_file)
            
        except Exception as e:
            raise Exception(f"PDF generation failed for lead {lead_id}: {e}")
    
    def get_pdf_path(self, lead_id: str) -> str:
        """Get the file path for a PDF by lead ID."""
        return str(self.pdf_dir / f"{lead_id}.pdf")
    
    def pdf_exists(self, lead_id: str) -> bool:
        """Check if PDF file exists."""
        return Path(self.get_pdf_path(lead_id)).exists()
    
    def get_pdf_url(self, lead_id: str) -> str:
        """Get the public URL for a PDF."""
        return f"{self.settings.base_url}/pdf/{lead_id}.pdf"