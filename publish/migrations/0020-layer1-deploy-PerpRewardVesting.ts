/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { BigNumber } from "ethers"
import { PerpRewardVesting } from "../../types/ethers"
import { ContractFullyQualifiedName, ContractInstanceName } from "../ContractName"
import { MigrationContext, MigrationDefinition } from "../Migration"

const migration: MigrationDefinition = {
    getTasks: (context: MigrationContext) => [
        async (): Promise<void> => {
            if (context.stage === "production") {
                console.log("deploy PerpRewardVesting with 182 days (half year) vesting...")
                await context.factory
                    .create<PerpRewardVesting>(ContractFullyQualifiedName.PerpRewardVesting, ContractInstanceName.PerpStakingReward182DaysVesting)
                    .deployUpgradableContract(context.externalContract.perp!, BigNumber.from(60 * 60 * 24 * 182))
            } else {
                console.log("deploy PerpRewardVesting with 5 mins vesting...")
                await context.factory
                    .create<PerpRewardVesting>(ContractFullyQualifiedName.PerpRewardVesting, ContractInstanceName.PerpStakingReward5MinutesVesting)
                    .deployUpgradableContract(context.externalContract.perp!, BigNumber.from(60 * 5))
            }
        },
        async (): Promise<void> => {
            console.log("PerpRewardVesting.setOwner")
            let instanceName: ContractInstanceName
            if (context.stage === "production") {
                instanceName = ContractInstanceName.PerpStakingReward182DaysVesting
            } else {
                instanceName = ContractInstanceName.PerpStakingReward5MinutesVesting
            }
            const perpRewardVesting = await context.factory
                .create<PerpRewardVesting>(ContractFullyQualifiedName.PerpRewardVesting, instanceName)
                .instance()
            const gov = context.externalContract.foundationGovernance!
            await perpRewardVesting.setOwner(gov!)
        },
    ],
}

export default migration
