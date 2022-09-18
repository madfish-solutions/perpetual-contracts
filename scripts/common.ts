// all lower-case, no dash; otherwise AWS deployment might fail
export type Stage = "production" | "baobab" | "local"
export type Network =  "baobab" | "diodon" | "localhost" | "hardhat"
export enum Layer {
    Layer1 = "layer1",
    Layer2 = "layer2",
}

// openzeppelin can't recognize xdai network
// so we use this this to map the network to openzeppelin config json file name
export const ozNetworkFile: Record<Network, string> = {
    localhost: "unknown-31337",
    hardhat: "unknown-31337",
    baobab: "unknown-1001",
    diodon: "unknown-1042",
}

// TODO deprecated
export enum DeployMode {
    Init = "init",
    Upgrade = "upgrade",
}

export interface ContractMetadata {
    name: string
    address: string
}

export interface AccountMetadata {
    privateKey: string
    balance: string
}

export interface EthereumMetadata {
    contracts: Record<string, ContractMetadata>
    accounts: AccountMetadata[]
    network: Network
}

export interface LayerMetadata extends EthereumMetadata {
    externalContracts: ExternalContracts
}

export interface SystemMetadata {
    layers: {
        [key in Layer]?: LayerMetadata
    }
}

export interface ExternalContracts {
  // default is gnosis multisig safe which plays the governance role
  rewardGovernance?: string;
  arbitrageur?: string;
  testnetFaucet?: string;

  // https://docs.tokenbridge.net/eth-xdai-amb-bridge/about-the-eth-xdai-amb
  baobabBridge?: string;
  diodonBridge?: string;
  aaplOracle?: string;
  amdOracle?: string;

  // https://docs.tokenbridge.net/eth-xdai-amb-bridge/multi-token-extension#omnibridge-technical-information-and-extension-parameters

  // https://blockscout.com/poa/xdai/bridged-tokens (if it's in xdai)
  kdai?: string;

  // https://docs.openzeppelin.com/upgrades/2.8/api#ProxyAdmin
  proxyAdmin?: string;
}

export interface LayerDeploySettings {
    chainId: number
    network: Network
    externalContracts: ExternalContracts
}

export interface MigrationIndex {
    batchIndex: number
    taskIndex: number
}

export interface SystemDeploySettings {
    layers: {
        [key in Layer]?: LayerDeploySettings
    }
    nextMigration: MigrationIndex
}

export const TASK_CHECK_CHAINLINK = "check:chainlink"
export const TASK_MIGRATE = "migrate"
export const TASK_SIMULATE = "simulate"
