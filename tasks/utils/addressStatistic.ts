import { task } from "hardhat/config"
import "./getContract"

task("addressStatistic", "Get statistic by address")
    .addParam("account", "Number of account")
    .setAction(async ({ account }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe", { name: "TicTacToe" })

        try {
            const accounts = await hre.ethers.getSigners()
            const percent = await TicTacToe.getStatisticByAddress(accounts[account || 0].address)
            console.log(`Winning percent: ${percent}%`)
        } catch (e) {
            console.log(e)
        }
    })
