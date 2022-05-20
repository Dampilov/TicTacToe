import { task } from "hardhat/config"
import "./getContract"

task("createGame", "Start")
    .addOptionalParam("days", "Days")
    .addOptionalParam("hours", "Hours")
    .addParam("minutes", "Seconds")
    .setAction(async ({ days, hours, minutes }, hre) => {
        const contract = await hre.run("get-contract", { name: "TicTacToe" })

        try {
            await contract.createGame(days || 0, hours || 0, minutes)
            console.log("Game started")
        } catch (e) {
            console.log(e)
        }
    })
