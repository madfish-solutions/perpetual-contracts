import { BigNumber, ethers } from "ethers"
import { Stage } from "../../scripts/common"
import { AmmInstanceName } from "../ContractName"

// TODO replace by ethers format
export const DEFAULT_DIGITS = BigNumber.from(10).pow(18)

const WEEK = BigNumber.from(7 * 24 * 60 * 60)
const DEFAULT_AMM_TRADE_LIMIT_RATIO = BigNumber.from(90)
    .mul(DEFAULT_DIGITS)
    .div(100) // 90% trading limit ratio
const DEFAULT_AMM_FUNDING_PERIOD = BigNumber.from(3600) // 1 hour
const DEFAULT_AMM_FLUCTUATION = BigNumber.from(12)
    .mul(DEFAULT_DIGITS)
    .div(1000) // 1.2%
const DEFAULT_AMM_TOLL_RATIO = BigNumber.from(0)
    .mul(DEFAULT_DIGITS)
    .div(10000) // 0.0%
const DEFAULT_AMM_SPREAD_RATIO = BigNumber.from(10)
    .mul(DEFAULT_DIGITS)
    .div(10000) // 0.1%

// chainlink
export enum PriceFeedKey {
    AMD = "AMD",
    AAPL = "AAPL",
    SHOP = "SHOP",
}

// amm
export interface AmmDeployArgs {
    quoteAssetReserve: BigNumber
    baseAssetReserve: BigNumber
    tradeLimitRatio: BigNumber
    fundingPeriod: BigNumber
    fluctuation: BigNumber
    priceFeedKey: string
    tollRatio: BigNumber
    spreadRatio: BigNumber
}

interface AmmProperties {
    maxHoldingBaseAsset: BigNumber
    openInterestNotionalCap: BigNumber
}

export type AmmConfig = { name: AmmInstanceName; deployArgs: AmmDeployArgs; properties: AmmProperties }
export type AmmConfigMap = Record<string, AmmConfig>
export const AMD_USD_AMM: AmmConfig = {
    name: AmmInstanceName.AMDKDAI,
    deployArgs: {
        // base * price
        quoteAssetReserve: BigNumber.from(10000000).mul(DEFAULT_DIGITS),
        baseAssetReserve: BigNumber.from(500).mul(DEFAULT_DIGITS), // 500 BTC
        tradeLimitRatio: BigNumber.from(90)
            .mul(DEFAULT_DIGITS)
            .div(100), // 90% trading limit ratio
        fundingPeriod: BigNumber.from(3600), // 1 hour
        fluctuation: BigNumber.from(12)
            .mul(DEFAULT_DIGITS)
            .div(1000), // 1.2%
        priceFeedKey: PriceFeedKey.AMD,
        tollRatio: BigNumber.from(0)
            .mul(DEFAULT_DIGITS)
            .div(10000), // 0.0%
        spreadRatio: BigNumber.from(10)
            .mul(DEFAULT_DIGITS)
            .div(10000), // 0.1%
    },
    properties: {
        maxHoldingBaseAsset: BigNumber.from(DEFAULT_DIGITS)
            .mul(25)
            .div(100), // 0.25 BTC ~= $5000 USD,
        openInterestNotionalCap: BigNumber.from(DEFAULT_DIGITS).mul(500000), // $500K
    },
}

export const AAPL_USD_AMM: AmmConfig = {
    name: AmmInstanceName.AAPLKDAI,
    deployArgs: {
        // base * price
        quoteAssetReserve: BigNumber.from(10000000).mul(DEFAULT_DIGITS),
        baseAssetReserve: BigNumber.from(20000).mul(DEFAULT_DIGITS), // 20000 ETH
        tradeLimitRatio: BigNumber.from(90)
            .mul(DEFAULT_DIGITS)
            .div(100), // 90% trading limit ratio
        fundingPeriod: BigNumber.from(3600), // 1 hour
        fluctuation: BigNumber.from(12)
            .mul(DEFAULT_DIGITS)
            .div(1000), // 1.2%
        priceFeedKey: PriceFeedKey.AAPL,
        tollRatio: BigNumber.from(0)
            .mul(DEFAULT_DIGITS)
            .div(10000), // 0.0%
        spreadRatio: BigNumber.from(10)
            .mul(DEFAULT_DIGITS)
            .div(10000), // 0.1%
    },
    properties: {
        maxHoldingBaseAsset: DEFAULT_DIGITS.mul(10), // 10 ETH ~= $5000 USD
        openInterestNotionalCap: BigNumber.from(DEFAULT_DIGITS).mul(500000), // $500K
    },
}

export const SHOP_USD_AMM: AmmConfig = {
  name: AmmInstanceName.AAPLKDAI,
  deployArgs: {
    // base * price
    quoteAssetReserve: BigNumber.from(10000000).mul(DEFAULT_DIGITS),
    baseAssetReserve: BigNumber.from(20000).mul(DEFAULT_DIGITS), // 20000 ETH
    tradeLimitRatio: BigNumber.from(90)
      .mul(DEFAULT_DIGITS)
      .div(100), // 90% trading limit ratio
    fundingPeriod: BigNumber.from(3600), // 1 hour
    fluctuation: BigNumber.from(12)
      .mul(DEFAULT_DIGITS)
      .div(1000), // 1.2%
    priceFeedKey: PriceFeedKey.AAPL,
    tollRatio: BigNumber.from(0)
      .mul(DEFAULT_DIGITS)
      .div(10000), // 0.0%
    spreadRatio: BigNumber.from(10)
      .mul(DEFAULT_DIGITS)
      .div(10000), // 0.1%
  },
  properties: {
    maxHoldingBaseAsset: DEFAULT_DIGITS.mul(10), // 10 ETH ~= $5000 USD
    openInterestNotionalCap: BigNumber.from(DEFAULT_DIGITS).mul(500000), // $500K
  },
};

const emptyAddr = "0x0000000000000000000000000000000000000001"
export const dummyAmmArgs: any[] = [1, 1, 1, 1, emptyAddr, ethers.utils.formatBytes32String("AMD"), emptyAddr, 1, 1, 1]

export function makeAmmConfig(
    name: AmmInstanceName,
    priceFeedKey: string,
    baseAssetReserve: BigNumber,
    maxHoldingBaseAsset: BigNumber,
    openInterestNotionalCap: BigNumber,
    restDeployArgs?: Partial<AmmDeployArgs>,
): AmmConfig {
    const config: AmmConfig = {
        name,
        deployArgs: {
            // base * price
            // exact quote reserve amount will be overriden by the script based on the base reserve and the price upon deployment
            baseAssetReserve,
            quoteAssetReserve: BigNumber.from(0),
            tradeLimitRatio: DEFAULT_AMM_TRADE_LIMIT_RATIO,
            fundingPeriod: DEFAULT_AMM_FUNDING_PERIOD,
            fluctuation: DEFAULT_AMM_FLUCTUATION,
            priceFeedKey: priceFeedKey,
            tollRatio: DEFAULT_AMM_TOLL_RATIO,
            spreadRatio: DEFAULT_AMM_SPREAD_RATIO, // 0.1%
        },
        properties: {
            maxHoldingBaseAsset,
            openInterestNotionalCap,
        },
    }

    if (restDeployArgs) {
        config.deployArgs = {
            ...config.deployArgs,
            ...restDeployArgs,
        }
    }

    return config
}

export class DeployConfig {
    // stage
    readonly stage: Stage
    // deploy
    readonly confirmations: number

    // chainlink
    readonly chainlinkMap: Record<string, string>

    // clearing house
    readonly initMarginRequirement = BigNumber.from(1)
        .mul(DEFAULT_DIGITS)
        .div(10) // 10% - 10x
    readonly maintenanceMarginRequirement = BigNumber.from(625)
        .mul(DEFAULT_DIGITS)
        .div(10000) // 6.25% - 16x
    readonly liquidationFeeRatio = BigNumber.from(125)
        .mul(DEFAULT_DIGITS)
        .div(10000) // 1.25%

    // amm
    readonly legacyAmmConfigMap: Record<string, AmmConfig> = {
        [AmmInstanceName.AMDKDAI]: AMD_USD_AMM,
        [AmmInstanceName.AAPLKDAI]: AAPL_USD_AMM,
        [AmmInstanceName.SHOPKDAI]: SHOP_USD_AMM,
    }

    // KeeperReward
    readonly keeperRewardOnL1 = BigNumber.from(1).mul(DEFAULT_DIGITS) // 1 perp token
    readonly keeperRewardOnL2 = BigNumber.from(1).mul(DEFAULT_DIGITS) // 1 perp token

    // PerpRewardVesting = default is 24 weeks
    readonly defaultPerpRewardVestingPeriod = WEEK.mul(24)

    // RootBridgeV2: min deposit amount is 500 USDC
    readonly minDepositAmount = BigNumber.from(500).mul(DEFAULT_DIGITS)

    // ClientBridge: min deposit amount is 100 USDC
    readonly minWithdrawalAmount = BigNumber.from(100).mul(DEFAULT_DIGITS)

    constructor(stage: Stage) {
        this.stage = stage
        switch (stage) {
            case "production":
                this.confirmations = 5
                this.chainlinkMap = {
                    [PriceFeedKey.AMD]: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
                    [PriceFeedKey.AAPL]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
                }
                break
            case "baobab":
                this.confirmations = 5
                //TODO : Replace addressess
                this.chainlinkMap = {
                  [PriceFeedKey.AMD]: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
                  [PriceFeedKey.AAPL]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
                };
                break
            case "local":
                this.confirmations = 1
                this.chainlinkMap = {
                    // fake address
                    [PriceFeedKey.AMD]: "0xECe365B379E1dD183B20fc5f022230C044d51404",
                    [PriceFeedKey.AAPL]: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
                }
                break
            default:
                throw new Error(`not supported stage=${stage}`)
        }
    }
}
