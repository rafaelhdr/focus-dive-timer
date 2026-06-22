from datetime import datetime

from mongoengine import (
    BooleanField,
    DateTimeField,
    DictField,
    Document,
    EmailField,
    StringField,
)

from focusdive_api.timer.schemas import TimerState

from .utils_crypto import decrypt_token, encrypt_token


class User(Document):
    email = EmailField(required=True, unique=True)
    created = DateTimeField(default=datetime.utcnow)
    updated = DateTimeField(default=datetime.utcnow)
    is_beta_user = BooleanField(default=False)

    timer = DictField(default=dict)
    stripe_customer_id = StringField()
    integrations = DictField(default=dict)
    preferences = DictField(default=dict)

    _slack_token = StringField(db_field="slack_token")
    slack_team_id = StringField()
    slack_user_id = StringField()

    _spotify_refresh_token = StringField(db_field="spotify_refresh_token")
    spotify_access_requested = BooleanField(default=False)
    spotify_approved = BooleanField(default=False)

    def save(self, *args, **kwargs):
        self.updated = datetime.utcnow()
        return super().save(*args, **kwargs)

    @property
    def slack_token(self):
        return decrypt_token(self._slack_token) if self._slack_token else None

    @slack_token.setter
    def slack_token(self, value):
        self._slack_token = encrypt_token(value)

    @property
    def spotify_refresh_token(self):
        return decrypt_token(self._spotify_refresh_token) if self._spotify_refresh_token else None

    @spotify_refresh_token.setter
    def spotify_refresh_token(self, value):
        self._spotify_refresh_token = encrypt_token(value)

    @classmethod
    def upsert_by_email(cls, email: str) -> User:
        cls.objects(email=email).update_one(
            set_on_insert__email=email,
            set_on_insert__created=datetime.utcnow(),
            set__updated=datetime.utcnow(),
            upsert=True,
        )
        return cls.objects.get(email=email)

    def update_timer(self, new_timer: TimerState):
        self.timer.update(new_timer)
        self.save()

    def get_timer(self) -> dict:
        return self.timer or {}

    def update_integrations(self, new_prefs: dict):
        self.integrations.update(new_prefs)
        self.save()

    def get_integrations(self) -> dict:
        return self.integrations or {}

    def update_preferences(self, new_prefs: dict):
        self.preferences.update(new_prefs)
        self.save()

    def get_preferences(self) -> dict:
        return self.preferences or {}
