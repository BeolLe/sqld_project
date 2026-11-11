"""Resolve reference-query ordering to returned columns, without executing SQL."""
from functools import lru_cache
import re

from app.services.sql_workspace import split_sql_segments


def tokens(sql: str) -> list[str]:
    result = []
    for kind, value in split_sql_segments(sql):
        if kind == 'code':
            result.extend(re.findall(r'[\w$#]+|\S', value.upper()))
        elif kind != 'comment':
            result.append(value)
    return result


def levels(parts: list[str]) -> list[int]:
    depth, result = 0, []
    for token in parts:
        if token == ')':
            depth -= 1
        if depth < 0:
            raise ValueError('unbalanced SQL')
        result.append(depth)
        if token == '(':
            depth += 1
    if depth:
        raise ValueError('unbalanced SQL')
    return result


def split_list(parts: list[str]) -> list[list[str]]:
    result, start = [], 0
    for i, depth in enumerate(levels(parts)):
        if depth == 0 and parts[i] == ',':
            result.append(parts[start:i])
            start = i + 1
    return result + [parts[start:]]


def identifier(token: str) -> str:
    return token.strip('"').replace('""', '"').upper()


@lru_cache(maxsize=256)
def result_order_keys(query: str, columns: tuple[str, ...]) -> tuple[str, ...] | None:
    """() means no result ordering; None means retain strict legacy comparison.

    ponytail: this is a bounded projection/order resolver, not a SQL evaluator.
    Nonprojected expressions and hierarchy ordering stay strict; add explicit
    grading-key metadata if future questions require evaluating those keys.
    """
    try:
        return resolve_order(tokens(query.rstrip().rstrip(';')), columns)
    except (ValueError, IndexError):
        return None


def resolve_order(parts: list[str], columns: tuple[str, ...]) -> tuple[str, ...] | None:
    depth = levels(parts)
    top = [i for i, value in enumerate(depth) if value == 0]
    selects = [i for i in top if parts[i] == 'SELECT']
    if not selects:
        return None
    start = selects[0]
    from_pos = next((i for i in top if i > start and parts[i] == 'FROM'), len(parts))
    order_positions = [i for i in top if parts[i:i + 2] == ['ORDER', 'BY']]
    if any(parts[i:i + 3] == ['ORDER', 'SIBLINGS', 'BY'] for i in top):
        return None
    if not order_positions:
        # Preserve the ordering of a simple Oracle inline-view Top-N query.
        if parts[from_pos + 1:from_pos + 2] == ['(']:
            end = next(i for i in top if i > from_pos + 1 and parts[i] == ')')
            projection = split_list(parts[start + 1:from_pos])
            simple = all(len(p) == 1 and identifier(p[0]) == col for p, col in zip(projection, columns))
            suffix = parts[end + 1:]
            if simple and len(projection) == len(columns) and re.fullmatch(
                r'WHERE ROWNUM (?:< =|<) \d+', ' '.join(suffix)
            ):
                return resolve_order(parts[from_pos + 2:end], columns)
        # Analytic-function and subquery ordering do not order the outer result.
        return ()

    order_pos = order_positions[-1]
    end = next((i for i in top if i > order_pos and parts[i] in {'FETCH', 'OFFSET', 'FOR'}), len(parts))
    projection = parts[start + 1:min(from_pos, order_pos)]
    if projection[:1] in (['DISTINCT'], ['ALL']):
        projection = projection[1:]
    expressions = split_list(projection)
    mapping: dict[tuple[str, ...], set[str]] = {}
    if len(expressions) == len(columns):
        for expression, column in zip(expressions, columns):
            expr_depth = levels(expression)
            as_pos = [i for i, token in enumerate(expression) if token == 'AS' and expr_depth[i] == 0]
            if as_pos:
                expression = expression[:as_pos[-1]]
            elif len(expression) > 1 and identifier(expression[-1]) == column and expression[-2] != '.':
                # Only strip an implicit alias when separated from an expression.
                if expression[-2] == ')' or expression[-2] == 'END' or re.fullmatch(r'[\w$#]+', expression[-2]):
                    expression = expression[:-1]
            mapping.setdefault(tuple(expression), set()).add(column)

    keys = []
    for term in split_list(parts[order_pos + 2:end]):
        if len(term) >= 2 and term[-2] == 'NULLS' and term[-1] in {'FIRST', 'LAST'}:
            term = term[:-2]
        if term and term[-1] in {'ASC', 'DESC'}:
            term = term[:-1]
        if not term:
            return None
        if len(term) == 1 and term[0].isdigit():
            pos = int(term[0])
            if not 1 <= pos <= len(columns):
                return None
            key = columns[pos - 1]
        elif len(term) == 1 and identifier(term[0]) in columns:
            key = identifier(term[0])
        elif len(mapping.get(tuple(term), ())) == 1:
            key = next(iter(mapping[tuple(term)]))
        else:
            return None
        keys.append(key)
    return tuple(keys) if keys else None
