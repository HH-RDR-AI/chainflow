from fastapi import Depends
from fastapi.routing import APIRouter
from fastapi.params import Form, Query

from starlette.requests import Request

from chainflow_api import dependencies
from chainflow_api.utils.jwt_password import get_current_user, SystemUser
from chainflow_api.utils.logger import get_logger

dashboard_routes = APIRouter()
logger = get_logger(__name__)


@dashboard_routes.get("/", include_in_schema=False)
@dashboard_routes.get("")
async def dashboard(
        request: Request,
        templates: dependencies.Jinja2Templates = Depends(dependencies.templates)):
    return templates.TemplateResponse('dashboard.html',
                                      {"request": request})


@dashboard_routes.get('/data/', include_in_schema=False)
@dashboard_routes.get('/data')
async def dashboard_data(user: SystemUser = Depends(get_current_user),
                         camunda_service: dependencies.CamundaService = Depends(dependencies.camunda_service)
                         ):
    # Validate JWT token and fetch data (pseudo-code)
    logger.info(f"User: {user}")
    tasks = await camunda_service.get_tasks(user)
    logger.info(f"Tasks: {tasks}")
    return tasks


@dashboard_routes.post('/data/variables/', include_in_schema=False)
@dashboard_routes.post('/data/variables')
async def dashboard_data(user: SystemUser = Depends(get_current_user),
                         camunda_service: dependencies.CamundaService = Depends(dependencies.camunda_service),
                         task_id: str = Form(...),
                         ):
    # Validate JWT token and fetch data (pseudo-code)
    logger.info(f"User: {user}")
    variables = await camunda_service.get_task_variables(user, task_id)
    logger.info(f"variables: {variables}")
    return variables


@dashboard_routes.post('/new_research/', include_in_schema=False)
@dashboard_routes.post('/new_research', include_in_schema=False)
async def new_research(
        project_title: str = Form(...),
        niche: str = Form(...),
        user: SystemUser = Depends(get_current_user),
        camunda_service: dependencies.CamundaService = Depends(dependencies.camunda_service)
):
    return await camunda_service.start_instance(user, project_title, niche)
