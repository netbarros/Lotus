-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - HEALTHCARE/MÉDICAS COMPLETE SCHEMA
-- Sistema Médicas - Gestão Completa de Saúde
-- Integrado com Sofia AI v4.0 - The Brain
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE PATIENTS - Pacientes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Medical Record Number (MRN)
    mrn VARCHAR(50) NOT NULL UNIQUE,

    -- Demographics
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'undisclosed')),
    blood_type VARCHAR(10) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),

    -- Contact Information
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    mobile VARCHAR(50),

    -- Address
    address TEXT,
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Brasil',

    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(100),

    -- Insurance
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    insurance_card_photo_url TEXT,

    -- Medical Information
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    blood_pressure VARCHAR(20),
    height_cm DECIMAL(5, 2),
    weight_kg DECIMAL(5, 2),

    -- Primary Care
    primary_physician_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,

    -- Status & Statistics
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
    last_visit_date TIMESTAMP WITH TIME ZONE,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,

    -- Sofia AI Integration
    ai_risk_score DECIMAL(5, 4) CHECK (ai_risk_score BETWEEN 0 AND 1),
    ai_health_insights JSONB DEFAULT '{}'::JSONB,
    ai_recommended_actions JSONB DEFAULT '[]'::JSONB,
    ai_last_analysis TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT healthcare_patients_tenant_mrn UNIQUE (tenant_id, mrn)
);

-- Indexes
CREATE INDEX idx_healthcare_patients_tenant ON healthcare_patients(tenant_id);
CREATE INDEX idx_healthcare_patients_mrn ON healthcare_patients(mrn);
CREATE INDEX idx_healthcare_patients_cpf ON healthcare_patients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_healthcare_patients_email ON healthcare_patients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_healthcare_patients_phone ON healthcare_patients(phone);
CREATE INDEX idx_healthcare_patients_status ON healthcare_patients(status);
CREATE INDEX idx_healthcare_patients_primary_physician ON healthcare_patients(primary_physician_id);
CREATE INDEX idx_healthcare_patients_ai_risk ON healthcare_patients(ai_risk_score) WHERE ai_risk_score IS NOT NULL;

-- RLS
ALTER TABLE healthcare_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_patients_tenant_isolation ON healthcare_patients
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE PROVIDERS - Médicos e Profissionais de Saúde
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Professional Information
    professional_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    sub_specialty VARCHAR(100),
    license_number VARCHAR(50) NOT NULL,
    license_state VARCHAR(50),
    license_expiry DATE,

    -- Personal Information
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    date_of_birth DATE,

    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    mobile VARCHAR(50),

    -- Professional Details
    medical_school VARCHAR(200),
    graduation_year INTEGER,
    certifications TEXT[],
    languages TEXT[],

    -- Practice Information
    consultation_duration_minutes INTEGER DEFAULT 30,
    consultation_fee DECIMAL(10, 2),
    accepts_insurance BOOLEAN DEFAULT TRUE,
    accepted_insurance_providers TEXT[],

    -- Availability
    working_hours JSONB DEFAULT '{}'::JSONB,
    available_for_appointments BOOLEAN DEFAULT TRUE,

    -- Statistics
    total_patients INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,

    -- Sofia AI Integration
    ai_performance_score DECIMAL(5, 4),
    ai_specialization_match JSONB DEFAULT '{}'::JSONB,
    ai_recommended_training JSONB DEFAULT '[]'::JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'suspended')),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT healthcare_providers_tenant_license UNIQUE (tenant_id, license_number)
);

-- Indexes
CREATE INDEX idx_healthcare_providers_tenant ON healthcare_providers(tenant_id);
CREATE INDEX idx_healthcare_providers_specialty ON healthcare_providers(specialty);
CREATE INDEX idx_healthcare_providers_license ON healthcare_providers(license_number);
CREATE INDEX idx_healthcare_providers_status ON healthcare_providers(status);
CREATE INDEX idx_healthcare_providers_rating ON healthcare_providers(average_rating);

-- RLS
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_providers_tenant_isolation ON healthcare_providers
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE APPOINTMENTS - Agendamentos
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Appointment Details
    patient_id UUID NOT NULL REFERENCES healthcare_patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,

    -- Scheduling
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50) CHECK (appointment_type IN (
        'consultation', 'follow_up', 'emergency', 'procedure', 'exam', 'telemedicine'
    )),

    -- Status
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    )),

    -- Details
    reason TEXT,
    notes TEXT,
    symptoms TEXT,

    -- Check-in/Check-out
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,

    -- Payment
    consultation_fee DECIMAL(10, 2),
    insurance_covered BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'insurance_pending', 'partially_paid', 'refunded'
    )),

    -- Follow-up
    requires_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,

    -- Sofia AI Integration
    ai_suggested_time TIMESTAMP WITH TIME ZONE,
    ai_priority_score DECIMAL(5, 4),
    ai_predicted_duration INTEGER,
    ai_pre_diagnosis JSONB DEFAULT '{}'::JSONB,
    ai_recommended_exams JSONB DEFAULT '[]'::JSONB,

    -- Reminders
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,

    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_healthcare_appointments_tenant ON healthcare_appointments(tenant_id);
CREATE INDEX idx_healthcare_appointments_patient ON healthcare_appointments(patient_id);
CREATE INDEX idx_healthcare_appointments_provider ON healthcare_appointments(provider_id);
CREATE INDEX idx_healthcare_appointments_date ON healthcare_appointments(appointment_date);
CREATE INDEX idx_healthcare_appointments_datetime ON healthcare_appointments(appointment_date, appointment_time);
CREATE INDEX idx_healthcare_appointments_status ON healthcare_appointments(status);
CREATE INDEX idx_healthcare_appointments_payment ON healthcare_appointments(payment_status);

-- RLS
ALTER TABLE healthcare_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_appointments_tenant_isolation ON healthcare_appointments
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE MEDICAL RECORDS - Prontuários Médicos
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Record Details
    patient_id UUID NOT NULL REFERENCES healthcare_patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES healthcare_appointments(id) ON DELETE SET NULL,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,

    -- Record Date
    record_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Clinical Information
    chief_complaint TEXT,
    history_present_illness TEXT,
    physical_examination TEXT,
    vital_signs JSONB DEFAULT '{}'::JSONB, -- {"bp": "120/80", "temp": 36.5, "pulse": 72, "resp": 16}

    -- Diagnosis
    diagnosis_primary TEXT,
    diagnosis_secondary TEXT[],
    icd10_codes TEXT[],

    -- Treatment Plan
    treatment_plan TEXT,
    medications_prescribed JSONB DEFAULT '[]'::JSONB,
    procedures_performed JSONB DEFAULT '[]'::JSONB,

    -- Orders
    lab_orders JSONB DEFAULT '[]'::JSONB,
    imaging_orders JSONB DEFAULT '[]'::JSONB,
    referrals JSONB DEFAULT '[]'::JSONB,

    -- Follow-up
    follow_up_instructions TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_timeframe VARCHAR(100),

    -- Sofia AI Integration
    ai_diagnosis_suggestions JSONB DEFAULT '[]'::JSONB,
    ai_treatment_recommendations JSONB DEFAULT '[]'::JSONB,
    ai_drug_interactions JSONB DEFAULT '[]'::JSONB,
    ai_clinical_insights TEXT,
    ai_confidence_score DECIMAL(5, 4),

    -- Attachments
    attachments JSONB DEFAULT '[]'::JSONB, -- {url, type, name}

    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'completed', 'reviewed', 'amended', 'archived'
    )),
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_healthcare_medical_records_tenant ON healthcare_medical_records(tenant_id);
CREATE INDEX idx_healthcare_medical_records_patient ON healthcare_medical_records(patient_id);
CREATE INDEX idx_healthcare_medical_records_provider ON healthcare_medical_records(provider_id);
CREATE INDEX idx_healthcare_medical_records_appointment ON healthcare_medical_records(appointment_id);
CREATE INDEX idx_healthcare_medical_records_date ON healthcare_medical_records(record_date);
CREATE INDEX idx_healthcare_medical_records_status ON healthcare_medical_records(status);

-- RLS
ALTER TABLE healthcare_medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_medical_records_tenant_isolation ON healthcare_medical_records
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE PRESCRIPTIONS - Receitas Médicas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Prescription Details
    patient_id UUID NOT NULL REFERENCES healthcare_patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    medical_record_id UUID REFERENCES healthcare_medical_records(id) ON DELETE SET NULL,

    -- Prescription Date
    prescription_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Medications
    medications JSONB NOT NULL, -- [{name, dosage, frequency, duration, instructions, quantity}]

    -- Instructions
    general_instructions TEXT,
    special_instructions TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active', 'dispensed', 'expired', 'cancelled', 'renewed'
    )),

    -- Dispensing
    pharmacy_id UUID,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    dispensed_by VARCHAR(200),

    -- Renewal
    renewable BOOLEAN DEFAULT FALSE,
    max_renewals INTEGER DEFAULT 0,
    renewals_remaining INTEGER,

    -- Sofia AI Integration
    ai_drug_interactions JSONB DEFAULT '[]'::JSONB,
    ai_allergy_warnings JSONB DEFAULT '[]'::JSONB,
    ai_dosage_recommendations JSONB DEFAULT '{}'::JSONB,
    ai_alternative_medications JSONB DEFAULT '[]'::JSONB,

    -- Digital Signature
    digital_signature TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_healthcare_prescriptions_tenant ON healthcare_prescriptions(tenant_id);
CREATE INDEX idx_healthcare_prescriptions_patient ON healthcare_prescriptions(patient_id);
CREATE INDEX idx_healthcare_prescriptions_provider ON healthcare_prescriptions(provider_id);
CREATE INDEX idx_healthcare_prescriptions_date ON healthcare_prescriptions(prescription_date);
CREATE INDEX idx_healthcare_prescriptions_status ON healthcare_prescriptions(status);

-- RLS
ALTER TABLE healthcare_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_prescriptions_tenant_isolation ON healthcare_prescriptions
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE LAB RESULTS - Resultados de Exames
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Lab Result Details
    patient_id UUID NOT NULL REFERENCES healthcare_patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES healthcare_medical_records(id) ON DELETE SET NULL,

    -- Test Information
    test_name VARCHAR(200) NOT NULL,
    test_type VARCHAR(100),
    test_code VARCHAR(50),

    -- Collection
    collection_date DATE,
    collection_time TIME,
    specimen_type VARCHAR(100),

    -- Results
    result_date DATE,
    results JSONB NOT NULL, -- [{parameter, value, unit, reference_range, status}]
    overall_status VARCHAR(50) CHECK (overall_status IN (
        'normal', 'abnormal', 'critical', 'pending', 'cancelled'
    )),

    -- Lab Information
    lab_name VARCHAR(200),
    lab_address TEXT,
    lab_phone VARCHAR(50),

    -- Interpretation
    interpretation TEXT,
    notes TEXT,

    -- Sofia AI Integration
    ai_interpretation TEXT,
    ai_anomalies_detected JSONB DEFAULT '[]'::JSONB,
    ai_critical_flags JSONB DEFAULT '[]'::JSONB,
    ai_trend_analysis JSONB DEFAULT '{}'::JSONB,
    ai_recommendations TEXT,

    -- Files
    pdf_url TEXT,
    attachments JSONB DEFAULT '[]'::JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'reviewed', 'archived'
    )),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_healthcare_lab_results_tenant ON healthcare_lab_results(tenant_id);
CREATE INDEX idx_healthcare_lab_results_patient ON healthcare_lab_results(patient_id);
CREATE INDEX idx_healthcare_lab_results_provider ON healthcare_lab_results(provider_id);
CREATE INDEX idx_healthcare_lab_results_test ON healthcare_lab_results(test_name);
CREATE INDEX idx_healthcare_lab_results_date ON healthcare_lab_results(result_date);
CREATE INDEX idx_healthcare_lab_results_status ON healthcare_lab_results(status);
CREATE INDEX idx_healthcare_lab_results_overall ON healthcare_lab_results(overall_status);

-- RLS
ALTER TABLE healthcare_lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_lab_results_tenant_isolation ON healthcare_lab_results
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE FACILITIES - Unidades/Clínicas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Facility Information
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(100) CHECK (facility_type IN (
        'hospital', 'clinic', 'laboratory', 'imaging_center', 'pharmacy', 'emergency_care'
    )),

    -- Registration
    cnpj VARCHAR(18) UNIQUE,
    cnes VARCHAR(20), -- Cadastro Nacional de Estabelecimentos de Saúde
    license_number VARCHAR(100),

    -- Contact
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),

    -- Address
    address TEXT NOT NULL,
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Brasil',

    -- Operating Hours
    operating_hours JSONB DEFAULT '{}'::JSONB,
    emergency_24h BOOLEAN DEFAULT FALSE,

    -- Services
    services_offered TEXT[],
    specialties_available TEXT[],

    -- Capacity
    total_beds INTEGER,
    available_beds INTEGER,
    icu_beds INTEGER,
    emergency_beds INTEGER,

    -- Sofia AI Integration
    ai_capacity_prediction JSONB DEFAULT '{}'::JSONB,
    ai_resource_optimization JSONB DEFAULT '{}'::JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_healthcare_facilities_tenant ON healthcare_facilities(tenant_id);
CREATE INDEX idx_healthcare_facilities_type ON healthcare_facilities(facility_type);
CREATE INDEX idx_healthcare_facilities_city ON healthcare_facilities(city);
CREATE INDEX idx_healthcare_facilities_status ON healthcare_facilities(status);

-- RLS
ALTER TABLE healthcare_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_facilities_tenant_isolation ON healthcare_facilities
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- HEALTHCARE INVENTORY - Estoque de Medicamentos e Materiais
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS healthcare_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES healthcare_facilities(id) ON DELETE CASCADE,

    -- Item Information
    item_type VARCHAR(50) CHECK (item_type IN ('medication', 'equipment', 'supply', 'other')),
    item_name VARCHAR(200) NOT NULL,
    item_code VARCHAR(100),

    -- Medication Specific
    active_ingredient VARCHAR(200),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),

    -- Inventory
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    unit_of_measure VARCHAR(50),

    -- Cost
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(12, 2),

    -- Batch Information
    batch_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE,

    -- Storage
    storage_location VARCHAR(200),
    storage_requirements TEXT,
    requires_refrigeration BOOLEAN DEFAULT FALSE,

    -- Sofia AI Integration
    ai_demand_forecast JSONB DEFAULT '{}'::JSONB,
    ai_reorder_suggestion INTEGER,
    ai_usage_pattern JSONB DEFAULT '{}'::JSONB,
    ai_expiry_alerts JSONB DEFAULT '[]'::JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN (
        'available', 'low_stock', 'out_of_stock', 'expired', 'recalled', 'reserved'
    )),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_healthcare_inventory_tenant ON healthcare_inventory(tenant_id);
CREATE INDEX idx_healthcare_inventory_facility ON healthcare_inventory(facility_id);
CREATE INDEX idx_healthcare_inventory_type ON healthcare_inventory(item_type);
CREATE INDEX idx_healthcare_inventory_name ON healthcare_inventory(item_name);
CREATE INDEX idx_healthcare_inventory_status ON healthcare_inventory(status);
CREATE INDEX idx_healthcare_inventory_expiry ON healthcare_inventory(expiry_date);

-- RLS
ALTER TABLE healthcare_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY healthcare_inventory_tenant_isolation ON healthcare_inventory
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- TIMESCALEDB HYPERTABLES for Healthcare Analytics
-- ═══════════════════════════════════════════════════════════════════════════

-- Convert appointments to hypertable for time-series analysis
SELECT create_hypertable(
    'healthcare_appointments',
    'appointment_date',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

-- Convert medical records to hypertable
SELECT create_hypertable(
    'healthcare_medical_records',
    'record_date',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

-- Convert lab results to hypertable
SELECT create_hypertable(
    'healthcare_lab_results',
    'created_at',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS for Documentation
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE healthcare_patients IS 'Cadastro completo de pacientes com informações demográficas, contatos, emergência, plano de saúde e histórico médico. Integrado com Sofia AI para análise de risco e insights de saúde.';
COMMENT ON TABLE healthcare_providers IS 'Médicos e profissionais de saúde com especialidades, licenças, disponibilidade e performance. Sofia AI fornece score de performance e recomendações de treinamento.';
COMMENT ON TABLE healthcare_appointments IS 'Agendamentos completos com check-in/check-out, pagamento, follow-up. Sofia AI sugere horários otimizados e priorização baseada em urgência.';
COMMENT ON TABLE healthcare_medical_records IS 'Prontuários eletrônicos completos com sinais vitais, diagnósticos, tratamentos. Sofia AI fornece sugestões de diagnóstico e recomendações de tratamento.';
COMMENT ON TABLE healthcare_prescriptions IS 'Receitas médicas digitais com medicamentos, dosagens, instruções. Sofia AI valida interações medicamentosas e alergias.';
COMMENT ON TABLE healthcare_lab_results IS 'Resultados de exames laboratoriais com interpretação. Sofia AI detecta anomalias, analisa tendências e fornece recomendações.';
COMMENT ON TABLE healthcare_facilities IS 'Unidades de saúde (hospitais, clínicas, laboratórios) com capacidade e serviços. Sofia AI otimiza recursos e prevê demanda.';
COMMENT ON TABLE healthcare_inventory IS 'Controle de estoque de medicamentos e materiais. Sofia AI prevê demanda, sugere reposição e alerta sobre vencimentos.';
