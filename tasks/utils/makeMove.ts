import { task } from "hardhat/config"
import "./getContract"

task("makeMove", "makeMove")
    .addOptionalParam("account", "Account")
    .addParam("id", "ID of game")
    .addParam("x", "ID of game")
    .addParam("y", "ID of game")
    .setAction(async ({ account, id, x, y }, hre) => {
        const contract = await hre.run("get-contract", { name: "TicTacToe" })
        try {
            const accounts = await hre.ethers.getSigners()
            await contract.connect(accounts[account || 0]).step(id, x, y)
            const cell = await contract.getCell(id)
            console.log("Cell:")
            for (let i = 0; i < 3; i++) {
                console.log(`\t${cell[i][0]} ${cell[i][1]} ${cell[i][2]}`)
            }
        } catch (e) {
            console.log(e)
        }
    })
