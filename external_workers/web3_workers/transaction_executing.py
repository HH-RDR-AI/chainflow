import os

from camunda.external_task.external_task import ExternalTask, TaskResult
from camunda.external_task.external_task_worker import ExternalTaskWorker
from web3 import Web3


TOPIC_NAME = os.getenv('TOPIC_NAME', "web3_execution")
CAMUNDA_URL = os.getenv('CAMUNDA_URL', 'http://localhost:8080/engine-rest')
WEB3_URL = os.getenv('WEB3_URL', 'https://rpc.ankr.com/polygon_mumbai')

w3 = Web3(Web3.HTTPProvider(WEB3_URL))


# configuration for the Client
default_config = {
    "maxTasks": 1,
    "lockDuration": 10000,
    "asyncResponseTimeout": 5000,
    "retries": 3,
    "retryTimeout": 15000,
    "sleepSeconds": 30
}


def handle_task(task: ExternalTask) -> TaskResult:
    variables = task.get_variables()
    token_address = variables.get('token_address')
    is_backtesting = variables.get('is_backtesting')

    trading_signal = variables.get('trading_signal')

    # TODO: Web3 execution based on trading_signal value

    return task.complete(variables)


if __name__ == '__main__':
    ExternalTaskWorker(worker_id="web3_transaction_execution",
                       base_url=CAMUNDA_URL,
                       config=default_config).subscribe([TOPIC_NAME], handle_task)
