from pydantic import BaseModel, ConfigDict, EmailStr


class MeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    is_beta_user: bool
