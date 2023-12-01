from camunda.external_task.external_task import ExternalTask, TaskResult
from camunda.external_task.external_task_worker import ExternalTaskWorker
from web3 import Web3
import os

TOPIC_NAME = os.getenv('TOPIC_NAME', "CheckTransactionConfirmed")
WEB3_URL = os.getenv('WEB3_URL', 'https://rpc.ankr.com/polygon_mumbai')
CAMUNDA_URL = os.getenv('CAMUNDA_URL', 'http://localhost:8080/engine-rest')

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


def check_transaction_status(tx_hash: str) -> bool:
    receipt = w3.eth.get_transaction_receipt(tx_hash)

    if receipt is None:
        return False

    if receipt['status'] != 1:
        return False
    return True


def check_transaction_data(tx_hash: str, value: int, txn_input: bytes) -> bool:
    try:
        transaction = w3.eth.get_transaction(tx_hash)
        if not transaction:
            return False

        if transaction['value'] != int(value):
            return False

        if transaction['input'] != txn_input:
            return False

        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False


def handle_task(task: ExternalTask) -> TaskResult:
    variables = task.get_variables()
    tx_hash = variables.get("transactionHash")
    txn_input = variables.get("transactionInput")
    txn_value = variables.get("value")

    if txn_input:
        txn_input = bytes.fromhex(txn_input[2:])

    if not tx_hash:
        return task.failure("Transaction hash not provided", "Transaction hash is missing from the variables", 3, 15000)

    is_transaction_same = check_transaction_data(tx_hash, txn_value, txn_input)

    if not is_transaction_same:
        return task.failure("Transaction not confirmed", "The transaction has not been confirmed on the blockchain", 3,
                            15000)

    transaction_success = check_transaction_status(tx_hash)
    if not transaction_success:
        return task.bpmn_error(
            "transaction_failed_onchain",
            "Transaction receipt status is not success in blockchain",
            variables
        )
    return task.complete(variables)


if __name__ == '__main__':
    ExternalTaskWorker(worker_id="1",
                       base_url=CAMUNDA_URL,
                       config=default_config).subscribe([TOPIC_NAME], handle_task)
