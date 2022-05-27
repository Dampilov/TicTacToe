import { task } from "hardhat/config"
import "./getContract"

task("joinGame", "Join to the game by ID")
    .addOptionalParam("account", "ID of the account")
    .addParam("id", "ID of game")
    .setAction(async ({ account, id }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe", { name: "TicTacToe" })

        try {
            const accounts = await hre.ethers.getSigners()
            await TicTacToe.connect(accounts[account || 0]).joinGame(id)
            console.log("You joined")
        } catch (e) {
            console.log(e)
        }
    })
