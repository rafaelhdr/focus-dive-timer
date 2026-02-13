from fastapi_mail import FastMail, MessageSchema, MessageType, NameEmail

from .interface import Mailer


class FastApiMailer(Mailer):
    def __init__(self, mail: FastMail):
        self._mail = mail

    async def send_login_code(self, email: str, code: str) -> None:
        message = MessageSchema(
            subject="Your login code",
            recipients=[NameEmail(name=email.split("@")[0], email=email)],
            template_body={"code": code},
            subtype=MessageType.html,
        )
        await self._mail.send_message(message, template_name="login_code.html")
