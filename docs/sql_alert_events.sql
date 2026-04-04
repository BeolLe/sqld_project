CREATE TABLE IF NOT EXISTS logs.sql_alert_events (
    id bigserial PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),
    alert_type text NOT NULL,
    practice_id text NOT NULL,
    user_id uuid NULL,
    request_id text NULL,
    normalized_query text NOT NULL,
    query_hash text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sql_alert_events_dedupe
    ON logs.sql_alert_events (alert_type, practice_id, query_hash);

CREATE INDEX IF NOT EXISTS idx_sql_alert_events_created_at
    ON logs.sql_alert_events (created_at DESC);
