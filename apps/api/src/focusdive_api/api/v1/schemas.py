from typing import Literal

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


class RefreshOut(BaseModel):
    access_token: str
    refresh_token: str


class UserPreferencesInOut(BaseModel):
    alarm_sound: Literal["minimalistic", "wooden", "snappy", "level"] = "minimalistic"
    focus_beep_enabled: bool = True
    focus_beep_volume: float = Field(1.0, ge=0, le=1)
    autostart_focus: bool = True
    autostart_break: bool = True
    default_focus_duration: int = Field(25, ge=1)
    default_break_duration: int = Field(5, ge=1)
