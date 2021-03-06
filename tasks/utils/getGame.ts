import { task } from "hardhat/config"
import "./getTicTacToe"

task("getGame", "Get game information by ID")
    .addParam("id", "ID of game")
    .setAction(async ({ id }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe")

        try {
            const game = await TicTacToe.games(id)

            const { years, weeks, days, hours, minutes, seconds } = await hre.run("convertTime", { time: game.waitingTime.toString() })
            console.log(`ID: ${game.id}`)
            console.log(`Owner: ${game.owner}`)
            if (game.state == 1) {
                console.log(`Rival: ${game.rival}`)
                const ownerSign = await TicTacToe.sign(game.owner, id)

                if (game.isCrossMove) {
                    ownerSign == 1 ? console.log(`Whose move: ${game.owner}`) : console.log(`Whose move: ${game.rival}`)
                } else {
                    ownerSign != 1 ? console.log(`Whose move: ${game.owner}`) : console.log(`Whose move: ${game.rival}`)
                }
            }
            console.log(`Game state: ${game.state}`)
            console.log("Time for move:")
            console.log(`\tYears: ${years}`)
            console.log(`\tWeeks: ${weeks}`)
            console.log(`\tDays: ${days}`)
            console.log(`\tHours: ${hours}`)
            console.log(`\tMinutes: ${minutes}`)
            console.log(`\tSeconds: ${seconds}`)
            if (game.state == 0) console.log(`Created in: ${new Date(game.lastActiveTime * 1000)}`)
            const cell = await TicTacToe.getCell(id)
            console.log("Cell:")
            for (let i = 0; i < 3; i++) {
                console.log(`\t${cell[i][0]} ${cell[i][1]} ${cell[i][2]}`)
            }
        } catch (e) {
            console.log(e)
        }
    })
