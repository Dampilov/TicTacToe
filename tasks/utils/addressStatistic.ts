import { task } from "hardhat/config"
import "./getContract"

task("addressStatistic", "Get statistic by address")
    .addParam("account", "Number of account")
    .setAction(async ({ account }, hre) => {
        const contract = await hre.run("get-contract", { name: "TicTacToe" })

        try {
            const accounts = await hre.ethers.getSigners()
            const percent = await contract.getStatisticByAddress(accounts[account || 0].address)
            console.log(`Winning percent: ${percent}%`)
        } catch (e) {
            console.log(e)
        }
    })
