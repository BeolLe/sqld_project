from datetime import datetime, timedelta, timezone
import unittest

import jwt

from app.core.security import (
    JWT_ALGORITHM,
    JWT_REFRESH_SECRET_KEY,
    JWT_SECRET_KEY,
    decode_access_token,
    decode_refresh_token,
)


class AuthTokenTypeTests(unittest.TestCase):
    def test_access_decoder_rejects_refresh_token(self):
        token = jwt.encode(
            {
                "sub": "00000000-0000-0000-0000-000000000001",
                "typ": "refresh",
                "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
            },
            JWT_SECRET_KEY,
            algorithm=JWT_ALGORITHM,
        )

        with self.assertRaises(jwt.InvalidTokenError):
            decode_access_token(token)

    def test_refresh_decoder_rejects_access_token(self):
        token = jwt.encode(
            {
                "sub": "00000000-0000-0000-0000-000000000001",
                "typ": "access",
                "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
            },
            JWT_REFRESH_SECRET_KEY,
            algorithm=JWT_ALGORITHM,
        )

        with self.assertRaises(jwt.InvalidTokenError):
            decode_refresh_token(token)


if __name__ == "__main__":
    unittest.main()
