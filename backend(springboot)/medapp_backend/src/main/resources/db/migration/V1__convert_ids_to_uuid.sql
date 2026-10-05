-- Flyway migration: convert bigint (bigserial) id columns to UUIDs
-- IMPORTANT: Run in dev environment. Only for Postgres.

BEGIN;

-- enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add new uuid columns populated with random uuids
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_uuid uuid DEFAULT gen_random_uuid();
UPDATE users SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS id_uuid uuid DEFAULT gen_random_uuid();
UPDATE doctors SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;

-- Populate a temporary user_id_uuid in doctors linking by the old bigint user_id
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS user_id_uuid uuid;
UPDATE doctors d
SET user_id_uuid = u.id_uuid
FROM users u
WHERE d.user_id::text = u.id::text OR d.user_id = u.id::bigint;

-- Drop foreign key constraint on doctors.user_id if present
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_user_id_fkey;

-- Drop primary keys (names usually table_pkey)
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_pkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;

-- Drop old numeric id columns
ALTER TABLE doctors DROP COLUMN IF EXISTS id;
ALTER TABLE users DROP COLUMN IF EXISTS id;

-- Rename uuid columns into place
ALTER TABLE users RENAME COLUMN id_uuid TO id;
ALTER TABLE doctors RENAME COLUMN id_uuid TO id;
ALTER TABLE doctors RENAME COLUMN user_id_uuid TO user_id;

-- Enforce not-null on new id columns
ALTER TABLE users ALTER COLUMN id SET NOT NULL;
ALTER TABLE doctors ALTER COLUMN id SET NOT NULL;
ALTER TABLE doctors ALTER COLUMN user_id SET NOT NULL;

-- Recreate primary keys and foreign keys
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE doctors ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);
ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

COMMIT;
