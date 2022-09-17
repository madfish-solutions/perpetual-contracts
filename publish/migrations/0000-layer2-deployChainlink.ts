/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ethers } from "hardhat";
import { ChainlinkL1 } from "../../types/ethers"
import { PriceFeedKey } from "../contract/DeployConfig";
import { ContractFullyQualifiedName } from "../ContractName"
import { MigrationContext, MigrationDefinition } from "../Migration"

const migration: MigrationDefinition = {
  getTasks: (context: MigrationContext) => [
    async (): Promise<void> => {
      console.log("deploy root bridge");
      const priceFeedContract = await context.factory
        .create<ChainlinkL1>(ContractFullyQualifiedName.ChainlinkL1)
        .instance();
      console.log(priceFeedContract);
    },

    async (): Promise<void> => {
      console.log("add AAPL aggregators to ChainLink");
      const l2PriceFeed = await context.factory
        .create<ChainlinkL1>(ContractFullyQualifiedName.ChainlinkL1)
        .instance();
      await(
        await l2PriceFeed.addAggregator(
          ethers.utils.formatBytes32String(PriceFeedKey.AAPL.toString()),
          context.externalContract.chainlinkOracle!,
        )
      ).wait(context.deployConfig.confirmations);
    },
    async (): Promise<void> => {
      console.log("add AMD aggregators to ChainLink");
      const l2PriceFeed = await context.factory
        .create<ChainlinkL1>(ContractFullyQualifiedName.ChainlinkL1)
        .instance();
      await (
        await l2PriceFeed.addAggregator(
          ethers.utils.formatBytes32String(PriceFeedKey.AMD.toString()),
          context.externalContract.chainlinkOracle!,
        )
      ).wait(context.deployConfig.confirmations);
    },
  ],
};

export default migration
