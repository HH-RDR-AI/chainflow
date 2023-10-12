from typing import Optional, List

import chainflow_pycamunda.processinst
import chainflow_pycamunda.processdef
import chainflow_pycamunda.task
import chainflow_pycamunda.variable
import chainflow_pycamunda.user
import chainflow_pycamunda.group
import requests.auth
import requests.sessions

from chainflow_api.config import Config
from chainflow_api.utils.jwt_password import SystemUser
from chainflow_api.utils.logger import get_logger

logger = get_logger(__name__)


class CamundaService:
    def __init__(
            self,
            *,
            config: Config,
            session: requests.sessions.Session,
    ):
        self.config = config
        self.session = session

    async def login(
            self,
            username: str,
            password: str
    ) -> Optional[chainflow_pycamunda.user.User]:
        get_profile = chainflow_pycamunda.user.GetProfile(self.config.CAMUNDA_URL,
                                                          id_=username)
        get_profile.session = self.session
        get_profile.session.auth = requests.auth.HTTPBasicAuth(username=username, password=password)
        try:
            return get_profile()
        except chainflow_pycamunda.Unauthorized:
            return None

    async def create_user(self,
                          username: str,
                          email: str,
                          password: str
                          ) -> None:
        session = requests.sessions.Session()
        session.auth = requests.auth.HTTPBasicAuth(
            username=self.config.CAMUNDA_ADMIN_LOGIN,
            password=self.config.CAMUNDA_ADMIN_PASSWORD,
        )
        create_user = chainflow_pycamunda.user.Create(
            url=self.config.CAMUNDA_URL,
            id_=username,
            first_name=username,
            last_name=username,
            email=email,
            password=password
        )
        create_user.session = session
        member_create = chainflow_pycamunda.group.MemberCreate(self.config.CAMUNDA_URL,
                                                               id_=self.config.CAMUNDA_USERS_GROUP_ID,
                                                               user_id=username)
        member_create.session = session
        create_user()
        member_create()

    async def get_tasks(self,
                        user: SystemUser) -> Optional[List[chainflow_pycamunda.task.Task]]:
        get_tasks = chainflow_pycamunda.task.GetList(self.config.CAMUNDA_URL,
                                                     assignee=user.username,
                                                     active=True)
        get_tasks.session = self.session
        get_tasks.session.auth = requests.auth.HTTPBasicAuth(
            username=user.username,
            password=user.password,
        )
        try:
            tasks = get_tasks()
            return tasks
        except chainflow_pycamunda.Unauthorized:
            return None

    async def get_task_variables(self,
                                 user: SystemUser,
                                 task_id: str) -> Optional[List[chainflow_pycamunda.variable.Variable]]:
        get_variables = chainflow_pycamunda.task.VariablesGetList(
            self.config.CAMUNDA_URL,
            task_id=task_id,
            deserialize_values=False,
        )
        get_variables.session = self.session
        get_variables.session.auth = requests.auth.HTTPBasicAuth(
            username=user.username,
            password=user.password,
        )
        return get_variables()

    async def get_instances(self,
                            user: SystemUser) -> Optional[List[chainflow_pycamunda.processinst.ProcessInstance]]:
        get_instances = chainflow_pycamunda.processinst.GetList(self.config.CAMUNDA_URL)
        get_instances.session = self.session
        get_instances.session.auth = requests.auth.HTTPBasicAuth(
            username=user.username,
            password=user.password,
        )
        try:
            instances = get_instances()
            for instance in instances:
                get_variables = chainflow_pycamunda.processinst.VariablesGetList(
                    self.config.CAMUNDA_URL,
                    process_instance_id=instance.id_,
                    deserialize_values=False,
                )
                get_variables.session = self.session
                variables = get_variables()
                instance.variables = variables
            return instances
        except chainflow_pycamunda.Unauthorized:
            return None

    async def start_instance(self,
                             user: SystemUser,
                             project_title: str,
                             niche: str
                             ) -> chainflow_pycamunda.processinst.ProcessInstance:
        start_instance = chainflow_pycamunda.processdef.StartInstance(self.config.CAMUNDA_URL,
                                                                      key='chainflow-engine')
        start_instance.session = self.session
        start_instance.session.auth = requests.auth.HTTPBasicAuth(
            username=user.username,
            password=user.password,
        )
        start_instance.variables = {
            "project_title": {
                "value": project_title,
                "type": "String"
            },
            "niche": {
                "value": niche,
                "type": "String"
            }
        }
        return start_instance()
