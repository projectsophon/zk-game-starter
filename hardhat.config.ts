// Hardhat plugins
// Note: Order probably matters!
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-network-helpers";
import "@nomiclabs/hardhat-ethers";
import "hardhat-abi-exporter";
import "hardhat-diamond-abi";
// Must be registered after hardhat-diamond-abi
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-settings";
import "@solidstate/hardhat-4byte-uploader";

// Our Hardhat tasks
import "@zkgame/hardhat-tasks/deploy";
import "@zkgame/hardhat-tasks/node";

// Other
import type {
  HardhatRuntimeEnvironment,
  HardhatUserConfig,
} from "hardhat/types";
import { extendEnvironment } from "hardhat/config";

//@ts-ignore because they don't provide types
import * as mapWorkspaces from "@npmcli/map-workspaces";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    packages: Map<string, string>;
  }
}

declare module "hardhat/types" {
  interface HardhatSettings {
    deployments: {
      [key: string]: {
        diamond: string;
        initializer: string;
        facets: { name: string; selectors: string | string[] }[];
      };
    };
  }
}

const packages = mapWorkspaces.virtual({
  cwd: __dirname,
  pkg: require("./package.json"),
  lockfile: require("./package-lock.json"),
});

extendEnvironment((env: HardhatRuntimeEnvironment) => {
  env.packages = packages;
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  /**
   * This configures which networks hardhat will communicate with
   */
  networks: {
    localhost: {
      url: "http://localhost:8545/",
      accounts: {
        mnemonic:
          "change typical hire slam amateur loan grid fix drama electric seed label",
      },
      chainId: 31337,
    },
    // Used when you don't specify a network on command line, like in tests
    hardhat: {
      accounts: [
        {
          privateKey:
            "0x044C7963E9A89D4F8B64AB23E02E97B2E00DD57FCB60F316AC69B77135003AEF",
          balance: "100000000000000000000",
        },
        {
          privateKey:
            "0x523170AAE57904F24FFE1F61B7E4FF9E9A0CE7557987C2FC034EACB1C267B4AE",
          balance: "100000000000000000000",
        },
        {
          privateKey:
            "0x67195c963ff445314e667112ab22f4a7404bad7f9746564eb409b9bb8c6aed32",
          balance: "100000000000000000000",
        },
      ],
      blockGasLimit: 16777215,
      mining: {
        auto: false,
        interval: 1000,
      },
    },
  },
  /**
   * This configures the solidity compiler used to build our Smart Contracts.
   */
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  /**
   * This plugin will provide size information about all our contracts
   * via the `hardhat size-contracts` command.
   */
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  /**
   * This plugin generates TypeScript definitions for interacting with our
   * Smart Contracts—primarily the ZKGame Contract, which is the Diamond.
   */
  typechain: {
    outDir: packages.get("@zkgame/typechain"),
    target: "ethers-v5",
  },
  /**
   * This plugin will combine all ABIs from any Smart Contract with `Facet`
   * in the name or path and output it as `ZKGame.json`.
   */
  diamondAbi: {
    name: "ZKGame",
    include: ["Facet$", ":Diamond$"],
    // We explicitly set `strict` to `true` because we want to validate
    // our facets don't accidentally provide overlapping functions
    strict: true,
  },
  /**
   * This plugin will copy the ABI from the ZKGame artifact into our
   * `@zkgame/contracts` package as `ZKGame.json`.
   */
  abiExporter: {
    path: packages.get("@zkgame/contracts"),
    runOnCompile: true,
    // We don't want additional directories created, so we explicitly
    // set the `flat` option to `true`
    flat: true,
    // We want to copy the ZKGame ABI (which is the Diamond ABI we generate) and the
    // initializer ABI to this folder, so we limit the matched files with the `only` option
    only: [
      ":ZKGame$",
      ":Initializer$",
      // We also want the Diamond so our Hardhat diamond utilities can filter its interface
      ":Diamond$",
    ],
  },
  /**
   * This plugin will load and parse the `zkgame.toml` file and provide the
   * values to tasks on the HardhatRuntimeEnvironment.
   */
  settings: {
    deployments: {
      lazy: false,
    },
    zkgame: {
      lazy: false,
    },
  },
};

export default config;
