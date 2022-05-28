import { subtask } from "hardhat/config"

subtask("getTicTacToe", "Give deployed contract", async ({ taskArgs }, hre) => {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Wallet = await hre.run("getWallet")

    const ticTacToe = await deploy("TicTacToe", {
        args: [Wallet.address],
        from: deployer,
        log: true,
    })

    const TicTacToe = await ethers.getContractAt("TicTacToe", ticTacToe.address)
    return TicTacToe
})
