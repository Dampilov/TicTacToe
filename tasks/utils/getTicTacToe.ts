import { subtask } from "hardhat/config"

subtask("getTicTacToe", "Give deployed contract", async ({ taskArgs }, hre) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()
    const contract = await deploy("TicTacToe", {
        from: deployer,
        log: true,
    })
    const TicTacToe = await hre.ethers.getContractAt("TicTacToe", contract.address)
    return TicTacToe
})
