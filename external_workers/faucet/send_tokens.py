import os

from camunda.external_task.external_task import ExternalTask, TaskResult
from camunda.external_task.external_task_worker import ExternalTaskWorker
from redis import Redis
from web3 import Web3

from external_workers.faucet.config import DEFAULT_CONFIG, PRIVATE_KEY
from external_workers.web3_workers.check_transaction_status import WEB3_URL

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)

SEND_TOKENS_TOPIC_NAME = os.getenv("SEND_TOKENS_TOPIC_NAME", "send_tokens")

if not PRIVATE_KEY:
    raise ValueError("PRIVATE_KEY is not set")
w3 = Web3(Web3.HTTPProvider(WEB3_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)
CHAIN_ID = w3.eth.chain_id
GWEI = 10**9


def handle_send_native_tokens(task: ExternalTask) -> TaskResult:
    variables = task.get_variables()
    wallet_address = variables.get("wallet_address")
    nonce = w3.eth.get_transaction_count(account.address)
    tx = {
        "to": wallet_address,
        "value": w3.to_wei(1, "ether"),
        "gas": 21000,
        "gasPrice": w3.eth.gas_price + 3 * GWEI,
        "nonce": nonce,
        "chainId": CHAIN_ID,
    }
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    redis_client.set(wallet_address, tx_hash, ex=86400)  # 24h
    return task.complete({"tx_hash": tx_hash})


if __name__ == "__main__":
    redis_client = Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
    )
    worker = ExternalTaskWorker(
        worker_id="validate_wallet_address",
        base_url=CAMUNDA_URL,
        config=DEFAULT_CONFIG,
    ).subscribe([SEND_TOKENS_TOPIC_NAME], handle_send_native_tokens)
