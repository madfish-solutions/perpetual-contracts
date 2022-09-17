export enum AmmInstanceName {
  AAPLKDAI = "AAPLKDAI",
  AMDKDAI = "AAPLKDAI",

}

export enum ContractName {
    MetaTxGateway = "MetaTxGateway",
    TetherToken = "TetherToken",
    InsuranceFund = "InsuranceFund",
    ChainlinkL1 = "ChainlinkL1",
    ClearingHouse = "ClearingHouse",
    ClearingHouseViewer = "ClearingHouseViewer",
    Amm = "Amm",
    AmmV1 = "Amm",
    AmmReader = "AmmReader",
    ChainlinkPriceFeed = "ChainlinkPriceFeed",
}

export enum ContractFullyQualifiedName {
    TetherToken = "src/mock/TetherToken.sol:TetherToken",
    InsuranceFund = "src/InsuranceFund.sol:InsuranceFund",
    ChainlinkL1 = "src/ChainlinkL1.sol:ChainlinkL1",
    ClearingHouse = "src/ClearingHouse.sol:ClearingHouse",
    ClearingHouseViewer = "src/ClearingHouseViewer.sol:ClearingHouseViewer",
    Amm = "src/Amm.sol:Amm",
    AmmV1 = "src/Amm.sol:Amm",
    AmmReader = "src/AmmReader.sol:AmmReader",

    // flatten
    FlattenClearingHouse = "flattened/ClearingHouse/src/ClearingHouse.sol:ClearingHouse",
    FlattenInsuranceFund = "flattened/ClearingHouse/src/ClearingHouse.sol:InsuranceFund",
    FlattenAmm = "flattened/Amm/src/Amm.sol:Amm",
    FlattenIERC20 = "flattened/ClearingHouse/src/ClearingHouse.sol:IERC20",

    // used in scripts and tests
    IERC20 = "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol:IERC20",
    FlattenAmmUnderClearingHouse = "flattened/ClearingHouse/src/Amm.sol:Amm",
}

export type ContractId = ContractName | AmmInstanceName

export function isContractId(name: unknown): name is ContractId {
    if (typeof name !== "string") {
        return false
    }
    return (
        Object.keys(ContractName).includes(name) ||
        Object.keys(AmmInstanceName).includes(name)
    )
}
