import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()
    const balance = await ethers.provider.getBalance(deployer)

    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    const accounts = await ethers.getSigners()
    const owners = [deployer, accounts[1].address, accounts[2].address]
    const requiredOwners = 2

    const wallet = await deploy("Wallet", {
        args: [owners, requiredOwners],
        from: deployer,
        log: true,
    })

    await deploy("TicTacToe", {
        args: [wallet.address],
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["TicTacToe", "Wallet"]
