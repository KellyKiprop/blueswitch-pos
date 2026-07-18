from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    daraja_consumer_key: str
    daraja_consumer_secret: str
    daraja_passkey: str
    daraja_shortcode: str
    daraja_env: str = "sandbox"

    class Config:
        env_file = ".env"

settings = Settings()
