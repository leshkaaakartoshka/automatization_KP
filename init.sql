-- PostgreSQL initialization script for CPQ system

CREATE TABLE IF NOT EXISTS quote_catalog (
    id serial PRIMARY KEY,
    fefco text NOT NULL,
    x_mm int NOT NULL,
    y_mm int NOT NULL,
    z_mm int NOT NULL,
    material text NOT NULL,
    print text NOT NULL,
    sla_type text NOT NULL,
    qty_min int NOT NULL,
    qty_max int NOT NULL,
    lead_time_std text,
    lead_time_rush text,
    lead_time_strg text,
    price_std numeric(10,2),
    margin_std numeric(5,2),
    price_rush numeric(10,2),
    margin_rush numeric(5,2),
    price_strg numeric(10,2),
    margin_strg numeric(5,2),
    sku text,
    terms text[]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS qc_keys ON quote_catalog (fefco, x_mm, y_mm, z_mm, material, print, sla_type);
CREATE INDEX IF NOT EXISTS qc_qty ON quote_catalog (qty_min, qty_max);

-- Insert sample data
INSERT INTO quote_catalog (fefco, x_mm, y_mm, z_mm, material, print, sla_type, qty_min, qty_max, 
                          lead_time_std, lead_time_rush, lead_time_strg, 
                          price_std, margin_std, price_rush, margin_rush, price_strg, margin_strg, 
                          sku, terms) VALUES
('0201', 300, 200, 150, 'Микрогофрокартон Крафт', '1+0', 'стандарт', 100, 500, 
 '7-10 дней', '3-5 дней', '1-2 дня', 
 15.50, 25.00, 18.00, 30.00, 22.00, 35.00, 
 'BOX-0201-300x200x150-KRAFT-1+0-STD', ARRAY['Минимальная партия 100 шт', 'Доставка по России']),
('0201', 300, 200, 150, 'Микрогофрокартон Крафт', '1+0', 'стандарт', 501, 1000, 
 '7-10 дней', '3-5 дней', '1-2 дня', 
 12.50, 20.00, 15.00, 25.00, 18.00, 30.00, 
 'BOX-0201-300x200x150-KRAFT-1+0-STD', ARRAY['Минимальная партия 500 шт', 'Доставка по России']),
('0201', 300, 200, 150, 'Микрогофрокартон Крафт', '4+0', 'стандарт', 100, 500, 
 '10-14 дней', '5-7 дней', '2-3 дня', 
 18.50, 30.00, 22.00, 35.00, 26.00, 40.00, 
 'BOX-0201-300x200x150-KRAFT-4+0-STD', ARRAY['Минимальная партия 100 шт', 'Доставка по России']);
