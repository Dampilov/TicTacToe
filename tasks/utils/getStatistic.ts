import { task } from "hardhat/config"
import "./getTicTacToe"

task("getStatistic", "Get statistic of one of variant")
    .addParam("id", "ID of the variant. 0 - zero win percentage. 1 - cross win percentage. 2 - game end in draw percentage")
    .setAction(async ({ id }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe")

        try {
            let percent
            switch (id) {
                case "0":
                    percent = await TicTacToe.getZeroGameStatistic()
                    console.log(`Zero winning percent: ${percent}%`)
                    break
                case "1":
                    percent = await TicTacToe.getCrossGameStatistic()
                    console.log(`Cross winning percent: ${percent}%`)
                    break
                case "2":
                    percent = await TicTacToe.getDrawGameStatistic()
                    console.log(`Ending in draw game percent: ${percent}%`)
                    break
                default:
                    console.log("No parammetrs")
            }
        } catch (e) {
            console.log(e)
        }
    })
