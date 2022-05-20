import { task } from "hardhat/config"
import "./getContract"

task("whoNext", "Who next")
    .addOptionalParam("account", "Account")
    .addParam("id", "ID of game")
    .setAction(async ({ account, id }, hre) => {
        const contract = await hre.run("get-contract", { name: "TicTacToe" })

        try {
            const accounts = await hre.ethers.getSigners()
            const sign = await contract.connect(accounts[account || 0]).sign(accounts[account || 0].address, id)
            const game = await contract.games(id)

            console.log(`Sign: ${sign}`)
            console.log(`Is ${sign} move: ${sign == 1 ? game.isCrossMove : !game.isCrossMove}`)
        } catch (e) {
            console.log(e)
        }
    })
