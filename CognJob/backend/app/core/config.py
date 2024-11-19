from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "CognJob"
    admin_email: str = "admin@example.com"
    items_per_user: int = 50
    openai_api_key: str

    class Config:
        env_file = ".env"

settings = Settings()
