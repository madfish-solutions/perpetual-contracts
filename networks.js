const {
    LOCALHOST_URL,
    GAS_PRICE,
    GAS,
    BAOBAB_URL,
    DIODON_URL
} = require("./constants")
const HDWalletProvider = require("@truffle/hdwallet-provider")

/*eslint-disable */
module.exports = {
    networks: {
        localhost: {
            url: LOCALHOST_URL,
            gas: GAS,
            gasPrice: GAS_PRICE,
            networkId: "*",
        },
        baobab: {
            url: BAOBAB_URL,
            gas: GAS,
            networkId: 1001,
        },
        diodon: {
            url: DIODON_URL,
            gas: GAS,
            networkId: 1042,
        },
    },
}
