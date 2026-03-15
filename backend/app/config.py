from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8")

    DATABASE_URL: str = "sqlite:///./data/prelegal.db"
    STATIC_DIR: str = "./static"
    OPENROUTER_API_KEY: str = ""
    COOKIE_NAME: str = "prelegal_session"


settings = Settings()
