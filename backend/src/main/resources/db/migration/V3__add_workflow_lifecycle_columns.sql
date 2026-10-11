-- V3: Add Claims Workflow Lifecycle Columns
-- Supports Officer Recommendation, Supervisor Decision, Insurer Admin Settlement Processing,
-- and Configurable High-Value Threshold

ALTER TABLE public.insurers 
ADD COLUMN IF NOT EXISTS high_value_threshold NUMERIC(14, 2) DEFAULT 500000.00;

ALTER TABLE public.claims 
ADD COLUMN IF NOT EXISTS officer_recommendation VARCHAR(50),
ADD COLUMN IF NOT EXISTS officer_recommendation_justification TEXT,
ADD COLUMN IF NOT EXISTS officer_recommended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS officer_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS supervisor_decision VARCHAR(50),
ADD COLUMN IF NOT EXISTS supervisor_decision_justification TEXT,
ADD COLUMN IF NOT EXISTS supervisor_decided_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS admin_processing_status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS settlement_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS admin_processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS policy_rules_snapshot TEXT;
