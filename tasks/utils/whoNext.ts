import { task } from "hardhat/config"
import "./getContract"

task("whoNext", "what sign do you have in the selected game, and is it your turn now")
    .addOptionalParam("account", "ID of the account")
    .addParam("id", "ID of the game")
    .setAction(async ({ account, id }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe", { name: "TicTacToe" })

        try {
            const accounts = await hre.ethers.getSigners()
            const sign = await TicTacToe.connect(accounts[account || 0]).sign(accounts[account || 0].address, id)
            const game = await TicTacToe.games(id)

            console.log(`Sign: ${sign}`)
            console.log(`Is ${sign} move: ${sign == 1 ? game.isCrossMove : !game.isCrossMove}`)
        } catch (e) {
            console.log(e)
        }
    })
