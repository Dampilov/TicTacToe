import { subtask } from "hardhat/config"

subtask("getERC20", "Give deployed wallet contract", async ({ taskArgs }, hre) => {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const totalSupply = ethers.utils.parseUnits("1000000", 6)

    const erc = await deploy("ERC20Mock", {
        args: [totalSupply],
        from: deployer,
        log: true,
    })

    const ERC20Mock = await ethers.getContractAt("ERC20Mock", erc.address)
    return ERC20Mock
})
