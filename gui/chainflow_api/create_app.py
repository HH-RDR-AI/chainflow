import aiohttp
import pydantic
import requests.sessions

from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, HTMLResponse, FileResponse, RedirectResponse
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

from chainflow_api import dependencies
from chainflow_api.config import Config
from chainflow_api.middlewares import RouteLoggerMiddleware
from chainflow_api.routers.dashboard import dashboard_routes
from chainflow_api.routers.login import login_routes
from chainflow_api.services.camunda import CamundaService
from chainflow_api.utils.logger import get_logger

logger = get_logger(__name__)


def create_app(config: Config):
    app = FastAPI(
        title='Chainflow APP',
        description=(
            """API/Wrapper for Chainflow APP"""
        ),
        version=config.VERSION,
        docs_url='/docs',
        redoc_url='/redoc',
        # openapi_tags=config.TAGS_METADATA
    )

    # Setup and register dependencies.
    aiohttp_session = aiohttp.ClientSession(
        trust_env=True,
        headers={'x-sys-key': 'SYS-KEY'},
    )
    camunda_service = CamundaService(
        config=config,
        session=requests.sessions.Session(),
    )
    deps = dependencies.Dependencies(
        aiohttp_session=aiohttp_session,
        config=config,
        templates=Jinja2Templates(directory="chainflow_api/templates"),
        camunda_service=camunda_service
    )
    deps.register(app)
    # Setup and register middlewares and routes.
    register_cors(app, config)
    register_gzip(app)
    register_routes(app)
    register_route_logging(app)

    # Common RFC 5741 Exceptions handling, https://tools.ietf.org/html/rfc5741#section-2
    @app.exception_handler(Exception)
    async def http_exception_handler(request: Request, exc: Exception):
        exception_dict = {
            "type": "Internal Server Error",
            "title": exc.__class__.__name__,
            "instance": f"{config.SERVER_HOST}{request.url.path}",
            "detail": f"{exc.__class__.__name__} at {str(exc)} when executing {request.method} request",
        }
        logger.error(exception_dict)
        return JSONResponse(exception_dict, status_code=500)

    @app.exception_handler(pydantic.ValidationError)
    async def handle_validation_error(
        request: Request, exc: pydantic.ValidationError
    ):  # pylint: disable=unused-argument
        """
        Handles validation errors.
        """
        logger.error(exc.errors())
        return JSONResponse({"message": exc.errors()}, status_code=422)

    @app.on_event("startup")
    async def startup_event():
        pass

    @app.on_event("shutdown")
    async def shutdown_event():
        pass

    @app.get("/")
    async def redirect():
        response = RedirectResponse(url='/login')
        return response

    @app.get("/health_check", include_in_schema=False, response_class=HTMLResponse)
    def health_check(request: Request,
                     templates: dependencies.Jinja2Templates = Depends(dependencies.templates)):
        """
        Health check
        ---
        tags:
            - util
        responses:
        """

        return templates.TemplateResponse("health_check.html", {"request": request, "Version": '0.01b',
                                                         "Name": 'nicheinside', "Status": 'OnLine'})

    @app.get('/favicon.ico', include_in_schema=False)
    async def favicon():
        return FileResponse(path="chainflow_api/static/favicon.ico")

    return app


def register_cors(app: FastAPI, config: Config):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=config.CORS_CREDENTIALS,
        allow_methods=config.CORS_METHODS,
        allow_headers=config.CORS_HEADERS,
    )


def register_gzip(app: FastAPI):
    app.add_middleware(GZipMiddleware, minimum_size=1000)


def register_route_logging(app: FastAPI):
    app.add_middleware(RouteLoggerMiddleware)


def register_routes(app: FastAPI):
    app.mount("/static", StaticFiles(directory="chainflow_api/static"), name="static")
    app.include_router(login_routes, prefix="/login", tags=["Login"])
    app.include_router(dashboard_routes, prefix="/dashboard", tags=["Dashboard"])


