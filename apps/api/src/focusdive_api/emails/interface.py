from typing import Protocol


class Mailer(Protocol):
    async def send_login_code(self, email: str, code: str) -> None: ...
