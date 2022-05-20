import { task } from "hardhat/config"
import "./getContract"

task("joinGame", "Join")
    .addOptionalParam("account", "Account")
    .addParam("id", "ID of game")
    .setAction(async ({ account, id }, hre) => {
        const contract = await hre.run("get-contract", { name: "TicTacToe" })

        try {
            const accounts = await hre.ethers.getSigners()
            await contract.connect(accounts[account || 0]).joinGame(id)
            console.log("You joined")
        } catch (e) {
            console.log(e)
        }
    })
