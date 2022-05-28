import { task } from "hardhat/config"

task("createGame", "Start new game")
    .addOptionalParam("days", "Days for waiting to move")
    .addOptionalParam("hours", "Hours for waiting to move")
    .addOptionalParam("token", "Address of ERC20 token")
    .addParam("minutes", "Seconds for waiting to move")
    .addParam("bet", "Bet size. In ETH or tokens")
    .setAction(async ({ days, hours, minutes, token, bet }, hre) => {
        const TicTacToe = await hre.run("getTicTacToe")

        try {
            if (typeof token == "undefined")
                await TicTacToe.createGameFromEth(days || 0, hours || 0, minutes, { value: hre.ethers.utils.parseEther(`${bet}`) })
            else await TicTacToe.createGamefromERC20(token, days || 0, hours || 0, minutes, bet)
            console.log("Game started")
        } catch (e) {
            console.log(e)
        }
    })
