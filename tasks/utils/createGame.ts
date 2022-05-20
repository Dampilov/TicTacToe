import { task } from "hardhat/config"
import "./getContract"

task("createGame", "Start new game")
    .addOptionalParam("days", "Days for waiting to move")
    .addOptionalParam("hours", "Hours for waiting to move")
    .addParam("minutes", "Seconds for waiting to move")
    .setAction(async ({ days, hours, minutes }, hre) => {
        const contract = await hre.run("get-contract", { name: "TicTacToe" })

        try {
            await contract.createGame(days || 0, hours || 0, minutes)
            console.log("Game started")
        } catch (e) {
            console.log(e)
        }
    })
