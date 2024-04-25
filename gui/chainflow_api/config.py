from typing import List

from pydantic_settings import BaseSettings


class Config(BaseSettings):
    VERSION: str = '0.0.1'
    WORKERS_COUNT: int = 1
    SERVER_HOST: str = '0.0.0.0'
    SERVER_PORT: int = 8005
    RELOAD: bool = True
    LOGGING_LEVEL: str = 'INFO'
    LOGSTASH_LOGGING_LEVEL: str = 'DEBUG'
    LOG_HANDLERS: list = ['console']
    LOGSTASH: str = 'logstash-logstash.logging.svc.cluster.local'
    PORT: int = 5959
    CORS_ORIGINS: List[str] = ['*']
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ['*']
    CORS_HEADERS: List[str] = ['*']
    CAMUNDA_URL: str = 'https://chainflow-engine.dexguru.biz/engine-rest'
    CAMUNDA_ADMIN_LOGIN: str = 'demo'
    CAMUNDA_ADMIN_PASSWORD: str = 'demo'
    CAMUNDA_USERS_GROUP_ID: str = 'camunda-admin'
    JWT_SECRET_KEY: str = 'JWT_SECRET_KEY'
    JWT_REFRESH_SECRET_KEY: str = 'JWT_REFRESH_SECRET_KEY'


config = Config()
