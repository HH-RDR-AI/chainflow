module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // Ganache's default port
      network_id: "*", // Match any network id
      gas: 9721975,
      gasPrice: 20000000000
    }
  },
  compilers: {
    solc: {
      version: "0.8.20", // Your preferred Solidity version
      settings: {
        optimizer: {
            enabled: true,
            runs: 200
        }
      }
    }
  }
};