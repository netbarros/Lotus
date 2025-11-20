/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🌱 SEED DATA - Users and Roles                                          ║
 * ║ Complete demo data for users, roles, and permissions                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO directus_roles (id, name, icon, description, ip_access, enforce_tfa, admin_access, app_access)
VALUES
  ('admin-role-uuid', 'Administrator', 'verified_user', 'Full system access', NULL, false, true, true),
  ('manager-role-uuid', 'Manager', 'supervised_user_circle', 'Manage pétalas and users', NULL, false, false, true),
  ('developer-role-uuid', 'Developer', 'code', 'API and integration access', NULL, false, false, true),
  ('user-role-uuid', 'User', 'person', 'Standard user access', NULL, false, false, true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- DEMO USERS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO directus_users (id, first_name, last_name, email, password, role, status, token)
VALUES
  (
    'admin-user-uuid',
    'Admin',
    'System',
    'admin@magicsaas.com',
    '$argon2id$v=19$m=65536,t=3,p=4$qwertyuiop1234567890',  -- password: admin123
    'admin-role-uuid',
    'active',
    NULL
  ),
  (
    'manager-user-uuid',
    'Maria',
    'Silva',
    'maria.silva@magicsaas.com',
    '$argon2id$v=19$m=65536,t=3,p=4$qwertyuiop1234567890',  -- password: manager123
    'manager-role-uuid',
    'active',
    NULL
  ),
  (
    'developer-user-uuid',
    'João',
    'Santos',
    'joao.santos@magicsaas.com',
    '$argon2id$v=19$m=65536,t=3,p=4$qwertyuiop1234567890',  -- password: dev123
    'developer-role-uuid',
    'active',
    NULL
  ),
  (
    'user-1-uuid',
    'Ana',
    'Costa',
    'ana.costa@example.com',
    '$argon2id$v=19$m=65536,t=3,p=4$qwertyuiop1234567890',  -- password: user123
    'user-role-uuid',
    'active',
    NULL
  ),
  (
    'user-2-uuid',
    'Pedro',
    'Oliveira',
    'pedro.oliveira@example.com',
    '$argon2id$v=19$m=65536,t=3,p=4$qwertyuiop1234567890',  -- password: user123
    'user-role-uuid',
    'active',
    NULL
  )
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PERMISSIONS (Basic CRUD for each role)
-- ═══════════════════════════════════════════════════════════════════════════

-- Admin: Full access to everything
INSERT INTO directus_permissions (role, collection, action, permissions, validation, fields)
VALUES
  ('admin-role-uuid', NULL, 'create', '{}', '{}', '*'),
  ('admin-role-uuid', NULL, 'read', '{}', '{}', '*'),
  ('admin-role-uuid', NULL, 'update', '{}', '{}', '*'),
  ('admin-role-uuid', NULL, 'delete', '{}', '{}', '*')
ON CONFLICT DO NOTHING;

-- Manager: Manage pétalas, users (read only), settings
INSERT INTO directus_permissions (role, collection, action, permissions, validation, fields)
VALUES
  ('manager-role-uuid', 'petalas', 'create', '{}', '{}', '*'),
  ('manager-role-uuid', 'petalas', 'read', '{}', '{}', '*'),
  ('manager-role-uuid', 'petalas', 'update', '{}', '{}', '*'),
  ('manager-role-uuid', 'petalas', 'delete', '{}', '{}', '*'),
  ('manager-role-uuid', 'directus_users', 'read', '{}', '{}', 'id,first_name,last_name,email,role')
ON CONFLICT DO NOTHING;

-- Developer: API access, read pétalas
INSERT INTO directus_permissions (role, collection, action, permissions, validation, fields)
VALUES
  ('developer-role-uuid', 'petalas', 'read', '{}', '{}', '*'),
  ('developer-role-uuid', 'sofia_ai_logs', 'read', '{}', '{}', '*'),
  ('developer-role-uuid', 'sofia_ai_decisions', 'read', '{}', '{}', '*')
ON CONFLICT DO NOTHING;

-- User: Read own data
INSERT INTO directus_permissions (role, collection, action, permissions, validation, fields)
VALUES
  ('user-role-uuid', 'petalas', 'read', '{"status":{"_eq":"active"}}', '{}', 'id,name,description,icon'),
  ('user-role-uuid', 'directus_users', 'read', '{"id":{"_eq":"$CURRENT_USER"}}', '{}', 'id,first_name,last_name,email'),
  ('user-role-uuid', 'directus_users', 'update', '{"id":{"_eq":"$CURRENT_USER"}}', '{}', 'first_name,last_name,email,avatar')
ON CONFLICT DO NOTHING;
