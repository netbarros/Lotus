-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - ALL 13 PÉTALAS DEMO DATA
-- Complete Demo Data for All Vertical Solutions
-- Realistic, Production-Ready Sample Data
-- ═══════════════════════════════════════════════════════════════════════════

-- Get petala IDs for reference
DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_healthcare_id UUID;
    v_fashion_id UUID;
    v_restaurant_id UUID;
    v_real_estate_id UUID;
    v_education_id UUID;
    v_fitness_id UUID;
    v_beauty_id UUID;
    v_legal_id UUID;
    v_automotive_id UUID;
    v_retail_id UUID;
    v_logistics_id UUID;
    v_hospitality_id UUID;
    v_events_id UUID;
BEGIN
    -- Get pétala IDs
    SELECT id INTO v_healthcare_id FROM petalas_registry WHERE petala_code = 'healthcare';
    SELECT id INTO v_fashion_id FROM petalas_registry WHERE petala_code = 'fashion';
    SELECT id INTO v_restaurant_id FROM petalas_registry WHERE petala_code = 'restaurant';
    SELECT id INTO v_real_estate_id FROM petalas_registry WHERE petala_code = 'real_estate';
    SELECT id INTO v_education_id FROM petalas_registry WHERE petala_code = 'education';
    SELECT id INTO v_fitness_id FROM petalas_registry WHERE petala_code = 'fitness';
    SELECT id INTO v_beauty_id FROM petalas_registry WHERE petala_code = 'beauty';
    SELECT id INTO v_legal_id FROM petalas_registry WHERE petala_code = 'legal';
    SELECT id INTO v_automotive_id FROM petalas_registry WHERE petala_code = 'automotive';
    SELECT id INTO v_retail_id FROM petalas_registry WHERE petala_code = 'retail';
    SELECT id INTO v_logistics_id FROM petalas_registry WHERE petala_code = 'logistics';
    SELECT id INTO v_hospitality_id FROM petalas_registry WHERE petala_code = 'hospitality';
    SELECT id INTO v_events_id FROM petalas_registry WHERE petala_code = 'events';

    -- ═══════════════════════════════════════════════════════════════════════════
    -- FASHION - Moda & E-commerce
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Fashion Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, city, state, zip_code, ai_customer_score, ai_lifetime_value_prediction, ai_segment, total_orders, total_spent) VALUES
    (v_tenant_id, v_fashion_id, 'individual', 'Isabella', 'Costa', 'isabella.costa@email.com', '(11) 98100-0001', 'São Paulo', 'SP', '01310-100', 0.92, 5800.00, 'VIP', 12, 4850.00),
    (v_tenant_id, v_fashion_id, 'individual', 'Gabriela', 'Martins', 'gabriela.martins@email.com', '(11) 98100-0002', 'São Paulo', 'SP', '01415-000', 0.85, 3200.00, 'Regular', 8, 2100.00),
    (v_tenant_id, v_fashion_id, 'individual', 'Amanda', 'Silva', 'amanda.silva@email.com', '(11) 98100-0003', 'São Paulo', 'SP', '01419-000', 0.78, 1800.00, 'New', 3, 890.00);

    -- Fashion Products
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, sku, description, base_price, sale_price, stock_quantity, attributes, total_sales, average_rating, status) VALUES
    (v_tenant_id, v_fashion_id, 'physical_product', 'Vestido Floral Primavera', 'VEST-001', 'Vestido floral leve e elegante', 299.90, 239.90, 45, '{"size": ["P", "M", "G"], "color": ["Azul", "Rosa", "Branco"], "material": "Viscose"}'::JSONB, 128, 4.7, 'active'),
    (v_tenant_id, v_fashion_id, 'physical_product', 'Calça Jeans Skinny', 'CALCA-002', 'Calça jeans stretch confortável', 189.90, 189.90, 78, '{"size": ["36", "38", "40", "42"], "color": ["Azul Escuro", "Azul Claro"], "fit": "Skinny"}'::JSONB, 256, 4.5, 'active'),
    (v_tenant_id, v_fashion_id, 'physical_product', 'Blusa Listrada Básica', 'BLUSA-003', 'Blusa listrada manga curta', 79.90, 59.90, 120, '{"size": ["P", "M", "G", "GG"], "color": ["Preto/Branco", "Azul/Branco"]}'::JSONB, 342, 4.8, 'active');

    -- ═══════════════════════════════════════════════════════════════════════════
    -- RESTAURANT - Food & Delivery
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Restaurant Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, address, city, ai_customer_score, total_orders, total_spent) VALUES
    (v_tenant_id, v_restaurant_id, 'individual', 'Lucas', 'Oliveira', 'lucas.oliveira@email.com', '(11) 98200-0001', 'Rua Augusta 1000', 'São Paulo', 0.88, 25, 1850.00),
    (v_tenant_id, v_restaurant_id, 'individual', 'Fernanda', 'Santos', 'fernanda.santos@email.com', '(11) 98200-0002', 'Av. Paulista 2000', 'São Paulo', 0.75, 15, 980.00);

    -- Restaurant Products (Menu Items)
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes, total_sales, average_rating) VALUES
    (v_tenant_id, v_restaurant_id, 'service', 'Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 45.90, '{"category": "Pizza", "serves": 2, "preparation_time": 30}'::JSONB, 485, 4.9),
    (v_tenant_id, v_restaurant_id, 'service', 'Hambúrguer Artesanal', 'Hambúrguer 180g com queijo, alface, tomate e molho especial', 32.90, '{"category": "Hambúrguer", "serves": 1, "preparation_time": 20}'::JSONB, 623, 4.7),
    (v_tenant_id, v_restaurant_id, 'service', 'Salada Caesar', 'Salada com alface, frango grelhado, croutons e molho caesar', 28.90, '{"category": "Salada", "serves": 1, "preparation_time": 15}'::JSONB, 198, 4.6);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- FITNESS - Academia & Personal Training
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Fitness Customers (Members)
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score, ai_churn_risk, total_orders) VALUES
    (v_tenant_id, v_fitness_id, 'member', 'Rafael', 'Almeida', 'rafael.almeida@email.com', '(11) 98300-0001', 0.91, 0.15, 12),
    (v_tenant_id, v_fitness_id, 'member', 'Juliana', 'Ferreira', 'juliana.ferreira@email.com', '(11) 98300-0002', 0.82, 0.28, 8),
    (v_tenant_id, v_fitness_id, 'member', 'Pedro', 'Costa', 'pedro.costa@email.com', '(11) 98300-0003', 0.68, 0.45, 3);

    -- Fitness Products (Memberships & Services)
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes, total_sales) VALUES
    (v_tenant_id, v_fitness_id, 'membership', 'Plano Mensal Premium', 'Acesso total à academia + aulas coletivas', 189.90, '{"duration_months": 1, "access": "unlimited", "includes": ["musculação", "aulas", "vestiário"]}'::JSONB, 245),
    (v_tenant_id, v_fitness_id, 'service', 'Personal Training - 10 Sessões', 'Pacote de 10 sessões de treino personalizado', 800.00, '{"sessions": 10, "duration_minutes": 60}'::JSONB, 42),
    (v_tenant_id, v_fitness_id, 'service', 'Avaliação Física Completa', 'Avaliação com bioimpedância e prescrição de treino', 120.00, '{"includes": ["bioimpedância", "medidas", "prescrição"]}'::JSONB, 128);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- BEAUTY - Salão & Spa
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Beauty Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score, total_orders, total_spent) VALUES
    (v_tenant_id, v_beauty_id, 'individual', 'Carolina', 'Mendes', 'carolina.mendes@email.com', '(11) 98400-0001', 0.94, 18, 2340.00),
    (v_tenant_id, v_beauty_id, 'individual', 'Bianca', 'Rodrigues', 'bianca.rodrigues@email.com', '(11) 98400-0002', 0.87, 12, 1580.00);

    -- Beauty Services
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes, total_sales, average_rating) VALUES
    (v_tenant_id, v_beauty_id, 'service', 'Corte Feminino + Escova', 'Corte de cabelo feminino com lavagem e escova', 120.00, '{"duration_minutes": 90, "professional_level": "senior"}'::JSONB, 342, 4.9),
    (v_tenant_id, v_beauty_id, 'service', 'Manicure Completa', 'Manicure com esmaltação e hidratação', 45.00, '{"duration_minutes": 45}'::JSONB, 580, 4.7),
    (v_tenant_id, v_beauty_id, 'service', 'Massagem Relaxante', 'Massagem corporal relaxante 60 minutos', 180.00, '{"duration_minutes": 60, "type": "relaxing"}'::JSONB, 145, 4.8);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- EDUCATION - Cursos & Treinamentos
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Education Customers (Students)
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score, total_orders) VALUES
    (v_tenant_id, v_education_id, 'student', 'Thiago', 'Nascimento', 'thiago.nascimento@email.com', '(11) 98500-0001', 0.89, 5),
    (v_tenant_id, v_education_id, 'student', 'Camila', 'Souza', 'camila.souza@email.com', '(11) 98500-0002', 0.92, 7);

    -- Education Products (Courses)
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, sale_price, attributes, total_sales, average_rating) VALUES
    (v_tenant_id, v_education_id, 'course', 'Desenvolvimento Web Completo', 'Curso completo de desenvolvimento web front-end e back-end', 1497.00, 997.00, '{"duration_hours": 120, "modality": "online", "level": "beginner to advanced", "certificate": true}'::JSONB, 342, 4.9),
    (v_tenant_id, v_education_id, 'course', 'Data Science com Python', 'Aprenda análise de dados e machine learning', 1897.00, 1397.00, '{"duration_hours": 80, "modality": "online", "level": "intermediate", "certificate": true}'::JSONB, 198, 4.8),
    (v_tenant_id, v_education_id, 'course', 'Marketing Digital Avançado', 'Estratégias avançadas de marketing digital', 897.00, 697.00, '{"duration_hours": 40, "modality": "online", "level": "intermediate", "certificate": true}'::JSONB, 256, 4.7);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- REAL ESTATE - Imobiliário
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Real Estate Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score, ai_lifetime_value_prediction) VALUES
    (v_tenant_id, v_real_estate_id, 'individual', 'Eduardo', 'Lima', 'eduardo.lima@email.com', '(11) 98600-0001', 0.95, 850000.00),
    (v_tenant_id, v_real_estate_id, 'business', 'Construtora', 'Horizonte', 'contato@horizonte.com.br', '(11) 3000-6001', 0.88, 5000000.00);

    -- Real Estate Products (Properties)
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes, view_count) VALUES
    (v_tenant_id, v_real_estate_id, 'rental', 'Apartamento 3 Quartos - Jardins', 'Apartamento moderno com 120m², 3 quartos, 2 vagas', 4500.00, '{"area_m2": 120, "bedrooms": 3, "bathrooms": 2, "parking_spaces": 2, "furnished": false, "building_amenities": ["piscina", "academia", "salão de festas"]}'::JSONB, 342),
    (v_tenant_id, v_real_estate_id, 'physical_product', 'Casa 4 Quartos - Morumbi', 'Casa térrea com jardim, 250m²', 1200000.00, '{"area_m2": 250, "bedrooms": 4, "bathrooms": 3, "parking_spaces": 4, "land_m2": 400, "features": ["jardim", "churrasqueira", "piscina"]}'::JSONB, 156),
    (v_tenant_id, v_real_estate_id, 'physical_product', 'Loja Comercial - Av. Paulista', 'Loja comercial em ponto nobre', 2500000.00, '{"area_m2": 80, "floor": "téreo", "business_type": "comercial", "features": ["vitrine", "banheiro", "ar condicionado"]}'::JSONB, 89);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- AUTOMOTIVE - Oficina & Concessionária
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Automotive Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score, total_orders, total_spent) VALUES
    (v_tenant_id, v_automotive_id, 'individual', 'Marcelo', 'Barbosa', 'marcelo.barbosa@email.com', '(11) 98700-0001', 0.86, 8, 3200.00),
    (v_tenant_id, v_automotive_id, 'business', 'Transportadora', 'Rápida', 'contato@rapida.com.br', '(11) 3000-7001', 0.91, 45, 28000.00);

    -- Automotive Services
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes, total_sales) VALUES
    (v_tenant_id, v_automotive_id, 'service', 'Troca de Óleo Completa', 'Troca de óleo + filtro + revisão de 10 pontos', 250.00, '{"duration_minutes": 45, "includes": ["óleo sintético", "filtro", "revisão"]}'::JSONB, 458),
    (v_tenant_id, v_automotive_id, 'service', 'Alinhamento e Balanceamento', 'Alinhamento e balanceamento completo', 180.00, '{"duration_minutes": 60}'::JSONB, 289),
    (v_tenant_id, v_automotive_id, 'service', 'Troca de Pastilhas de Freio', 'Troca de pastilhas dianteiras ou traseiras', 420.00, '{"duration_minutes": 90, "warranty_months": 6}'::JSONB, 156);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- RETAIL - Varejo & E-commerce
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Retail Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score, total_orders, total_spent) VALUES
    (v_tenant_id, v_retail_id, 'individual', 'Patricia', 'Cardoso', 'patricia.cardoso@email.com', '(11) 98800-0001', 0.83, 15, 2890.00),
    (v_tenant_id, v_retail_id, 'individual', 'Rodrigo', 'Pereira', 'rodrigo.pereira@email.com', '(11) 98800-0002', 0.77, 9, 1450.00);

    -- Retail Products
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, stock_quantity, total_sales, average_rating) VALUES
    (v_tenant_id, v_retail_id, 'physical_product', 'Notebook Dell Inspiron 15', 'Notebook i5 11ª geração, 8GB RAM, 256GB SSD', 3299.00, 25, 128, 4.6),
    (v_tenant_id, v_retail_id, 'physical_product', 'Mouse Logitech MX Master 3', 'Mouse ergonômico sem fio', 449.90, 78, 256, 4.9),
    (v_tenant_id, v_retail_id, 'physical_product', 'Webcam Logitech C920', 'Webcam Full HD 1080p', 389.90, 42, 189, 4.7);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- LEGAL - Escritório Jurídico
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Legal Customers (Clients)
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score) VALUES
    (v_tenant_id, v_legal_id, 'individual', 'José', 'Ferreira', 'jose.ferreira@email.com', '(11) 98900-0001', 0.88),
    (v_tenant_id, v_legal_id, 'business', 'Empresa', 'Tech Solutions', 'juridico@techsolutions.com.br', '(11) 3000-9001', 0.92);

    -- Legal Services
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes) VALUES
    (v_tenant_id, v_legal_id, 'service', 'Consultoria Jurídica - 1 Hora', 'Consultoria jurídica especializada', 450.00, '{"duration_minutes": 60, "area": "geral"}'::JSONB),
    (v_tenant_id, v_legal_id, 'service', 'Elaboração de Contrato', 'Elaboração de contrato personalizado', 1200.00, '{"delivery_days": 5, "revisions": 2}'::JSONB),
    (v_tenant_id, v_legal_id, 'service', 'Acompanhamento Processual', 'Acompanhamento mensal de processo', 800.00, '{"billing": "monthly"}'::JSONB);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- LOGISTICS - Logística & Entregas
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Logistics Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, company_name, email, phone, ai_customer_score, total_orders, total_spent) VALUES
    (v_tenant_id, v_logistics_id, 'business', 'E-commerce Brasil', 'logistica@ecommercebrasil.com.br', '(11) 3000-1001', 0.95, 450, 185000.00),
    (v_tenant_id, v_logistics_id, 'business', 'Farmácia Popular', 'entregas@farmaciapopular.com.br', '(11) 3000-1002', 0.89, 320, 98000.00);

    -- Logistics Services
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes) VALUES
    (v_tenant_id, v_logistics_id, 'service', 'Entrega Same Day - São Paulo', 'Entrega no mesmo dia dentro de SP', 25.00, '{"delivery_time": "same_day", "coverage": "São Paulo capital"}'::JSONB),
    (v_tenant_id, v_logistics_id, 'service', 'Entrega Expressa Nacional', 'Entrega expressa 24-48h nacional', 45.00, '{"delivery_time": "24-48h", "coverage": "nacional"}'::JSONB),
    (v_tenant_id, v_logistics_id, 'service', 'Armazenagem Mensal', 'Armazenagem mensal por pallet', 150.00, '{"unit": "pallet", "billing": "monthly"}'::JSONB);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- HOSPITALITY - Hotel & Pousadas
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Hospitality Customers (Guests)
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score, ai_lifetime_value_prediction) VALUES
    (v_tenant_id, v_hospitality_id, 'individual', 'Ricardo', 'Souza', 'ricardo.souza@email.com', '(11) 98110-0001', 0.91, 8500.00),
    (v_tenant_id, v_hospitality_id, 'individual', 'Mariana', 'Alves', 'mariana.alves@email.com', '(11) 98110-0002', 0.85, 4200.00);

    -- Hospitality Products (Rooms & Services)
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, attributes, average_rating) VALUES
    (v_tenant_id, v_hospitality_id, 'booking', 'Quarto Standard Casal', 'Quarto confortável com cama de casal', 350.00, '{"capacity": 2, "bed_type": "queen", "amenities": ["ar condicionado", "TV", "Wi-Fi", "frigobar"]}'::JSONB, 4.5),
    (v_tenant_id, v_hospitality_id, 'booking', 'Suíte Luxo Vista Mar', 'Suíte luxo com vista para o mar', 850.00, '{"capacity": 2, "bed_type": "king", "amenities": ["ar condicionado", "TV Smart", "Wi-Fi", "frigobar", "banheira", "varanda"]}'::JSONB, 4.9),
    (v_tenant_id, v_hospitality_id, 'service', 'Café da Manhã', 'Café da manhã completo', 45.00, '{"serves": 1, "type": "buffet"}'::JSONB, 4.7);

    -- ═══════════════════════════════════════════════════════════════════════════
    -- EVENTS - Eventos & Festas
    -- ═══════════════════════════════════════════════════════════════════════════

    -- Events Customers
    INSERT INTO petala_customers (tenant_id, petala_id, customer_type, first_name, last_name, email, phone, ai_customer_score) VALUES
    (v_tenant_id, v_events_id, 'individual', 'Ana', 'Paula', 'ana.paula@email.com', '(11) 98120-0001', 0.87),
    (v_tenant_id, v_events_id, 'business', 'Empresa', 'Innovation Corp', 'eventos@innovationcorp.com.br', '(11) 3000-1201', 0.93);

    -- Events Products (Event Tickets & Services)
    INSERT INTO petala_products (tenant_id, petala_id, product_type, name, description, base_price, sale_price, attributes) VALUES
    (v_tenant_id, v_events_id, 'event_ticket', 'Conferência Tech 2024 - Ingresso VIP', 'Acesso total + coffee break + networking', 890.00, 690.00, '{"event_date": "2024-06-15", "duration_hours": 8, "includes": ["palestras", "workshops", "coffee break", "networking"]}'::JSONB),
    (v_tenant_id, v_events_id, 'event_ticket', 'Workshop Marketing Digital', 'Workshop prático 4 horas', 297.00, 197.00, '{"event_date": "2024-05-20", "duration_hours": 4, "capacity": 30}'::JSONB),
    (v_tenant_id, v_events_id, 'service', 'Buffet Completo 100 Pessoas', 'Buffet completo para eventos corporativos', 6500.00, NULL, '{"serves": 100, "type": "corporativo", "includes": ["salgados", "doces", "bebidas", "garçons"]}'::JSONB);

    RAISE NOTICE '✅ Demo data for ALL 13 Pétalas created successfully!';
    RAISE NOTICE '   - Fashion: 3 customers, 3 products';
    RAISE NOTICE '   - Restaurant: 2 customers, 3 menu items';
    RAISE NOTICE '   - Fitness: 3 members, 3 services';
    RAISE NOTICE '   - Beauty: 2 customers, 3 services';
    RAISE NOTICE '   - Education: 2 students, 3 courses';
    RAISE NOTICE '   - Real Estate: 2 customers, 3 properties';
    RAISE NOTICE '   - Automotive: 2 customers, 3 services';
    RAISE NOTICE '   - Retail: 2 customers, 3 products';
    RAISE NOTICE '   - Legal: 2 clients, 3 services';
    RAISE NOTICE '   - Logistics: 2 customers, 3 services';
    RAISE NOTICE '   - Hospitality: 2 guests, 3 rooms/services';
    RAISE NOTICE '   - Events: 2 customers, 3 tickets/services';
    RAISE NOTICE '   + Healthcare already has complete demo data';
END $$;
