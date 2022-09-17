/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import { ShellString } from "shelljs"
import { ExternalContracts, Layer, MigrationIndex, Network, Stage, SystemDeploySettings } from "../scripts/common"
import { getSettingsFile } from "../scripts/path"
import production from "./settings/production.json"
import baobab from "./settings/baobab.json"

export class SettingsDao {
    readonly settingsCached!: SystemDeploySettings
    constructor(readonly stage: Stage) {
        switch (stage) {
            case "production":
                this.settingsCached = production as SystemDeploySettings
                break
            case "baobab":
                this.settingsCached = baobab as SystemDeploySettings
                break
            case "local":
                try {
                    this.settingsCached = require(this.settingsFilePath)
                } catch (e) {
                    console.log(`can not find ${this.settingsFilePath}, generating file...`)
                    this.settingsCached = {
                        layers: {
                            layer1: {
                                chainId: 31337,
                                network: "localhost",
                                externalContracts: {
                                    rewardGovernance: "0x9FE5f5bbbD3f2172Fa370068D26185f3d82ed9aC",
                                    diodonBridge: "0xD4075FB57fCf038bFc702c915Ef9592534bED5c1",
                                    baobabBridge: "0x30F693708fc604A57F1958E3CFa059F902e6d4CB",
                                    kdai: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                                },
                            },
                            layer2: {
                                chainId: 31337,
                                network: "localhost",
                                externalContracts: {
                                    rewardGovernance: "0x9FE5f5bbbD3f2172Fa370068D26185f3d82ed9aC",
                                    diodonBridge: "0xD4075FB57fCf038bFc702c915Ef9592534bED5c1",
                                    baobabBridge: "0x30F693708fc604A57F1958E3CFa059F902e6d4CB",
                                    kdai: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                                    arbitrageur: "0x68dfc526037E9030c8F813D014919CC89E7d4d74",
                                },
                            },
                        },
                        nextMigration: {
                            batchIndex: 0,
                            taskIndex: 0,
                        },
                    }
                }
                break
            default:
                throw new Error(`Stage not found=${stage}`)
        }
    }

    // TODO easy to break when rename file or directory
    private get settingsFilePath(): string {
        return getSettingsFile(this.stage)
    }

    getStage(): Stage {
        return this.stage
    }

    getSystemDeploySettings(): SystemDeploySettings {
        return this.settingsCached
    }

    getNextMigration(): MigrationIndex {
        return this.getSystemDeploySettings().nextMigration
    }

    resetNextMigration(): void {
        this.settingsCached.nextMigration.batchIndex = 0
        this.settingsCached.nextMigration.taskIndex = 0
        ShellString(JSON.stringify(this.settingsCached, null, 2)).to(this.settingsFilePath)
        console.log(`reset next migration to [0, 0]`)
    }

    increaseTaskIndex(): void {
        this.settingsCached.nextMigration.taskIndex++
        ShellString(JSON.stringify(this.settingsCached, null, 2)).to(this.settingsFilePath)
        console.log(`increase task index to ${this.settingsCached.nextMigration.taskIndex}`)
    }

    increaseBatchIndex(): void {
        this.settingsCached.nextMigration.taskIndex = 0
        this.settingsCached.nextMigration.batchIndex++
        ShellString(JSON.stringify(this.settingsCached, null, 2)).to(this.settingsFilePath)
        console.log(`increase batch index to ${this.settingsCached.nextMigration.batchIndex}`)
    }

    inSameLayer(): boolean {
        return this.getChainId(Layer.Layer1) === this.getChainId(Layer.Layer2)
    }

    getExternalContracts(layerType: Layer): ExternalContracts {
        return this.settingsCached.layers[layerType]!.externalContracts
    }

    getChainId(layerType: Layer): number {
        return this.settingsCached.layers[layerType]!.chainId
    }

    getNetwork(layerType: Layer): Network {
        return this.settingsCached.layers[layerType]!.network
    }

    isLocal(): boolean {
        return this.stage === "local"
    }
}
