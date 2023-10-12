import aiohttp
import fastapi
from pydantic import BaseModel
from starlette.templating import Jinja2Templates

from chainflow_api.config import Config
from chainflow_api.services.camunda import CamundaService


class Dependencies(BaseModel):
    """
    Holds the dependencies that should exist for the lifetime of the application.
    """

    aiohttp_session: aiohttp.ClientSession
    config: Config
    templates: Jinja2Templates
    camunda_service: CamundaService

    class Config:
        arbitrary_types_allowed = True
        extra = "forbid"
        allow_mutation = False

    def register(self, app: fastapi.FastAPI):
        """
        Registers itself in the application.
        """
        app.state.dependencies = self


def _get(request: fastapi.Request) -> Dependencies:
    return request.app.state.dependencies


def aiohttp_session(request: fastapi.Request) -> aiohttp.ClientSession:
    return _get(request).aiohttp_session


def templates(request: fastapi.Request) -> Jinja2Templates:
    return _get(request).templates


def camunda_service(request: fastapi.Request) -> CamundaService:
    return _get(request).camunda_service

