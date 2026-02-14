from pydantic import BaseModel, ConfigDict, EmailStr, Field


class MeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    is_beta_user: bool


class LoginIn(BaseModel):
    email: EmailStr


class LoginOut(BaseModel):
    message: str


class VerifyIn(BaseModel):
    token: str = Field(min_length=6, max_length=6)
    email: EmailStr


class VerifyOut(BaseModel):
    access_token: str
    refresh_token: str
