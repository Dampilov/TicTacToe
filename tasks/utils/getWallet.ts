import { subtask } from "hardhat/config"

subtask("getWallet", "Give deployed wallet contract", async ({ taskArgs }, hre) => {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const accounts = await ethers.getSigners()
    const owners = [deployer, accounts[1].address, accounts[2].address]
    const requiredOwners = 2

    const wallet = await deploy("Wallet", {
        args: [owners, requiredOwners],
        from: deployer,
        log: true,
    })

    const Wallet = await ethers.getContractAt("Wallet", wallet.address)
    return Wallet
})
