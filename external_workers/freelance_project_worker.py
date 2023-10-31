import time
from camunda.external_task.external_task import ExternalTask, TaskResult
from camunda.external_task.external_task_worker import ExternalTaskWorker
from web3 import Web3

# configuration for the Client
default_config = {
    "maxTasks": 1,
    "lockDuration": 10000,
    "asyncResponseTimeout": 5000,
    "retries": 3,
    "retryTimeout": 15000,
    "sleepSeconds": 30
}

TOPICS = ["WorkDealCreated", "WorkDealAccepted", "FundsLocked", "WorkDealCompleted"]

# Setup web3 instance and contract
w3 = Web3(Web3.HTTPProvider('https://rpc.ankr.com/polygon_mumbai'))
CONTRACT_ADDRESS = '0xCb0501262839980060A6791002400728A483c17F'
CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "dealId",
                "type": "string"
            }
        ],
        "name": "getDealStatus",
        "outputs": [
            {
                "internalType": "enum FreelanceWorkEscrow.WorkDealStatus",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI)

def get_deal_status(state: int) -> str:
    states = {
        0: "OPEN",
        1: "ACCEPTED",
        3: "FUNDS_LOCKED",
        4: "COMPLETED",
    }
    return states[state]

def handle_task_based_on_status(task: ExternalTask, expected_status: str) -> bool:
    variables = task.get_variables()
    deal_id = variables.get("projectName")
    if not deal_id:
        return False
    deal_status = None
    try:
        deal_status = contract.functions.getDealStatus(deal_id).call()
        return get_deal_status(deal_status) == expected_status
    except Exception as e:
        return False

TOPIC_TO_STATUS_MAP = {
    "WorkDealCreated": "OPEN",
    "WorkDealAccepted": "ACCEPTED",
    "FundsLocked": "FUNDS_LOCKED",
    "WorkDealCompleted": "COMPLETED"
}

def handle_task(task: ExternalTask) -> TaskResult:
    topic = task.get_topic_name()
    result = handle_task_based_on_status(task, TOPIC_TO_STATUS_MAP[topic])

    variables = task.get_variables()
    if result:
        return task.complete(variables)
    else:
        return task.failure("Failed to process task", "Failed to process task", 3, 15000)

if __name__ == '__main__':
    ExternalTaskWorker(worker_id="1",
                       base_url="http://localhost:8080/engine-rest",
                       config=default_config).subscribe(TOPICS, handle_task)
