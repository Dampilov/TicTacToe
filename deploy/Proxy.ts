import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, getUnnamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()
    const balance = await ethers.provider.getBalance(deployer)

    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    const TicTacToe = await deployments.get("TicTacToe")
    const Wallet = await deployments.get("Wallet")

    await deploy("TicTacProxy", {
        args: [TicTacToe.address],
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["TicTacProxy"]
module.exports.dependencies = ["TicTacToe", "Wallet"]
