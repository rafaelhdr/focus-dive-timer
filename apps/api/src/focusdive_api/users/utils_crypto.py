import base64
import hashlib

from cryptography.fernet import Fernet

from focusdive_api.core.settings import settings


def get_fernet():
    secret = settings.jwt_secret.get_secret_value().encode("utf-8")
    hashed = hashlib.sha256(secret).digest()[:32]
    fernet_key = base64.urlsafe_b64encode(hashed)
    return Fernet(fernet_key)


def encrypt_token(token: str) -> str:
    f = get_fernet()
    return f.encrypt(token.encode()).decode()


def decrypt_token(token: str) -> str:
    f = get_fernet()
    return f.decrypt(token.encode()).decode()
