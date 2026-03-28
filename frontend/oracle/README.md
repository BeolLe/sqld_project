## Oracle Seed Script

`src/data/tables/*` 아래의 원본 SQL을 읽어서 Oracle 적재용 `MASTER_*` 스크립트를 생성합니다.

생성 대상:

- `generated/emp_master.sql`
- `generated/order_master.sql`
- `generated/student_master.sql`
- `generated/all_master.sql`

사용 방법:

```bash
cd /mnt/data/ronny-project/sqld_project_git/frontend/oracle
python3 generate_master_sql.py
```

옵션:

```bash
python3 generate_master_sql.py --output-dir ./generated
```

출력 스크립트는 아래 원칙을 따릅니다.

- 원본 테이블명은 `MASTER_*` 로 변환
- FK 순서를 고려해 테이블셋별 스키마/데이터를 병합
- 재실행 편의를 위해 `DROP TABLE ... CASCADE CONSTRAINTS` 블록 포함
- 마지막에 `COMMIT` 포함
