-- Migration: Initial Users and Roles Schema
-- Description: Create comprehensive user management system with role-based permissions
-- Date: 2025-01-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: roles
-- Description: Role-based access control with granular permissions
-- ============================================================================

CREATE TABLE public.roles (
  -- Primary key and timestamps
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Role information
  name varchar(100) NOT NULL UNIQUE,
  display_name jsonb NOT NULL, -- Multilingual names: {"fr": "Administrateur", "en": "Administrator", "es": "Administrador"}
  description jsonb, -- Multilingual descriptions
  
  -- Hierarchy and system settings
  level integer NOT NULL DEFAULT 0, -- Hierarchical level (0=super_admin, 1=admin, 2=manager, etc.)
  is_system_role boolean DEFAULT false NOT NULL, -- System roles cannot be deleted
  is_active boolean DEFAULT true NOT NULL,
  
  -- Granular permissions (JSONB for flexibility)
  permissions jsonb NOT NULL DEFAULT '{}',
  
  -- Audit trail
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT roles_name_format CHECK (name ~ '^[a-z_]+$'),
  CONSTRAINT roles_level_check CHECK (level >= 0 AND level <= 10)
);

-- Indexes for roles table
CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_roles_level ON public.roles(level);
CREATE INDEX idx_roles_active ON public.roles(is_active);
CREATE INDEX idx_roles_permissions ON public.roles USING GIN(permissions);
CREATE INDEX idx_roles_display_name ON public.roles USING GIN(display_name);

-- ============================================================================
-- Table: users  
-- Description: Extended user profiles with customs-specific information
-- ============================================================================

CREATE TABLE public.users (
  -- Link to Supabase auth
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_login_at timestamptz,
  
  -- Personal information
  email varchar(255) NOT NULL UNIQUE,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  display_name varchar(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  avatar_url text,
  phone varchar(50),
  
  -- Localization preferences
  preferred_locale varchar(5) DEFAULT 'fr' NOT NULL,
  timezone varchar(100) DEFAULT 'Europe/Paris',
  
  -- Organization structure (for future multi-tenant support)
  organization_id uuid, -- Will be used for multi-tenant architecture
  department varchar(100),
  job_title varchar(100),
  
  -- Role and permissions
  role_id uuid NOT NULL REFERENCES public.roles(id),
  permissions_override jsonb DEFAULT '{}', -- User-specific permission overrides
  
  -- Account status
  is_active boolean DEFAULT true NOT NULL,
  is_verified boolean DEFAULT false NOT NULL,
  account_locked_until timestamptz,
  failed_login_attempts integer DEFAULT 0,
  
  -- Customs-specific information
  customs_license_number varchar(100), -- Customs broker license number
  customs_license_expiry date,
  customs_authority varchar(100), -- Issuing customs authority
  
  -- Professional details
  professional_title varchar(100),
  years_of_experience integer,
  specializations text[], -- Array of specialization areas
  
  -- Audit trail
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT users_locale_check CHECK (preferred_locale IN ('fr', 'en', 'es')),
  CONSTRAINT users_failed_attempts_check CHECK (failed_login_attempts >= 0 AND failed_login_attempts <= 10),
  CONSTRAINT users_experience_check CHECK (years_of_experience >= 0 AND years_of_experience <= 60),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role_id ON public.users(role_id);
CREATE INDEX idx_users_organization ON public.users(organization_id);
CREATE INDEX idx_users_active ON public.users(is_active);
CREATE INDEX idx_users_customs_license ON public.users(customs_license_number);
CREATE INDEX idx_users_last_login ON public.users(last_login_at);
CREATE INDEX idx_users_locale ON public.users(preferred_locale);
CREATE INDEX idx_users_display_name ON public.users(display_name);

-- ============================================================================
-- Insert System Roles
-- Description: Pre-defined roles for the customs management system
-- ============================================================================

INSERT INTO public.roles (name, display_name, level, is_system_role, permissions, description) VALUES

-- Super Administrator (Level 0) - Full system access
('super_admin', 
 '{"fr": "Super Administrateur", "en": "Super Administrator", "es": "Super Administrador"}',
 0, 
 true, 
 '{
   "documents": {"create": true, "read": true, "update": true, "delete": true, "manage_versions": true, "bulk_operations": true},
   "fdi": {"create": true, "read": true, "update": true, "delete": true, "approve": true, "submit_customs": true, "bulk_operations": true},
   "rfcv": {"create": true, "read": true, "update": true, "delete": true, "approve": true, "bulk_operations": true},
   "invoicing": {"create": true, "read": true, "update": true, "delete": true, "approve": true, "export": true, "manage_templates": true},
   "users": {"create": true, "read": true, "update": true, "delete": true, "manage_roles": true, "impersonate": true},
   "system": {"view_audit_logs": true, "manage_configurations": true, "backup_restore": true, "system_maintenance": true}
 }',
 '{"fr": "Accès complet au système avec tous les privilèges", "en": "Full system access with all privileges", "es": "Acceso completo al sistema con todos los privilegios"}'),

-- Administrator (Level 1) - Administrative access without system management
('admin',
 '{"fr": "Administrateur", "en": "Administrator", "es": "Administrador"}',
 1, 
 true, 
 '{
   "documents": {"create": true, "read": true, "update": true, "delete": false, "manage_versions": true, "bulk_operations": true},
   "fdi": {"create": true, "read": true, "update": true, "delete": false, "approve": true, "submit_customs": true, "bulk_operations": false},
   "rfcv": {"create": true, "read": true, "update": true, "delete": false, "approve": true, "bulk_operations": false},
   "invoicing": {"create": true, "read": true, "update": true, "delete": false, "approve": true, "export": true, "manage_templates": false},
   "users": {"create": true, "read": true, "update": true, "delete": false, "manage_roles": false, "impersonate": false},
   "system": {"view_audit_logs": true, "manage_configurations": false, "backup_restore": false, "system_maintenance": false}
 }',
 '{"fr": "Gestion administrative avec permissions étendues", "en": "Administrative management with extended permissions", "es": "Gestión administrativa con permisos extendidos"}'),

-- Licensed Customs Broker (Level 2) - Professional customs operations
('customs_broker',
 '{"fr": "Commissionnaire Agréé", "en": "Licensed Customs Broker", "es": "Agente Aduanero Autorizado"}',
 2, 
 true, 
 '{
   "documents": {"create": true, "read": true, "update": true, "delete": false, "manage_versions": false, "bulk_operations": false},
   "fdi": {"create": true, "read": true, "update": true, "delete": false, "approve": true, "submit_customs": true, "bulk_operations": false},
   "rfcv": {"create": true, "read": true, "update": true, "delete": false, "approve": true, "bulk_operations": false},
   "invoicing": {"create": true, "read": true, "update": true, "delete": false, "approve": false, "export": true, "manage_templates": false},
   "users": {"create": false, "read": true, "update": false, "delete": false, "manage_roles": false, "impersonate": false},
   "system": {"view_audit_logs": false, "manage_configurations": false, "backup_restore": false, "system_maintenance": false}
 }',
 '{"fr": "Commissionnaire agréé avec autorités douanières", "en": "Licensed customs broker with customs authorities", "es": "Agente aduanero autorizado con autoridades aduaneras"}'),

-- Customs Officer (Level 3) - Government customs officer
('customs_officer',
 '{"fr": "Agent des Douanes", "en": "Customs Officer", "es": "Oficial de Aduanas"}',
 3, 
 true, 
 '{
   "documents": {"create": false, "read": true, "update": false, "delete": false, "manage_versions": false, "bulk_operations": false},
   "fdi": {"create": false, "read": true, "update": false, "delete": false, "approve": true, "submit_customs": false, "bulk_operations": false},
   "rfcv": {"create": false, "read": true, "update": false, "delete": false, "approve": true, "bulk_operations": false},
   "invoicing": {"create": false, "read": false, "update": false, "delete": false, "approve": false, "export": false, "manage_templates": false},
   "users": {"create": false, "read": false, "update": false, "delete": false, "manage_roles": false, "impersonate": false},
   "system": {"view_audit_logs": true, "manage_configurations": false, "backup_restore": false, "system_maintenance": false}
 }',
 '{"fr": "Agent des douanes pour validation et contrôle", "en": "Customs officer for validation and control", "es": "Oficial de aduanas para validación y control"}'),

-- Operator (Level 4) - Day-to-day operations
('operator',
 '{"fr": "Opérateur", "en": "Operator", "es": "Operador"}',
 4, 
 true, 
 '{
   "documents": {"create": true, "read": true, "update": true, "delete": false, "manage_versions": false, "bulk_operations": false},
   "fdi": {"create": true, "read": true, "update": true, "delete": false, "approve": false, "submit_customs": false, "bulk_operations": false},
   "rfcv": {"create": true, "read": true, "update": true, "delete": false, "approve": false, "bulk_operations": false},
   "invoicing": {"create": false, "read": true, "update": false, "delete": false, "approve": false, "export": false, "manage_templates": false},
   "users": {"create": false, "read": false, "update": false, "delete": false, "manage_roles": false, "impersonate": false},
   "system": {"view_audit_logs": false, "manage_configurations": false, "backup_restore": false, "system_maintenance": false}
 }',
 '{"fr": "Opérateur pour les tâches quotidiennes", "en": "Operator for daily tasks", "es": "Operador para tareas diarias"}'),

-- Client (Level 5) - External client access
('client',
 '{"fr": "Client", "en": "Client", "es": "Cliente"}',
 5, 
 true, 
 '{
   "documents": {"create": false, "read": true, "update": false, "delete": false, "manage_versions": false, "bulk_operations": false},
   "fdi": {"create": false, "read": true, "update": false, "delete": false, "approve": false, "submit_customs": false, "bulk_operations": false},
   "rfcv": {"create": false, "read": true, "update": false, "delete": false, "approve": false, "bulk_operations": false},
   "invoicing": {"create": false, "read": true, "update": false, "delete": false, "approve": false, "export": false, "manage_templates": false},
   "users": {"create": false, "read": false, "update": false, "delete": false, "manage_roles": false, "impersonate": false},
   "system": {"view_audit_logs": false, "manage_configurations": false, "backup_restore": false, "system_maintenance": false}
 }',
 '{"fr": "Client externe avec accès en lecture", "en": "External client with read access", "es": "Cliente externo con acceso de lectura"}');

-- ============================================================================
-- Triggers and Functions
-- Description: Automated timestamp updates and data validation
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON public.roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate permissions JSON structure
CREATE OR REPLACE FUNCTION validate_permissions_structure(permissions_json jsonb)
RETURNS boolean AS $$
BEGIN
    -- Check if all required permission categories exist
    IF NOT (permissions_json ? 'documents' AND 
            permissions_json ? 'fdi' AND 
            permissions_json ? 'rfcv' AND 
            permissions_json ? 'invoicing' AND 
            permissions_json ? 'users' AND 
            permissions_json ? 'system') THEN
        RETURN false;
    END IF;
    
    -- Additional validation logic can be added here
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE public.roles IS 'Role-based access control system with granular permissions for customs management';
COMMENT ON TABLE public.users IS 'Extended user profiles with customs-specific information and preferences';

COMMENT ON COLUMN public.roles.permissions IS 'JSONB structure containing granular permissions for each functional area';
COMMENT ON COLUMN public.roles.level IS 'Hierarchical level: 0=super_admin, 1=admin, 2=customs_broker, 3=customs_officer, 4=operator, 5=client';
COMMENT ON COLUMN public.roles.is_system_role IS 'System roles cannot be deleted or have their core permissions modified';

COMMENT ON COLUMN public.users.customs_license_number IS 'Official customs broker license number for regulatory compliance';
COMMENT ON COLUMN public.users.permissions_override IS 'User-specific permission overrides that extend or restrict role permissions';
COMMENT ON COLUMN public.users.preferred_locale IS 'User interface language preference: fr, en, or es';

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.users TO authenticated;