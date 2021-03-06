import { task } from "hardhat/config"
import "./getTicTacToe"

task("makeMove", "Make move by the ID of game")
    .addOptionalParam("account", "ID of the account")
    .addParam("id", "ID of the game")
    .addParam("x", "one of the coordinates where you want to put your sign")
    .addParam("y", "one of the coordinates where you want to put your sign")
    .setAction(async ({ account, id, x, y }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe", { name: "TicTacToe" })

        try {
            const accounts = await hre.ethers.getSigners()
            await TicTacToe.connect(accounts[account || 0]).step(id, x, y)
            const cell = await TicTacToe.getCell(id)
            console.log("Cell:")
            for (let i = 0; i < 3; i++) {
                console.log(`\t${cell[i][0]} ${cell[i][1]} ${cell[i][2]}`)
            }
        } catch (e) {
            console.log(e)
        }
    })
