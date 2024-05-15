# Telcoin Association Testnet Arbitrage Web3 Automation Process

Here we developed Process Definition for setting up the prices onto Telcoin Association [Testnet DEX](https://swap.telcoin.network/) 
for Testnet native $TEL token price.

## Assets on Telcoin Testnet:

- **gUSD testnet stable:**  [0xA2C07C15173C183771FFAd40c2e972F97e0bCe64](https://scan.telcoin.network/address/0xA2C07C15173C183771FFAd40c2e972F97e0bCe64)
- **WTEL wrapped native:**  [0x80d1f6dafc9c13e9d19aedf75e3c1e2586d4a2a5](https://scan.telcoin.network/address/0x80d1f6dafc9c13e9d19aedf75e3c1e2586d4a2a5)


Testnet DEX gUSD/WTEL Pool: [0xe2005c7718f3849f39c65b8ea93c7a7030aec463](https://scan.telcoin.network/address/0xe2005c7718f3849f39c65b8ea93c7a7030aec463)
Example of swap transaction: https://scan.telcoin.network/tx/0x1ca744072d2515cece14e5c09b7d3f468d9f39d2e5a3889eeb49884665fe5a48

The defined process is instantiated onto DexGuru Web3 Automation engine with following starting variables:

![telcoin_arbitrage_init_vars.png](telcoin_arbitrage_init_vars.png)

Ind reads the price data from Data Warehouse for 
[TEL token on ETH Mainnet](https://dex.guru/token/eth/0x467bccd9d29f223bce8043b84e8c8b282827790f). Simultaneously 
reserves for the TEL/gUSD are requested and sent along with prices and from TEL on ETH Mainnet to compute task.
Transaction compute task, for now, is simply calculating the delta, and building transaction for non-custodial execution
agent further down the line if we are forking towards it. More comprehensive logic on calculation side could be added
there in future for Smart Liquidity management. 

Based of the calculated_delta and comparison with allowed arbitrage_delta. set on process instantiation decision is made for sending
pre-calculated for execution by non-custodial Agent. Agent executing transactions against liquidity pool to re-balance the prices.
To do so Agent operates pre-provisoined liquidity in both gUSD and wTEL and currently deployed onto DexGuru infrastructure 
as a worker in docker container in K8S cluster where passphrase is hooked up from secrets places in cluster vault.


![telcoin_arbitrage.png](telcoin_arbitrage.png)

The running process management and monitoring going to be visualized in the Flow product, which Guru team launching along 
with DexGuru V2 at: https://flow.dex.guru 

![runtme_monitoring_example.png](runtme_monitoring_example.png)

![execution_context_dive.png](execution_context_dive.png)

## BPMN diagram

Process definition is defined in BPMN diagram where pre-defined snippets are orchestraerd and stiched together from 
different execution contexts like chains, token, pools and compute along with user's actions flow, the diagram could 
be viewed/edited through https://camunda.com/download/modeler/ or any other BPMN comparable editor: https://www.bpmn.org/

[telcoin_arbitrage.bpmn](telcoin_arbitrage.bpmn)

