import json
from collections import namedtuple
from functools import cache
from pathlib import Path
from math import sqrt
from time import time
from typing import Literal

from camunda.external_task.external_task import ExternalTask, TaskResult
from camunda.external_task.external_task_worker import ExternalTaskWorker
from eth_typing import ChecksumAddress
from web3 import Web3

from external_workers.testnet_arbitrage.config import (
    WEB3_URL,
    CAMUNDA_URL,
    TOPIC_NAME,
    CAMUNDA_CLIENT_CONFIG,
    PRIVATE_KEY,
    ROUTER_ADDRESS,
)

GWEI = 10**9

w3 = Web3(Web3.HTTPProvider(WEB3_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)


@cache
def get_pool_contract(pool_address: ChecksumAddress):
    with open(Path(__file__).parent / "pool_abi.json") as f:
        pool_contract = w3.eth.contract(address=pool_address, abi=json.load(f))
    return pool_contract


@cache
def get_router_contract(router_address: ChecksumAddress):
    with open(Path(__file__).parent / "router_abi.json") as f:
        router_contract = w3.eth.contract(address=router_address, abi=json.load(f))
    return router_contract


# def handle_task(task: ExternalTask) -> TaskResult:
#     variables = task.get_variables()
#     tx_hash = variables.get("transactionHash")
#     txn_input = variables.get("transactionInput")
#     txn_value = variables.get("value")
#
#     if txn_input:
#         txn_input = bytes.fromhex(txn_input[2:])
#
#     if not tx_hash:
#         return task.failure(
#             "Transaction hash not provided",
#             "Transaction hash is missing from the variables",
#             3,
#             15000,
#         )
#
#     is_transaction_same = check_transaction_data(tx_hash, txn_value, txn_input)
#
#     if not is_transaction_same:
#         return task.failure(
#             "Transaction not confirmed",
#             "The transaction has not been confirmed on the blockchain",
#             3,
#             15000,
#         )
#
#     transaction_success = check_transaction_status(tx_hash)
#     if not transaction_success:
#         return task.bpmn_error(
#             "transaction_failed_onchain",
#             "Transaction receipt status is not success in blockchain",
#             variables,
#         )
#     return task.complete(variables)


def get_pool_reserves(pool_contract, target_token_address):
    Reserves = namedtuple("Reserves", ["target_token_reserve", "other_token_reserve"])
    reserves = pool_contract.functions.getReserves().call()
    token0, token1 = get_pool_tokens(pool_contract)

    if token0 == target_token_address:
        target_token_reserve = reserves[0]
        other_token_reserve = reserves[1]
    else:
        target_token_reserve = reserves[1]
        other_token_reserve = reserves[0]

    return Reserves(target_token_reserve, other_token_reserve)


@cache
def get_pool_tokens(pool_contract):
    return (
        w3.to_checksum_address(pool_contract.functions.token0().call()),
        w3.to_checksum_address(pool_contract.functions.token1().call()),
    )


@cache
def get_token_decimals(token_address: ChecksumAddress) -> int:
    with open(Path(__file__).parent / "erc20_abi.json") as f:
        erc20_contract = w3.eth.contract(
            address=w3.to_checksum_address(token_address), abi=json.load(f)
        )
    return erc20_contract.functions.decimals().call()


def calculate_swap_amounts(
    target_price, reserves, action: Literal["buy", "sell"]
) -> float:

    k = reserves.target_token_reserve * reserves.other_token_reserve
    target_token_target_reserve = sqrt(k / target_price)
    other_token_target_reserve = k / target_token_target_reserve
    target_amount = abs(target_token_target_reserve - reserves.target_token_reserve)
    other_amount = abs(other_token_target_reserve - reserves.other_token_reserve)

    if action == "buy":
        return other_amount
    else:
        return target_amount


def fix_price_to_target(
    target_token_address: str,
    target_price: float,
    target_pool_address: str,
    target_token_is_native: bool,
):
    target_pool_address = w3.to_checksum_address(target_pool_address)
    target_token_address = w3.to_checksum_address(target_token_address)

    pool_contract = get_pool_contract(target_pool_address)
    pool_tokens = get_pool_tokens(pool_contract)
    if target_token_address == pool_tokens[0]:
        target_token_index = 0
    elif target_token_address == pool_tokens[1]:
        target_token_index = 1
    else:
        raise ValueError("Token not in pool")

    decimals = [get_token_decimals(pool_tokens[0]), get_token_decimals(pool_tokens[1])]
    reserves = get_pool_reserves(pool_contract, target_token_address)
    current_price = (
        reserves.other_token_reserve / 10 ** decimals[1 - target_token_index]
    ) / (reserves.target_token_reserve / 10 ** decimals[target_token_index])

    if current_price < target_price:
        action = "buy"
        amount = calculate_swap_amounts(target_price, reserves, action)
        path = [pool_tokens[1 - target_token_index], pool_tokens[target_token_index]]
    else:
        action = "sell"
        amount = calculate_swap_amounts(target_price, reserves, action)
        path = [pool_tokens[target_token_index], pool_tokens[1 - target_token_index]]

    tx_hash = execute_swap(amount, path, target_token_is_native, action)
    return tx_hash


def execute_swap(
    amount: float,
    path: list[str],
    target_token_is_native: bool,
    action: Literal["buy", "sell"],
):
    t_now = time()
    deadline = int(t_now + 2 * 60)  # 2 minutes
    router_contract = get_router_contract(ROUTER_ADDRESS)
    amount = int(amount)
    if target_token_is_native:
        if action == "buy":
            tx_hash = router_contract.functions.swapExactTokensForETH(
                amount, 0, path, account.address, deadline
            ).build_transaction(
                {
                    "from": account.address,
                    "nonce": w3.eth.get_transaction_count(account.address),
                    "gas": 170000,
                    "gasPrice": w3.eth.gas_price + 2 * GWEI,
                }
            )
        else:
            tx_hash = router_contract.functions.swapExactETHForTokens(
                0, path, account.address, deadline
            ).build_transaction(
                {
                    "from": account.address,
                    "value": amount,
                    "nonce": w3.eth.get_transaction_count(account.address),
                    "gas": 170000,
                    "gasPrice": w3.eth.gas_price + 2 * GWEI,
                }
            )

    else:
        tx_hash = router_contract.functions.swapExactTokensForTokens(
            amount, 0, path, account.address, deadline
        ).build_transaction(
            {
                "from": account.address,
                "nonce": w3.eth.get_transaction_count(account.address),
                "gas": 170000,
                "gasPrice": w3.eth.gas_price + 2 * GWEI,
            }
        )
    signed_tx = w3.eth.account.sign_transaction(tx_hash, private_key=account.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return tx_hash


if __name__ == "__main__":
    # ExternalTaskWorker(
    #     worker_id="1", base_url=CAMUNDA_URL, config=CAMUNDA_CLIENT_CONFIG
    # ).subscribe([TOPIC_NAME], handle_task)
    print(
        fix_price_to_target(
            "0x80D1f6DAFC9c13E9d19aEDF75e3c1E2586d4a2a5",
            0.003407,
            "0xe2005c7718f3849f39c65b8ea93c7a7030aec463",
            True,
        )
    )
