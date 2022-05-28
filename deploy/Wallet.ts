import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()
    const balance = await ethers.provider.getBalance(deployer)

    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    const accounts = await ethers.getSigners()
    const owners = [deployer, accounts[1].address]
    const requiredOwners = 2

    const deployResult = await deploy("Wallet", {
        args: [owners, requiredOwners],
        from: deployer,
        log: true,
    })
    if (deployResult.newlyDeployed) {
        log(`contract Token deployed at ${deployResult.address} using ${deployResult.receipt?.gasUsed} gas`)
    }
}

module.exports.tags = ["Wallet"]
