-- Migration: Row Level Security Policies
-- Description: Comprehensive RLS policies for users and roles tables
-- Date: 2025-01-26

-- ============================================================================
-- Enable RLS on Tables
-- ============================================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for ROLES table
-- ============================================================================

-- Policy: Users can view active roles
CREATE POLICY "Users can view active roles" ON public.roles
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy: Admins can view all roles
CREATE POLICY "Admins can view all roles" ON public.roles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles 
                WHERE name IN ('super_admin', 'admin') 
                AND is_active = true
            )
        )
    );

-- Policy: Super admins can insert roles
CREATE POLICY "Super admins can insert roles" ON public.roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles 
                WHERE name = 'super_admin' 
                AND is_active = true
            )
        )
    );

-- Policy: Super admins can update non-system roles
CREATE POLICY "Super admins can update roles" ON public.roles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles 
                WHERE name = 'super_admin' 
                AND is_active = true
            )
        )
    )
    WITH CHECK (
        -- Cannot modify system roles (except super_admin)
        (is_system_role = false) OR 
        (is_system_role = true AND 
         EXISTS (
             SELECT 1 FROM public.users 
             WHERE users.id = auth.uid() 
             AND users.role_id IN (
                 SELECT id FROM public.roles 
                 WHERE name = 'super_admin'
             )
         )
        )
    );

-- Policy: Super admins can delete non-system roles
CREATE POLICY "Super admins can delete non-system roles" ON public.roles
    FOR DELETE
    TO authenticated
    USING (
        is_system_role = false 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles 
                WHERE name = 'super_admin' 
                AND is_active = true
            )
        )
    );

-- ============================================================================
-- RLS Policies for USERS table
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Policy: Users with user management permissions can view other users
CREATE POLICY "User managers can view users" ON public.users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND u.is_active = true
            AND r.is_active = true
            AND (
                r.permissions->>'users' IS NOT NULL
                AND (r.permissions->'users'->>'read')::boolean = true
            )
        )
    );

-- Policy: Users can update their own basic profile information
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        -- Ensure users cannot modify their role_id, permissions_override, or security-related fields
        AND OLD.role_id = NEW.role_id
        AND OLD.permissions_override = NEW.permissions_override
        AND OLD.is_active = NEW.is_active
        AND OLD.is_verified = NEW.is_verified
        AND OLD.failed_login_attempts = NEW.failed_login_attempts
        AND OLD.account_locked_until = NEW.account_locked_until
    );

-- Policy: User managers can insert new users
CREATE POLICY "User managers can insert users" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND u.is_active = true
            AND r.is_active = true
            AND (
                r.permissions->>'users' IS NOT NULL
                AND (r.permissions->'users'->>'create')::boolean = true
            )
        )
    );

-- Policy: User managers can update user profiles
CREATE POLICY "User managers can update users" ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        id != auth.uid() -- Cannot modify own role through this policy
        AND EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND u.is_active = true
            AND r.is_active = true
            AND (
                r.permissions->>'users' IS NOT NULL
                AND (r.permissions->'users'->>'update')::boolean = true
            )
        )
    )
    WITH CHECK (
        -- Ensure role hierarchy: can only assign roles of same or lower level
        EXISTS (
            SELECT 1 FROM public.users current_user
            JOIN public.roles current_role ON current_user.role_id = current_role.id
            JOIN public.roles target_role ON NEW.role_id = target_role.id
            WHERE current_user.id = auth.uid()
            AND current_role.level <= target_role.level
        )
    );

-- Policy: Super admins can delete users (soft delete by deactivating)
CREATE POLICY "Super admins can delete users" ON public.users
    FOR DELETE
    TO authenticated
    USING (
        id != auth.uid() -- Cannot delete own account
        AND EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND u.is_active = true
            AND r.name = 'super_admin'
            AND (
                r.permissions->>'users' IS NOT NULL
                AND (r.permissions->'users'->>'delete')::boolean = true
            )
        )
    );

-- ============================================================================
-- Additional Security Functions
-- ============================================================================

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
    user_id uuid,
    permission_category text,
    permission_action text
)
RETURNS boolean AS $$
DECLARE
    user_permissions jsonb;
    role_permissions jsonb;
    has_permission boolean := false;
BEGIN
    -- Get user's role permissions and personal overrides
    SELECT 
        r.permissions,
        u.permissions_override
    INTO role_permissions, user_permissions
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_id 
    AND u.is_active = true 
    AND r.is_active = true;
    
    -- Check if permission exists in role
    IF role_permissions->>permission_category IS NOT NULL THEN
        has_permission := (role_permissions->permission_category->>permission_action)::boolean;
    END IF;
    
    -- Check for user-specific override (can only grant additional permissions, not revoke)
    IF user_permissions->>permission_category IS NOT NULL THEN
        has_permission := has_permission OR (user_permissions->permission_category->>permission_action)::boolean;
    END IF;
    
    RETURN COALESCE(has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_effective_permissions(user_id uuid)
RETURNS jsonb AS $$
DECLARE
    role_permissions jsonb;
    user_overrides jsonb;
    effective_permissions jsonb;
BEGIN
    -- Get user's role permissions and overrides
    SELECT 
        r.permissions,
        u.permissions_override
    INTO role_permissions, user_overrides
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_id 
    AND u.is_active = true 
    AND r.is_active = true;
    
    -- Merge permissions (user overrides extend role permissions)
    effective_permissions := role_permissions;
    
    -- Apply user overrides if they exist
    IF user_overrides IS NOT NULL THEN
        effective_permissions := effective_permissions || user_overrides;
    END IF;
    
    RETURN COALESCE(effective_permissions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate role hierarchy in updates
CREATE OR REPLACE FUNCTION validate_role_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure users can only assign roles at their level or lower
    IF TG_OP = 'UPDATE' AND OLD.role_id != NEW.role_id THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.users current_user
            JOIN public.roles current_role ON current_user.role_id = current_role.id
            JOIN public.roles target_role ON NEW.role_id = target_role.id
            WHERE current_user.id = auth.uid()
            AND current_role.level <= target_role.level
        ) THEN
            RAISE EXCEPTION 'Cannot assign role above your hierarchy level';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply hierarchy validation trigger
CREATE TRIGGER validate_user_role_hierarchy
    BEFORE UPDATE OF role_id ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION validate_role_hierarchy();

-- ============================================================================
-- Grant Permissions for Functions
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION check_user_permission(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(uuid) TO authenticated;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON FUNCTION check_user_permission IS 'Checks if a user has a specific permission, considering both role permissions and user overrides';
COMMENT ON FUNCTION get_user_effective_permissions IS 'Returns the complete effective permissions for a user, merging role permissions with user overrides';
COMMENT ON FUNCTION validate_role_hierarchy IS 'Trigger function to ensure role assignments respect hierarchy levels';

-- Create indexes to optimize RLS policy performance
CREATE INDEX idx_users_role_permissions ON public.users(role_id, is_active);
CREATE INDEX idx_roles_permissions_users ON public.roles USING GIN(permissions) WHERE name IN ('super_admin', 'admin');

-- ============================================================================
-- Security Audit Log (Future Enhancement)
-- ============================================================================

-- Note: Consider implementing an audit log table in future migrations to track:
-- - Permission changes
-- - Role assignments
-- - User access patterns
-- - Administrative actions