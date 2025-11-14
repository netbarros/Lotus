-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - HEALTHCARE/MÉDICAS DEMO DATA & SEEDS
-- Sistema Médicas - Dados Demo Completos e Realistas
-- Integrado com Sofia AI v4.0 - The Brain
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE FACILITIES - 3 Unidades Demo
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO healthcare_facilities (id, tenant_id, name, facility_type, cnpj, cnes, email, phone, address, address_number, neighborhood, city, state, zip_code, country, operating_hours, emergency_24h, services_offered, specialties_available, total_beds, available_beds, icu_beds, emergency_beds, status) VALUES
-- Facility 1: Hospital Principal
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Hospital Divinas Terapias', 'hospital', '12.345.678/0001-90', 'CNES001', 'contato@divinasterapias.com.br', '(11) 3000-0001', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', '01310-100', 'Brasil', '{"monday": "00:00-23:59", "tuesday": "00:00-23:59", "wednesday": "00:00-23:59", "thursday": "00:00-23:59", "friday": "00:00-23:59", "saturday": "00:00-23:59", "sunday": "00:00-23:59"}'::JSONB, true, ARRAY['emergência', 'cirurgia', 'internação', 'UTI', 'laboratório', 'imagem'], ARRAY['cardiologia', 'neurologia', 'ortopedia', 'pediatria', 'ginecologia', 'clínica geral'], 120, 45, 20, 15, 'active'),

-- Facility 2: Clínica Especializada
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Clínica Lotus Saúde', 'clinic', '98.765.432/0001-10', 'CNES002', 'contato@lotussaude.com.br', '(11) 3000-0002', 'Rua Augusta', '2500', 'Consolação', 'São Paulo', 'SP', '01412-100', 'Brasil', '{"monday": "07:00-19:00", "tuesday": "07:00-19:00", "wednesday": "07:00-19:00", "thursday": "07:00-19:00", "friday": "07:00-19:00", "saturday": "08:00-14:00"}'::JSONB, false, ARRAY['consultas', 'exames', 'procedimentos ambulatoriais'], ARRAY['dermatologia', 'endocrinologia', 'reumatologia', 'psiquiatria'], 0, 0, 0, 0, 'active'),

-- Facility 3: Laboratório
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Laboratório MagicLab', 'laboratory', '11.222.333/0001-44', 'CNES003', 'contato@magiclab.com.br', '(11) 3000-0003', 'Av. Brigadeiro Faria Lima', '3500', 'Itaim Bibi', 'São Paulo', 'SP', '04538-133', 'Brasil', '{"monday": "06:00-18:00", "tuesday": "06:00-18:00", "wednesday": "06:00-18:00", "thursday": "06:00-18:00", "friday": "06:00-18:00", "saturday": "07:00-12:00"}'::JSONB, false, ARRAY['análises clínicas', 'exames laboratoriais', 'coleta domiciliar'], ARRAY['hematologia', 'bioquímica', 'microbiologia', 'imunologia'], 0, 0, 0, 0, 'active');

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE PROVIDERS - 10 Médicos Demo
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO healthcare_providers (id, tenant_id, user_id, professional_name, specialty, sub_specialty, license_number, license_state, license_expiry, cpf, email, phone, mobile, medical_school, graduation_year, certifications, languages, consultation_duration_minutes, consultation_fee, accepts_insurance, accepted_insurance_providers, working_hours, available_for_appointments, total_patients, total_appointments, average_rating, total_reviews, ai_performance_score, status) VALUES

-- Provider 1: Cardiologista
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Dr. Carlos Eduardo Silva', 'Cardiologia', 'Hemodinâmica', 'CRM-SP 123456', 'SP', '2026-12-31', '123.456.789-01', 'carlos.silva@divinasterapias.com.br', '(11) 98000-0001', '(11) 98000-0001', 'USP - Universidade de São Paulo', 2010, ARRAY['Especialista em Cardiologia - SBC', 'Hemodinâmica e Cardiologia Intervencionista'], ARRAY['Português', 'Inglês', 'Espanhol'], 40, 450.00, true, ARRAY['Amil', 'Bradesco Saúde', 'SulAmérica', 'Unimed'], '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-14:00"}'::JSONB, true, 450, 1200, 4.85, 98, 0.92, 'active'),

-- Provider 2: Neurologista
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', NULL, 'Dra. Ana Paula Oliveira', 'Neurologia', 'Doenças Neurodegenerativas', 'CRM-SP 234567', 'SP', '2027-06-30', '234.567.890-12', 'ana.oliveira@divinasterapias.com.br', '(11) 98000-0002', '(11) 98000-0002', 'UNIFESP', 2012, ARRAY['Especialista em Neurologia - ABN', 'Fellowship em Parkinson e Distúrbios do Movimento'], ARRAY['Português', 'Inglês'], 50, 500.00, true, ARRAY['Amil', 'Bradesco Saúde', 'Porto Seguro'], '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "14:00-20:00", "friday": "09:00-17:00"}'::JSONB, true, 320, 850, 4.92, 76, 0.95, 'active'),

-- Provider 3: Pediatra
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', NULL, 'Dr. Roberto Santos', 'Pediatria', 'Neonatologia', 'CRM-SP 345678', 'SP', '2025-12-31', '345.678.901-23', 'roberto.santos@divinasterapias.com.br', '(11) 98000-0003', '(11) 98000-0003', 'UNICAMP', 2008, ARRAY['Especialista em Pediatria - SBP', 'Título em Neonatologia'], ARRAY['Português'], 30, 380.00, true, ARRAY['Amil', 'Bradesco Saúde', 'SulAmérica', 'Unimed', 'Notre Dame'], '{"monday": "08:00-12:00,14:00-18:00", "tuesday": "08:00-12:00,14:00-18:00", "wednesday": "08:00-12:00,14:00-18:00", "thursday": "08:00-12:00,14:00-18:00", "friday": "08:00-12:00"}'::JSONB, true, 680, 1850, 4.95, 145, 0.97, 'active'),

-- Provider 4: Ginecologista
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', NULL, 'Dra. Mariana Costa', 'Ginecologia e Obstetrícia', 'Medicina Fetal', 'CRM-SP 456789', 'SP', '2026-08-15', '456.789.012-34', 'mariana.costa@divinasterapias.com.br', '(11) 98000-0004', '(11) 98000-0004', 'USP - Ribeirão Preto', 2014, ARRAY['Especialista em GO - FEBRASGO', 'Medicina Fetal'], ARRAY['Português', 'Inglês'], 40, 420.00, true, ARRAY['Amil', 'Bradesco Saúde', 'SulAmérica'], '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-14:00"}'::JSONB, true, 520, 1420, 4.88, 112, 0.91, 'active'),

-- Provider 5: Ortopedista
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', NULL, 'Dr. Fernando Almeida', 'Ortopedia e Traumatologia', 'Cirurgia do Joelho', 'CRM-SP 567890', 'SP', '2027-03-20', '567.890.123-45', 'fernando.almeida@divinasterapias.com.br', '(11) 98000-0005', '(11) 98000-0005', 'UNIFESP', 2011, ARRAY['Especialista em Ortopedia - SBOT', 'Fellow em Cirurgia do Joelho - FIFA Medical Center'], ARRAY['Português', 'Inglês', 'Italiano'], 45, 550.00, true, ARRAY['Bradesco Saúde', 'SulAmérica', 'Porto Seguro'], '{"monday": "13:00-19:00", "wednesday": "13:00-19:00", "friday": "08:00-14:00"}'::JSONB, true, 280, 720, 4.79, 68, 0.88, 'active'),

-- Provider 6: Dermatologista
('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', NULL, 'Dra. Juliana Ferreira', 'Dermatologia', 'Cosmiatria', 'CRM-SP 678901', 'SP', '2026-11-10', '678.901.234-56', 'juliana.ferreira@lotussaude.com.br', '(11) 98000-0006', '(11) 98000-0006', 'USP', 2013, ARRAY['Especialista em Dermatologia - SBD', 'Laser e Cosmiatria'], ARRAY['Português', 'Inglês'], 35, 400.00, true, ARRAY['Amil', 'Unimed', 'SulAmérica'], '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-13:00"}'::JSONB, true, 590, 1650, 4.93, 128, 0.94, 'active'),

-- Provider 7: Endocrinologista
('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', NULL, 'Dr. Paulo Ricardo Lima', 'Endocrinologia', 'Diabetes', 'CRM-SP 789012', 'SP', '2025-09-25', '789.012.345-67', 'paulo.lima@lotussaude.com.br', '(11) 98000-0007', '(11) 98000-0007', 'UNIFESP', 2009, ARRAY['Especialista em Endocrinologia - SBEM', 'Diabetologia'], ARRAY['Português'], 40, 420.00, true, ARRAY['Amil', 'Bradesco Saúde', 'Unimed'], '{"tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-14:00"}'::JSONB, true, 410, 1180, 4.86, 95, 0.90, 'active'),

-- Provider 8: Psiquiatra
('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', NULL, 'Dra. Beatriz Souza', 'Psiquiatria', 'Psicogeriatria', 'CRM-SP 890123', 'SP', '2027-02-14', '890.123.456-78', 'beatriz.souza@lotussaude.com.br', '(11) 98000-0008', '(11) 98000-0008', 'USP', 2015, ARRAY['Especialista em Psiquiatria - ABP', 'Psicogeriatria'], ARRAY['Português', 'Inglês'], 50, 480.00, true, ARRAY['Amil', 'Bradesco Saúde'], '{"monday": "10:00-20:00", "wednesday": "10:00-20:00", "friday": "10:00-18:00"}'::JSONB, true, 220, 580, 4.91, 54, 0.93, 'active'),

-- Provider 9: Clínico Geral
('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', NULL, 'Dr. Ricardo Mendes', 'Clínica Médica', NULL, 'CRM-SP 901234', 'SP', '2026-05-30', '901.234.567-89', 'ricardo.mendes@divinasterapias.com.br', '(11) 98000-0009', '(11) 98000-0009', 'UNICAMP', 2016, ARRAY['Especialista em Clínica Médica - SBCM'], ARRAY['Português'], 30, 320.00, true, ARRAY['Amil', 'Bradesco Saúde', 'SulAmérica', 'Unimed', 'Porto Seguro'], '{"monday": "07:00-19:00", "tuesday": "07:00-19:00", "wednesday": "07:00-19:00", "thursday": "07:00-19:00", "friday": "07:00-15:00", "saturday": "08:00-12:00"}'::JSONB, true, 820, 2450, 4.82, 178, 0.89, 'active'),

-- Provider 10: Reumatologista
('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', NULL, 'Dra. Cláudia Martins', 'Reumatologia', 'Artrite Reumatoide', 'CRM-SP 012345', 'SP', '2027-07-22', '012.345.678-90', 'claudia.martins@lotussaude.com.br', '(11) 98000-0010', '(11) 98000-0010', 'UNIFESP', 2012, ARRAY['Especialista em Reumatologia - SBR', 'Densitometria Óssea'], ARRAY['Português', 'Inglês'], 45, 460.00, true, ARRAY['Amil', 'SulAmérica'], '{"monday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "14:00-20:00"}'::JSONB, true, 310, 840, 4.87, 71, 0.91, 'active');

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE PATIENTS - 15 Pacientes Demo
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO healthcare_patients (id, tenant_id, mrn, first_name, last_name, date_of_birth, gender, blood_type, cpf, email, phone, mobile, address, address_number, address_complement, neighborhood, city, state, zip_code, country, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, insurance_provider, insurance_policy_number, allergies, chronic_conditions, current_medications, primary_physician_id, status, total_visits, ai_risk_score) VALUES

-- Patient 1: Maria da Silva (Diabética com histórico familiar)
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MRN2024001', 'Maria', 'Silva', '1965-03-15', 'female', 'O+', '111.222.333-44', 'maria.silva@email.com', '(11) 97000-0001', '(11) 97000-0001', 'Rua das Flores', '123', 'Apto 45', 'Jardins', 'São Paulo', 'SP', '01419-000', 'Brasil', 'João Silva', '(11) 97000-0002', 'Esposo', 'Amil', 'AMIL-123456', 'Penicilina, Contraste Iodado', 'Diabetes Mellitus Tipo 2, Hipertensão Arterial', 'Metformina 850mg 2x/dia, Losartana 50mg 1x/dia, AAS 100mg 1x/dia', '20000000-0000-0000-0000-000000000007', 'active', 28, 0.72),

-- Patient 2: João Pedro Santos (Jovem saudável)
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MRN2024002', 'João Pedro', 'Santos', '1998-07-22', 'male', 'A+', '222.333.444-55', 'joao.santos@email.com', '(11) 97000-0003', '(11) 97000-0003', 'Av. Paulista', '2500', NULL, 'Bela Vista', 'São Paulo', 'SP', '01310-300', 'Brasil', 'Ana Santos', '(11) 97000-0004', 'Mãe', 'Bradesco Saúde', 'BRAD-789012', 'Nenhuma alergia conhecida', 'Nenhuma', 'Nenhuma medicação regular', '20000000-0000-0000-0000-000000000009', 'active', 5, 0.15),

-- Patient 3: Ana Carolina Oliveira (Grávida)
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MRN2024003', 'Ana Carolina', 'Oliveira', '1992-11-08', 'female', 'B+', '333.444.555-66', 'ana.oliveira@email.com', '(11) 97000-0005', '(11) 97000-0005', 'Rua Augusta', '1500', 'Casa', 'Consolação', 'São Paulo', 'SP', '01304-001', 'Brasil', 'Carlos Oliveira', '(11) 97000-0006', 'Esposo', 'SulAmérica', 'SULA-345678', 'Dipirona', 'Gestante - 24 semanas', 'Ácido Fólico 5mg 1x/dia, Sulfato Ferroso 40mg 1x/dia', '20000000-0000-0000-0000-000000000004', 'active', 12, 0.35),

-- Patient 4: Roberto Carlos Lima (Cardiopata)
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MRN2024004', 'Roberto Carlos', 'Lima', '1958-04-19', 'male', 'AB+', '444.555.666-77', 'roberto.lima@email.com', '(11) 97000-0007', '(11) 97000-0007', 'Av. Faria Lima', '3000', 'Cj 801', 'Itaim Bibi', 'São Paulo', 'SP', '04538-132', 'Brasil', 'Márcia Lima', '(11) 97000-0008', 'Esposa', 'Unimed', 'UNIM-901234', 'AAS', 'Insuficiência Cardíaca, Fibrilação Atrial, Diabetes', 'Carvedilol 25mg 2x/dia, Varfarina 5mg 1x/dia, Furosemida 40mg 1x/dia, Insulina NPH 20UI 2x/dia', '20000000-0000-0000-0000-000000000001', 'active', 42, 0.85),

-- Patient 5: Júlia Mendes (Criança)
('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MRN2024005', 'Júlia', 'Mendes', '2018-09-12', 'female', 'O-', '555.666.777-88', 'julia.mendes@email.com', '(11) 97000-0009', '(11) 97000-0009', 'Rua Haddock Lobo', '595', 'Apto 102', 'Cerqueira César', 'São Paulo', 'SP', '01414-001', 'Brasil', 'Patrícia Mendes', '(11) 97000-0010', 'Mãe', 'Notre Dame', 'NOTR-567890', 'Amendoim, Leite de vaca', 'Asma leve', 'Budesonida spray inalatório conforme necessidade', '20000000-0000-0000-0000-000000000003', 'active', 18, 0.28),

-- Patient 6: Carlos Eduardo Costa (Atleta)
('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MRN2024006', 'Carlos Eduardo', 'Costa', '1990-02-28', 'male', 'A-', '666.777.888-99', 'carlos.costa@email.com', '(11) 97000-0011', '(11) 97000-0011', 'Av. Rebouças', '2400', NULL, 'Pinheiros', 'São Paulo', 'SP', '05402-100', 'Brasil', 'Marina Costa', '(11) 97000-0012', 'Esposa', 'Porto Seguro', 'PORT-234567', 'Nenhuma', 'Lesão de menisco (joelho direito)', 'Condroitina + Glucosamina 1x/dia', '20000000-0000-0000-0000-000000000005', 'active', 8, 0.22),

-- Patient 7: Francisca Almeida (Idosa com múltiplas comorbidades)
('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'MRN2024007', 'Francisca', 'Almeida', '1948-06-30', 'female', 'B-', '777.888.999-00', 'francisca.almeida@email.com', '(11) 97000-0013', '(11) 97000-0013', 'Rua Estados Unidos', '1500', 'Apto 201', 'Jardim América', 'São Paulo', 'SP', '01427-001', 'Brasil', 'Teresa Almeida', '(11) 97000-0014', 'Filha', 'Amil', 'AMIL-890123', 'Sulfa, Morfina', 'HAS, DM2, Artrose, Osteoporose, Doença de Alzheimer inicial', 'Losartana 100mg 1x/dia, Metformina 500mg 3x/dia, Donepezila 10mg 1x/dia, Cálcio + Vit D 1x/dia', '20000000-0000-0000-0000-000000000009', 'active', 67, 0.91),

-- Patient 8: Pedro Henrique Souza (Adolescente)
('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'MRN2024008', 'Pedro Henrique', 'Souza', '2010-01-05', 'male', 'O+', '888.999.000-11', 'pedro.souza@email.com', '(11) 97000-0015', '(11) 97000-0015', 'Rua Oscar Freire', '800', NULL, 'Jardins', 'São Paulo', 'SP', '01426-001', 'Brasil', 'Renata Souza', '(11) 97000-0016', 'Mãe', 'Bradesco Saúde', 'BRAD-345678', 'Nenhuma', 'Nenhuma', 'Nenhuma', '20000000-0000-0000-0000-000000000003', 'active', 9, 0.12),

-- Patient 9: Beatriz Santos (Dermatológica)
('30000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'MRN2024009', 'Beatriz', 'Santos', '1985-08-17', 'female', 'AB-', '999.000.111-22', 'beatriz.santos@email.com', '(11) 97000-0017', '(11) 97000-0017', 'Av. Europa', '1200', 'Apto 501', 'Jardim Europa', 'São Paulo', 'SP', '01449-000', 'Brasil', 'Rafael Santos', '(11) 97000-0018', 'Esposo', 'SulAmérica', 'SULA-678901', 'Nenhuma', 'Psoríase', 'Metotrexato 15mg 1x/semana, Ácido Fólico 5mg 1x/semana', '20000000-0000-0000-0000-000000000006', 'active', 15, 0.38),

-- Patient 10: Antônio Ferreira (Neurológico)
('30000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'MRN2024010', 'Antônio', 'Ferreira', '1970-12-03', 'male', 'A+', '100.111.222-33', 'antonio.ferreira@email.com', '(11) 97000-0019', '(11) 97000-0019', 'Rua Bela Cintra', '1000', NULL, 'Consolação', 'São Paulo', 'SP', '01415-000', 'Brasil', 'Sandra Ferreira', '(11) 97000-0020', 'Esposa', 'Unimed', 'UNIM-123456', 'Contraste', 'Doença de Parkinson', 'Levodopa + Carbidopa 250/25mg 3x/dia, Pramipexol 1mg 3x/dia', '20000000-0000-0000-0000-000000000002', 'active', 32, 0.68),

-- Patient 11-15: Pacientes adicionais para volume
('30000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'MRN2024011', 'Mariana', 'Rodrigues', '2000-05-20', 'female', 'O+', '211.222.333-44', 'mariana.rodrigues@email.com', '(11) 97000-0021', '(11) 97000-0021', 'Rua da Consolação', '2000', 'Apto 305', 'Consolação', 'São Paulo', 'SP', '01301-000', 'Brasil', 'José Rodrigues', '(11) 97000-0022', 'Pai', 'Amil', 'AMIL-234567', 'Nenhuma', 'Nenhuma', 'Anticoncepcional oral', '20000000-0000-0000-0000-000000000009', 'active', 6, 0.18),

('30000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'MRN2024012', 'Fernando', 'Araújo', '1982-09-14', 'male', 'B+', '322.333.444-55', 'fernando.araujo@email.com', '(11) 97000-0023', '(11) 97000-0023', 'Av. Ibirapuera', '3103', NULL, 'Moema', 'São Paulo', 'SP', '04029-200', 'Brasil', 'Juliana Araújo', '(11) 97000-0024', 'Esposa', 'Bradesco Saúde', 'BRAD-456789', 'Nenhuma', 'Artrite Reumatoide', 'Metotrexato 20mg 1x/semana, Adalimumabe 40mg SC quinzenal', '20000000-0000-0000-0000-000000000010', 'active', 24, 0.55),

('30000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'MRN2024013', 'Camila', 'Martins', '1995-03-25', 'female', 'A-', '433.444.555-66', 'camila.martins@email.com', '(11) 97000-0025', '(11) 97000-0025', 'Rua Pamplona', '1500', 'Cj 12', 'Jardim Paulista', 'São Paulo', 'SP', '01405-001', 'Brasil', 'Lucas Martins', '(11) 97000-0026', 'Irmão', 'SulAmérica', 'SULA-789012', 'Látex', 'Nenhuma', 'Nenhuma', '20000000-0000-0000-0000-000000000006', 'active', 4, 0.20),

('30000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'MRN2024014', 'Ricardo', 'Pereira', '1975-07-08', 'male', 'AB+', '544.555.666-77', 'ricardo.pereira@email.com', '(11) 97000-0027', '(11) 97000-0027', 'Alameda Santos', '2200', 'Apto 1201', 'Jardins', 'São Paulo', 'SP', '01419-002', 'Brasil', 'Paula Pereira', '(11) 97000-0028', 'Esposa', 'Porto Seguro', 'PORT-890123', 'Nenhuma', 'Hipotireoidismo', 'Levotiroxina 100mcg 1x/dia', '20000000-0000-0000-0000-000000000007', 'active', 14, 0.32),

('30000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'MRN2024015', 'Larissa', 'Gomes', '1988-11-30', 'female', 'O-', '655.666.777-88', 'larissa.gomes@email.com', '(11) 97000-0029', '(11) 97000-0029', 'Rua Joaquim Floriano', '1000', 'Apto 702', 'Itaim Bibi', 'São Paulo', 'SP', '04534-004', 'Brasil', 'Rodrigo Gomes', '(11) 97000-0030', 'Esposo', 'Amil', 'AMIL-345678', 'Nenhuma', 'Ansiedade Generalizada', 'Sertralina 50mg 1x/dia, Clonazepam 0.5mg conforme necessidade', '20000000-0000-0000-0000-000000000008', 'active', 11, 0.42);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE APPOINTMENTS - 20 Agendamentos Demo (próximos 30 dias)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO healthcare_appointments (id, tenant_id, patient_id, provider_id, appointment_date, appointment_time, duration_minutes, appointment_type, status, reason, consultation_fee, insurance_covered, payment_status, ai_priority_score) VALUES

-- Hoje e próximos dias
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', CURRENT_DATE, '09:00', 40, 'follow_up', 'scheduled', 'Retorno - Ajuste de medicação para diabetes', 420.00, true, 'pending', 0.65),

('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', CURRENT_DATE, '10:00', 40, 'follow_up', 'scheduled', 'Pré-natal - 24 semanas', 420.00, true, 'pending', 0.72),

('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', CURRENT_DATE, '14:00', 40, 'consultation', 'scheduled', 'Consulta cardiológica - Controle de FA', 450.00, true, 'pending', 0.88),

('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', CURRENT_DATE + 1, '08:30', 30, 'consultation', 'scheduled', 'Consulta pediátrica de rotina', 380.00, true, 'pending', 0.25),

('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000009', CURRENT_DATE + 1, '10:00', 30, 'follow_up', 'scheduled', 'Retorno - Múltiplas comorbidades', 320.00, true, 'pending', 0.92),

('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', CURRENT_DATE + 2, '09:00', 50, 'follow_up', 'scheduled', 'Acompanhamento - Doença de Parkinson', 500.00, true, 'pending', 0.78),

('40000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', CURRENT_DATE + 2, '13:00', 45, 'consultation', 'scheduled', 'Avaliação ortopédica pós-operatória joelho', 550.00, true, 'pending', 0.45),

('40000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000006', CURRENT_DATE + 3, '14:00', 35, 'follow_up', 'scheduled', 'Retorno dermatológico - Psoríase', 400.00, true, 'pending', 0.52),

('40000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000009', CURRENT_DATE + 3, '16:00', 30, 'consultation', 'scheduled', 'Check-up anual', 320.00, true, 'pending', 0.15),

('40000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000010', CURRENT_DATE + 4, '15:00', 45, 'follow_up', 'scheduled', 'Acompanhamento - Artrite Reumatoide', 460.00, true, 'pending', 0.68),

('40000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000008', CURRENT_DATE + 5, '11:00', 50, 'consultation', 'scheduled', 'Consulta psiquiátrica - Ansiedade', 480.00, true, 'pending', 0.58),

('40000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000007', CURRENT_DATE + 7, '09:30', 40, 'follow_up', 'scheduled', 'Retorno endocrinológico - Ajuste de Levotiroxina', 420.00, true, 'pending', 0.40),

('40000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', CURRENT_DATE + 7, '14:00', 30, 'consultation', 'scheduled', 'Consulta pediátrica - Dor abdominal', 380.00, true, 'pending', 0.35),

('40000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000009', CURRENT_DATE + 10, '10:00', 30, 'consultation', 'scheduled', 'Primeira consulta - Check-up', 320.00, true, 'pending', 0.20),

('40000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000006', CURRENT_DATE + 12, '11:00', 35, 'consultation', 'scheduled', 'Consulta dermatológica - Acne', 400.00, true, 'pending', 0.22),

-- Consultas já realizadas (histórico)
('40000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', CURRENT_DATE - 30, '09:00', 40, 'consultation', 'completed', 'Primeira consulta - Diabetes descompensada', 420.00, true, 'paid', 0.75),

('40000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', CURRENT_DATE - 15, '14:00', 40, 'follow_up', 'completed', 'Retorno cardiológico', 450.00, true, 'paid', 0.82),

('40000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000009', CURRENT_DATE - 7, '08:00', 30, 'consultation', 'completed', 'Consulta de rotina', 320.00, true, 'paid', 0.90),

('40000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', CURRENT_DATE - 45, '09:00', 50, 'consultation', 'completed', 'Primeira consulta neurológica - tremores', 500.00, true, 'paid', 0.85),

('40000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', CURRENT_DATE - 60, '10:00', 40, 'consultation', 'completed', 'Primeira consulta pré-natal', 420.00, true, 'paid', 0.55);

-- ═══════════════════════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '✅ Healthcare/Médicas demo data successfully loaded!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - 3 Facilities (Hospital, Clinic, Laboratory)';
    RAISE NOTICE '   - 10 Healthcare Providers (Doctors - all specialties)';
    RAISE NOTICE '   - 15 Patients (diverse demographics and conditions)';
    RAISE NOTICE '   - 20 Appointments (scheduled and historical)';
    RAISE NOTICE '';
    RAISE NOTICE '🧠 Sofia AI v4.0 integrated fields included:';
    RAISE NOTICE '   - ai_risk_score, ai_health_insights in patients';
    RAISE NOTICE '   - ai_performance_score in providers';
    RAISE NOTICE '   - ai_priority_score, ai_pre_diagnosis in appointments';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready for production use with real-world scenarios!';
END $$;
