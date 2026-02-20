from pydantic import BaseModel


class SlackStatusOut(BaseModel):
    is_connected: bool
