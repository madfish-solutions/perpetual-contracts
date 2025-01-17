import dotenv from "dotenv"
import { join, resolve } from "path"
dotenv.config({ path: resolve(__dirname, "..", "..", ".env") })
dotenv.config()

export const ROOT_DIR = __dirname
export const SRC_DIR_NAME = "src"
const LEGACY_SRC_DIR_NAME = join(SRC_DIR_NAME, "legacy")

export const COVERAGE_URL = "http://127.0.0.1:8555"
export const LOCALHOST_URL = "http://127.0.0.1:8545"
export const BAOBAB_URL = `${process.env["BAOBAB_ENDPOINT"]}`
export const DIODON_URL = `${process.env["DIODON_ENDPOINT"]}`
export const BAOBAB_PK = process.env["DEPLOYER"] || ""
export const ARTIFACTS_DIR = "./build/contracts"
export const GAS = 8000000
export const GAS_PRICE = 2_000_000_000
export const SRC_DIR = join(ROOT_DIR, SRC_DIR_NAME)
export const LEGACY_SRC_DIR = join(ROOT_DIR, LEGACY_SRC_DIR_NAME)
export const ETHERSCAN_API_KEY = process.env["ETHERSCAN_API_KEY"] || ""
