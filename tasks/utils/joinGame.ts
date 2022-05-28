import { task } from "hardhat/config"
import { game } from "../../tests/utils/prepare"
import "./getTicTacToe"

task("joinGame", "Join to the game by ID")
    .addOptionalParam("account", "ID of the account")
    .addOptionalParam("token", "ERC20 token address")
    .addParam("id", "ID of game")
    .setAction(async ({ account, id, token }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe")

        try {
            const accounts = await hre.ethers.getSigners()
            if (typeof token == "undefined") {
                const { betSize } = await TicTacToe.games(id)
                await TicTacToe.connect(accounts[account || 0]).joinGameFromEth(id, { value: betSize })
            } else {
                await TicTacToe.connect(accounts[account || 0]).joinGameFromERC20(id, token)
            }
            console.log("You joined")
        } catch (e) {
            console.log(e)
        }
    })
