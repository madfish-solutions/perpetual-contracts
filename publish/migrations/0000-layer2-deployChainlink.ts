/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ethers } from "hardhat";
import { Chainlink } from "../../types/ethers";
import { PriceFeedKey } from "../contract/DeployConfig";
import { ContractFullyQualifiedName } from "../ContractName";
import { MigrationContext, MigrationDefinition } from "../Migration";

const migration: MigrationDefinition = {
  getTasks: (context: MigrationContext) => [
    async (): Promise<void> => {
      console.log("deploy Chainlink PriceFeed");

      const priceFeedContract = await context.factory
        .create<Chainlink>(ContractFullyQualifiedName.Chainlink)
        .deployUpgradableContract();
      console.log("deployed Chainlink PriceFeed at", priceFeedContract.address);
    },

    async (): Promise<void> => {
      console.log("add AAPL aggregators to ChainLink");
      const l2PriceFeed = await context.factory
        .create<Chainlink>(ContractFullyQualifiedName.Chainlink)
        .instance();

      await (
        await l2PriceFeed.addAggregator(
          ethers.utils.formatBytes32String(PriceFeedKey.AAPL.toString()),
          context.externalContract.aaplOracle!,
        )
      ).wait(context.deployConfig.confirmations);
    },
    async (): Promise<void> => {
      console.log("add AMD aggregators to ChainLink");
      const l2PriceFeed = await context.factory
        .create<Chainlink>(ContractFullyQualifiedName.Chainlink)
        .instance();
      await (
        await l2PriceFeed.addAggregator(
          ethers.utils.formatBytes32String(PriceFeedKey.AMD.toString()),
          context.externalContract.amdOracle!,
        )
      ).wait(context.deployConfig.confirmations);
    },
  ],
};

export default migration;
