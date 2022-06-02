import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()
    const balance = await ethers.provider.getBalance(deployer)

    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    const Wallet = await deployments.get("Wallet")

    /* await deploy("TicTacToe", {
        from: deployer,
        log: true,
        proxy: {
            owner: deployer,
            proxyContract: "TicTacProxy",
            proxyArgs: ["{implementation}"],
            execute: {
                init: {
                    methodName: "initialize",
                    args: [Wallet.address],
                },
            },
        },
    }) */
}

module.exports.tags = ["TicTacToe"]
module.exports.dependencies = ["Wallet"]
