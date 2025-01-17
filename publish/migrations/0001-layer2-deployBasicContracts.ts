/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Layer } from "../../scripts/common"
import {
  AmmReader, ChainlinkPriceFeed, ClearingHouse,
  ClearingHouseViewer, InsuranceFund, MetaTxGateway
} from "../../types/ethers"
import { AmmInstanceName, ContractFullyQualifiedName } from "../ContractName"
import { MigrationContext, MigrationDefinition } from "../Migration"

const migration: MigrationDefinition = {
    getTasks: (context: MigrationContext) => [
        async (): Promise<void> => {
            console.log("deploy metaTxGateway...")
            const chainId = context.settingsDao.getChainId(Layer.Layer1)
            await context.factory
                .create<MetaTxGateway>(ContractFullyQualifiedName.MetaTxGateway)
                .deployUpgradableContract("Diodon", "1", chainId)
        },
        async (): Promise<void> => {
            console.log("deploy insuranceFund...")
            await context.factory
                .create<InsuranceFund>(ContractFullyQualifiedName.InsuranceFund)
                .deployUpgradableContract()
        },

        async (): Promise<void> => {
            console.log("deploy clearing house...")
            const insuranceFundContract = context.factory.create<InsuranceFund>(
                ContractFullyQualifiedName.InsuranceFund,
            )
            await context.factory
              .create<ClearingHouse>(ContractFullyQualifiedName.ClearingHouse)
              .deployUpgradableContract(
                context.deployConfig.initMarginRequirement,
                context.deployConfig.maintenanceMarginRequirement,
                context.deployConfig.liquidationFeeRatio,
                insuranceFundContract.address!,
              );
        },
        async (): Promise<void> => {
            console.log("insuranceFundContract.setBeneficiary...")
            const clearingHouse = context.factory.create<ClearingHouse>(ContractFullyQualifiedName.ClearingHouse)
            const insuranceFund = await context.factory
                .create<InsuranceFund>(ContractFullyQualifiedName.InsuranceFund)
                .instance()
            await (await insuranceFund.setBeneficiary(clearingHouse.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("clearingHouse add arb to whitelist...")
            const clearingHouse = await context.factory
                .create<ClearingHouse>(ContractFullyQualifiedName.ClearingHouse)
                .instance()
            await (
                await clearingHouse.setWhitelist(context.settingsDao.getExternalContracts(Layer.Layer2).arbitrageur!)
            ).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("metaTxGateway.addToWhitelists...")
            const clearingHouse = context.factory.create<ClearingHouse>(ContractFullyQualifiedName.ClearingHouse)
            const metaTxGateway = await context.factory
                .create<MetaTxGateway>(ContractFullyQualifiedName.MetaTxGateway)
                .instance()
            await (await metaTxGateway.addToWhitelists(clearingHouse.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("deploy AAPLkDAI amm...")
            const oracle = context.factory.create<ChainlinkPriceFeed>(
              ContractFullyQualifiedName.ChainlinkPriceFeed,
            );
            const ammName = AmmInstanceName.AAPLKDAI
            const ammContract = context.factory.createAmm(ammName, ContractFullyQualifiedName.AmmV1)
            const quoteTokenAddr = context.externalContract.kdai!
            await ammContract.deployUpgradableContract(
                context.deployConfig.legacyAmmConfigMap[ammName].deployArgs,
                oracle.address!,
                quoteTokenAddr,
            )
        },
        async (): Promise<void> => {
            console.log("deploy AMDkDAI amm...")
            const oracle = context.factory.create<ChainlinkPriceFeed>(ContractFullyQualifiedName.ChainlinkPriceFeed)
            const ammName = AmmInstanceName.AMDKDAI
            const ammContract = context.factory.createAmm(ammName, ContractFullyQualifiedName.AmmV1)
            const quoteTokenAddr = context.externalContract.kdai!
            await ammContract.deployUpgradableContract(
                context.deployConfig.legacyAmmConfigMap[ammName].deployArgs,
                oracle.address!,
                quoteTokenAddr,
            )
        },
        async (): Promise<void> => {
            console.log("deploy SHOPkDAI amm...")
            const oracle = context.factory.create<ChainlinkPriceFeed>(ContractFullyQualifiedName.ChainlinkPriceFeed)
            const ammName = AmmInstanceName.SHOPKDAI
            const ammContract = context.factory.createAmm(ammName, ContractFullyQualifiedName.AmmV1)
            const quoteTokenAddr = context.externalContract.kdai!
            await ammContract.deployUpgradableContract(
                context.deployConfig.legacyAmmConfigMap[ammName].deployArgs,
                oracle.address!,
                quoteTokenAddr,
            )
        },
        async (): Promise<void> => {
            console.log("deploy clearingHouseViewer...")
            const clearingHouseContract = context.factory.create<ClearingHouse>(
                ContractFullyQualifiedName.ClearingHouse,
            )
            const clearingHouseViewerContract = context.factory.create<ClearingHouseViewer>(
                ContractFullyQualifiedName.ClearingHouseViewer,
            )
            await clearingHouseViewerContract.deployImmutableContract(clearingHouseContract.address!)
        },
        async (): Promise<void> => {
            console.log("deploy ammReader...")
            const ammReaderContract = context.factory.create<AmmReader>(ContractFullyQualifiedName.AmmReader)
            await ammReaderContract.deployImmutableContract()
        },

        async (): Promise<void> => {
            console.log("set AAPL amm Cap...")
            const amm = await context.factory
                .createAmm(AmmInstanceName.AAPLKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            const { maxHoldingBaseAsset, openInterestNotionalCap } = context.deployConfig.legacyAmmConfigMap[
                AmmInstanceName.AAPLKDAI
            ].properties
            if (maxHoldingBaseAsset.gt(0)) {
                await (
                    await amm.setCap({ d: maxHoldingBaseAsset.toString() }, { d: openInterestNotionalCap.toString() })
                ).wait(context.deployConfig.confirmations)
            }

        },
        async (): Promise<void> => {
            console.log("AAPL amm.setCounterParty...")
            const clearingHouseContract = context.factory.create<ClearingHouse>(
                ContractFullyQualifiedName.ClearingHouse,
            )
            const amm = await context.factory
                .createAmm(AmmInstanceName.AAPLKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            await (await amm.setCounterParty(clearingHouseContract.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("insuranceFund.add AAPL amm...")
            const insuranceFundContract = context.factory.create<InsuranceFund>(
                ContractFullyQualifiedName.InsuranceFund,
            )
            const ammContract = context.factory.createAmm(AmmInstanceName.AAPLKDAI, ContractFullyQualifiedName.AmmV1)
            const insuranceFund = await insuranceFundContract.instance()
            await (await insuranceFund.addAmm(ammContract.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("set AMD amm Cap...")
            const amm = await context.factory
                .createAmm(AmmInstanceName.AMDKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()

            const { maxHoldingBaseAsset, openInterestNotionalCap } = context.deployConfig.legacyAmmConfigMap[
                AmmInstanceName.AMDKDAI
            ].properties
            if (maxHoldingBaseAsset.gt(0)) {
                await (
                    await amm.setCap({ d: maxHoldingBaseAsset.toString() }, { d: openInterestNotionalCap.toString() })
                ).wait(context.deployConfig.confirmations)
            }
        },
        async (): Promise<void> => {
            console.log("AMD amm.setCounterParty...")
            const clearingHouseContract = context.factory.create<ClearingHouse>(
                ContractFullyQualifiedName.ClearingHouse,
            )
            const amm = await context.factory
                .createAmm(AmmInstanceName.AMDKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            await (await amm.setCounterParty(clearingHouseContract.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("insuranceFund.add AMD amm...")
            const insuranceFundContract = context.factory.create<InsuranceFund>(
                ContractFullyQualifiedName.InsuranceFund,
            )
            const ammContract = context.factory.createAmm(AmmInstanceName.AMDKDAI, ContractFullyQualifiedName.AmmV1)
            const insuranceFund = await insuranceFundContract.instance()
            await (await insuranceFund.addAmm(ammContract.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("set SHOP amm Cap...")
            const amm = await context.factory
                .createAmm(AmmInstanceName.SHOPKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            const { maxHoldingBaseAsset, openInterestNotionalCap } = context.deployConfig.legacyAmmConfigMap[
                AmmInstanceName.SHOPKDAI
            ].properties
            if (maxHoldingBaseAsset.gt(0)) {
                await (
                    await amm.setCap({ d: maxHoldingBaseAsset.toString() }, { d: openInterestNotionalCap.toString() })
                ).wait(context.deployConfig.confirmations)
            }

        },
        async (): Promise<void> => {
            console.log("SHOP amm.setCounterParty...")
            const clearingHouseContract = context.factory.create<ClearingHouse>(
                ContractFullyQualifiedName.ClearingHouse,
            )
            const amm = await context.factory
                .createAmm(AmmInstanceName.SHOPKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            await (await amm.setCounterParty(clearingHouseContract.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("insuranceFund.add SHOP amm...")
            const insuranceFundContract = context.factory.create<InsuranceFund>(
                ContractFullyQualifiedName.InsuranceFund,
            )
            const ammContract = context.factory.createAmm(AmmInstanceName.SHOPKDAI, ContractFullyQualifiedName.AmmV1)
            const insuranceFund = await insuranceFundContract.instance()
            await (await insuranceFund.addAmm(ammContract.address!)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("opening Amm AAPLUSDC...")
            const aapleKDai = await context.factory
                .createAmm(AmmInstanceName.AAPLKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            await (await aapleKDai.setOpen(true)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("opening Amm AMDKDAI...")
            const amdKDai = await context.factory
                .createAmm(AmmInstanceName.AMDKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            await (await amdKDai.setOpen(true)).wait(context.deployConfig.confirmations)
        },
        async (): Promise<void> => {
            console.log("opening Amm SHOPKDAI...")
            const shopKdai = await context.factory
                .createAmm(AmmInstanceName.SHOPKDAI, ContractFullyQualifiedName.AmmV1)
                .instance()
            await (await shopKdai.setOpen(true)).wait(context.deployConfig.confirmations)
        },
    ],
}

export default migration