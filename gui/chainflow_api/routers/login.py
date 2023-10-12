from fastapi import Depends
from fastapi.params import Form
from fastapi.routing import APIRouter
from starlette.requests import Request
from starlette.responses import HTMLResponse, RedirectResponse

from chainflow_api import dependencies
from chainflow_api.utils.jwt_password import create_access_token, create_refresh_token
from chainflow_api.utils.logger import get_logger

login_routes = APIRouter()
logger = get_logger(__name__)


@login_routes.get(
    '/', response_class=HTMLResponse, include_in_schema=False)
@login_routes.get(
    '', response_class=HTMLResponse)
async def login(request: Request, templates: dependencies.Jinja2Templates = Depends(dependencies.templates)):
    """
    Renders login page
    """
    return templates.TemplateResponse("login.html", {"request": request})


@login_routes.post("/", include_in_schema=False)
@login_routes.post("")
async def login_post(request: Request,
                     username: str = Form(...),
                     password: str = Form(...),
                     templates: dependencies.Jinja2Templates = Depends(dependencies.templates),
                     camunda_service: dependencies.CamundaService = Depends(dependencies.camunda_service)
                     ):
    # Dummy check for demonstration purposes
    user_profile = await camunda_service.login(username, password)
    if user_profile:
        logger.info(f"User {username} logged in")
        return {
            "access_token": create_access_token(user_profile, password),
            "refresh_token": create_refresh_token(user_profile.id_, password),
        }
    else:
        return templates.TemplateResponse("login.html",
                                          {"request": request,
                                           "error": "Invalid credentials. Please try again."})


@login_routes.get(
    '/signup/', response_class=HTMLResponse, include_in_schema=False)
@login_routes.get(
    '/signup', response_class=HTMLResponse)
async def login(request: Request, templates: dependencies.Jinja2Templates = Depends(dependencies.templates)):
    """
    Renders signup page
    """
    return templates.TemplateResponse("signup.html", {"request": request})


@login_routes.post("/signup/", include_in_schema=False)
@login_routes.post("/signup")
async def signup_post(request: Request,
                      username: str = Form(...),
                      email: str = Form(...),
                      password: str = Form(...),
                      confirm_password: str = Form(...),
                      templates: dependencies.Jinja2Templates = Depends(dependencies.templates),
                      camunda_service: dependencies.CamundaService = Depends(dependencies.camunda_service)
                      ):
    if password != confirm_password:
        return templates.TemplateResponse("signup.html", {"request": request,
                                                          "error": "Passwords do not match. Please try again."})
    # Here, you'd typically store the provided information in your database
    await camunda_service.create_user(username, email, password)
    logger.info(f"User {username} created")
    return RedirectResponse(url="/login", status_code=303)

