ARG BASE_IMAGE
FROM ${BASE_IMAGE}

COPY backend/app/api/sql/router.py /app/app/api/sql/router.py
COPY backend/app/db/oracle.py /app/app/db/oracle.py
COPY backend/app/services/sql_workspace.py /app/app/services/sql_workspace.py
