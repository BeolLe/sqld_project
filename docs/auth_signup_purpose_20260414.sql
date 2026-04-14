ALTER TABLE auth.users
    ADD COLUMN IF NOT EXISTS signup_purpose_code SMALLINT,
    ADD COLUMN IF NOT EXISTS signup_purpose_other TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_signup_purpose_code_check'
          AND conrelid = 'auth.users'::regclass
    ) THEN
        ALTER TABLE auth.users
            ADD CONSTRAINT users_signup_purpose_code_check
            CHECK (signup_purpose_code IS NULL OR signup_purpose_code BETWEEN 1 AND 4);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_signup_purpose_other_check'
          AND conrelid = 'auth.users'::regclass
    ) THEN
        ALTER TABLE auth.users
            ADD CONSTRAINT users_signup_purpose_other_check
            CHECK (
                (signup_purpose_code = 4 AND signup_purpose_other IS NOT NULL AND btrim(signup_purpose_other) <> '')
                OR (signup_purpose_code IS DISTINCT FROM 4 AND signup_purpose_other IS NULL)
            );
    END IF;
END $$;

COMMENT ON COLUMN auth.users.signup_purpose_code IS
'NULL: 미선택, 1: SQLD 자격증 시험 준비, 2: SQL 실력 향상, 3: 학교/직장 학습용, 4: 기타';

COMMENT ON COLUMN auth.users.signup_purpose_other IS
'signup_purpose_code = 4(기타)일 때 입력한 자유 텍스트';
