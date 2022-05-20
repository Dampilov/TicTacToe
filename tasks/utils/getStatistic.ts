import { task } from "hardhat/config"
import "./getContract"

task("getStatistic", "Get game")
    .addOptionalParam("account", "Number")
    .addParam("id", "ID")
    .setAction(async ({ account, id }, hre) => {
        const contract = await hre.run("get-contract", { name: "TicTacToe" })

        try {
            if (typeof account !== "undefined") {
                const accounts = await hre.ethers.getSigners()
                const percent = await contract.getStatisticByAddress(accounts[account])
                console.log(`Winning percent: ${percent}%`)
            } else {
                let percent
                switch (id) {
                    case "0":
                        percent = await contract.getZeroGameStatistic()
                        console.log(`Zero winning percent: ${percent}%`)
                        break
                    case "1":
                        percent = await contract.getCrossGameStatistic()
                        console.log(`Cross winning percent: ${percent}%`)
                        break
                    case "2":
                        percent = await contract.getDrawGameStatistic()
                        console.log(`Ending in draw game percent: ${percent}%`)
                        break
                    default:
                        console.log("No parammetrs")
                }
            }
        } catch (e) {
            console.log(e)
        }
    })
