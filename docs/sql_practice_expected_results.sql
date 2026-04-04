CREATE TABLE IF NOT EXISTS practice.sql_practice_expected_results (
  id bigserial PRIMARY KEY,
  practice_id bigint NOT NULL,
  source_query text NOT NULL,
  result_columns jsonb NOT NULL DEFAULT '[]'::jsonb,
  result_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  row_count integer NOT NULL DEFAULT 0 CHECK (row_count >= 0),
  result_hash text NOT NULL,
  comparison_mode text NOT NULL DEFAULT 'unordered',
  is_active boolean NOT NULL DEFAULT true,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sql_practice_expected_results_practice_fk
    FOREIGN KEY (practice_id) REFERENCES practice.sql_practices(id) ON DELETE CASCADE,
  CONSTRAINT sql_practice_expected_results_comparison_mode_chk
    CHECK (comparison_mode IN ('ordered', 'unordered'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sql_practice_expected_results_active
  ON practice.sql_practice_expected_results (practice_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sql_practice_expected_results_practice_id
  ON practice.sql_practice_expected_results (practice_id);
