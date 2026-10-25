"""Shared SQLD/ADsP identifiers. Content ownership always comes from the database."""

from typing import Literal

from fastapi import HTTPException

ExamType = Literal["sqld", "adsp"]
EXAM_PREFIXES = {"sqld": "sqld_mock_", "adsp": "adsp_mock_"}


def validate_exam_type(exam_type: str) -> ExamType:
    if exam_type not in EXAM_PREFIXES:
        raise HTTPException(status_code=422, detail="exam_type must be sqld or adsp")
    return exam_type


def exam_code(exam_id: str, exam_type: ExamType = "sqld") -> str:
    return EXAM_PREFIXES[validate_exam_type(exam_type)] + exam_id


def public_exam_id(code: str, exam_type: ExamType = "sqld") -> str:
    prefix = EXAM_PREFIXES[validate_exam_type(exam_type)]
    if not code.startswith(prefix):
        raise ValueError("exam code does not belong to the requested exam type")
    return code[len(prefix):]
