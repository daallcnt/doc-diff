CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO items (name)
VALUES ('first-item')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS data_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_owners (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES data_groups(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT,
  owner_phone_normalized TEXT,
  source_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_records (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES data_owners(id) ON DELETE CASCADE,
  person_name TEXT,
  phone TEXT,
  phone_normalized TEXT,
  intimacy_checked BOOLEAN,
  called BOOLEAN,
  party_member BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compare_records (
  id SERIAL PRIMARY KEY,
  full_name TEXT,
  birth_date TEXT,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL UNIQUE,
  province TEXT,
  city_county TEXT,
  district TEXT,
  dong TEXT,
  address_detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compare_upload_errors (
  id SERIAL PRIMARY KEY,
  batch_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  row_number INTEGER,
  full_name TEXT,
  phone_raw TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supporter_records (
  id SERIAL PRIMARY KEY,
  supporter_name TEXT,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stats_view (
  id INTEGER PRIMARY KEY,
  total_managers INTEGER NOT NULL DEFAULT 0,
  today_representatives INTEGER NOT NULL DEFAULT 0,
  today_added_managers INTEGER NOT NULL DEFAULT 0,
  favorite_contacts INTEGER NOT NULL DEFAULT 0,
  total_contacts INTEGER NOT NULL DEFAULT 0,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compare_records_view_meta (
  id INTEGER PRIMARY KEY,
  total_count INTEGER NOT NULL DEFAULT 0,
  dong_count INTEGER NOT NULL DEFAULT 0,
  latest_updated_at TIMESTAMPTZ,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts_view (
  phone_normalized TEXT PRIMARY KEY,
  phone TEXT,
  person_name TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  has_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  city_county TEXT,
  dong TEXT,
  address_detail TEXT,
  owner_primary_name TEXT,
  owner_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compare_records_view (
  id INTEGER PRIMARY KEY,
  full_name TEXT,
  birth_date TEXT,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL UNIQUE,
  province TEXT,
  city_county TEXT,
  district TEXT,
  dong TEXT,
  address_detail TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_supporter_records_created_at ON supporter_records(created_at DESC);
