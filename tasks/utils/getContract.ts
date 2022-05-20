import { subtask } from "hardhat/config"
import "./readJson"

subtask("get-contract", "Give deployed contract")
    .addParam("name", "Deployed contract's name")
    .setAction(async ({ name }, hre) => {
        const address = await hre.run("read-address", { name })
        const contract = await hre.ethers.getContractAt(name, address)
        return contract
    })
