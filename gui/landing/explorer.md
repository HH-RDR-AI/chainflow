---
layout: base
permalink: /explorer
type: explorer
title: Block Explorer as-a-service - Affordable Etherscan Alternative
description: "Cost-effective alternative to Etherscan for Ethereum Virtual Machine (EVM) compatible chains. Real-time blockchain data and insights for developers and users."
# --------------------------
# start: Banner config
banner:
  type: explorer
  title: Block Explorer as-a-service
  subtitle: Affordable Etherscan alternative for EVM compatible chains
  content: >
    * UI resembling classic Etherscan;

    * Most frequently used features, token balances, portfolio view;


    * Smart contract verification based on contact verification in Smart Contract Sanctuary and Sourcify;

    * Native UI for Sourcify validation;

    * ABI Execution Interface (Read/Write tabs).  Based on smart contract info extracted from Smart Contract Sanctuary and Sourcify storages, we provide the ability to connect web3 wallet and run requests and transactions against smart contract methods;

    * Internal Transactions and traces visualization tooling;

    * Account balances, token prices API for developers;

    * Optional integration with retail-focused DexGuru Trading Terminal (if there are AMMs already deployed on the target chain);

    * TradingView Charts, traders' performance, and tokens information trackers, on-chain analytics, etc;

    * Block Explorer for Appchains and flexible integration options for Appchain providers.

  actions:
    - {
        title: Book a Demo,
        url: https://webforms.pipedrive.com/f/6FnXreCfWNUNGqkESkdAsq5xMvP1zlnuo4XcyqAOgt5wv9gckXpSaEgQeQCqdsbG27,
        type: book,
      }

#  comment: >
#    We provide users with real-time data, trading charts, and various features to help them make informed decisions when trading cryptocurrencies.
# end: Banner config
# --------------------------

chains:
  - { chainId: 1, url: "https://ethereum.dex.guru" }
  - { chainId: 56, url: "https://bnb.dex.guru" }
  - { chainId: 137, url: "https://polygon.dex.guru" }
  - { chainId: 250, url: "https://fantom.dex.guru" }
  - { chainId: 100, url: "https://gnosis.dex.guru" }
  - { chainId: 10, url: "https://optimism.dex.guru" }
  - { chainId: 42161, url: "https://arbitrum.dex.guru" }
  - { chainId: 42170, url: "https://nova.dex.guru" }
  - { chainId: 7700, url: "https://canto.dex.guru" }
  - { chainId: 7701, url: "https://canto-test.dex.guru/" }
  - { chainId: 84531, url: "https://base-goerli.dex.guru/" }
  - { chainId: 8453, url: "https://base.dex.guru/" }
  - { chainId: 43114, url: "https://avalanche.dex.guru/" }

chainsWidget:
  subtitle: At DexGuru, we believe in EVM-compatible chains. Currently, our API provides data on
---
