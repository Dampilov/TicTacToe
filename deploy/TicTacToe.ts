import { Wallet } from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, getUnnamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()
    const balance = await ethers.provider.getBalance(deployer)

    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    const Wallet = await deployments.get("Wallet")

    await deploy("TicTacToe", {
        args: [Wallet.address],
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["TicTacToe"]
module.exports.dependencies = ["Wallet"]
