import { subtask } from "hardhat/config"

subtask("getContract", "Give deployed contract")
    .addParam("name", "Name of deployed contract")
    .setAction(async ({ name }, hre) => {
        const { deployments, getNamedAccounts } = hre
        const { deploy } = deployments

        const { deployer } = await getNamedAccounts()
        const contract = await deploy(name, {
            from: deployer,
            log: true,
        })
        const TicTacToe = await hre.ethers.getContractAt(name, contract.address)
        return TicTacToe
    })
