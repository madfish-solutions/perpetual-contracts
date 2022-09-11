import { spawn } from "child_process"
import { resolve } from "path"
import { rm } from "shelljs"
import { DeployMode } from "../scripts/common"
import { deploy } from "./deploy"
import { getNpmBin } from "./helper"
import { getOpenZeppelinConfigFile } from "./path"

//onDeployed?: () => Promise<boolean>
export async function devEvm(): Promise<void> {
    const cwd = resolve(__dirname, "..")
    const env = {
        DEPLOY_MODE: DeployMode.Init,
        ...process.env,
    }
    const npmBin = getNpmBin(cwd)
    const hardhatBin = resolve(npmBin, "hardhat")

    // remove dev file json from openzeppelin for initializing it again
    rm("-f", getOpenZeppelinConfigFile("localhost"))

    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let error: any = null

        // Note we don't use shelljs exec() because it uses shell and creates more child processes, they don't respond to kill signals on some platforms (ex. ubuntu)
        const child = spawn(hardhatBin, ["node"], { cwd })

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        child.stdout!.on("data", async (data: string) => {
            // when http://127.0.0.1:8545/ appear means localhost server is ready to deploy contract
            if (data.includes("http://127.0.0.1:8545/")) {
                try {
                    // TODO wrap it with system deployer even though we only need layer 2 for local tests.
                    // This is so that we could re-use the scripts for creating metadata/${stage}.json
                    // await asyncExec("hardhat run --network localhost scripts/deploy.ts", { cwd, env })

                    await deploy("test", { cwd, env })
                    // // onDeployed() must return true if it wishes to keep hardhat node running
                    // if (onDeployed && !(await onDeployed())) {
                    //     console.log("killing ethereum node...")
                    //     child.kill("SIGINT")
                    // }
                    console.log("killing ethereum node...")
                    child.kill("SIGINT")
                } catch (e) {
                    child.kill("SIGINT") // Terminate hardhat node
                    error = e
                }
            }
        })

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        child.stderr!.on("data", data => {
            console.error(`hardhat node stderr: ${data}`)
        })

        child.on("close", code => {
            if (!code) {
                if (error === null) {
                    resolve() // `hardhat node` started and the application running on top finishes
                } else {
                    reject(error) // `hardhat node` started but the application running on top of it throws
                }
            } else {
                reject(`Unable to run hardhat node, code: ${code}`) // `hardhat node` failed to start
            }
        })
    })
}

if (require.main === module) {
    devEvm()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}
