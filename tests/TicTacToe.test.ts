import { BigNumber } from "ethers"
import { expect, use } from "chai"
import { ethers, waffle, upgrades } from "hardhat"
import { prepareTicTacToeTokens, prepareSigners, gameArgs, game, ERC20Args, wallet } from "./utils/prepare"
import { duration, increase } from "./utils/time"
import { Web3Provider } from "ethers/node_modules/@ethersproject/providers"

use(waffle.solidity)

describe("TicTacToe game contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareTicTacToeTokens(this, this.owner)
    })

    describe("Deployment", function () {
        it("Should TicTacToe be deployed", async function () {
            expect(await this.Implement.address).to.be.properAddress
        })

        it("Should ERC20 be deployed", async function () {
            expect(await this.ERC20.balanceOf(this.owner.address)).to.eq(ERC20Args.totalSupply)
        })

        it("Should Wallet be deployed", async function () {
            expect(await this.Implement.wallet()).to.eq(this.Wallet.address)
        })
    })

    describe("Game creation", function () {
        it("Should create game from ether", async function () {
            const gameID = gameArgs.gameID
            const isTokenGame = false
            const eth = {
                value: ethers.utils.parseEther(gameArgs.ether),
            }
            const comission = BigNumber.from(eth.value.toString()).mul(gameArgs.comission).div(100)
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Should exist game
            const ownerGame = await this.Implement.games(gameID)

            expect(ownerGame.betSize).to.equal(eth.value)
            expect(ownerGame.owner).to.equal(this.owner.address)
            expect(ownerGame.state).to.equal(game.state.free)
            expect(ownerGame.winner).to.equal(game.sign.free)
            expect(await this.Implement.isERC20Game(gameID)).to.equal(isTokenGame)
            const waitTime = BigNumber.from(duration.days(gameArgs.days.toString())).add(
                duration.hours(gameArgs.hours.toString()).add(duration.minutes(gameArgs.minutes.toString()))
            )
            expect(ownerGame.waitingTime).to.equal(waitTime)
            expect(ownerGame.lastActiveTime).to.above(game.lastActiveTime)

            // Should game balance have change
            const gameBalance = await waffle.provider.getBalance(this.Implement.address)
            const gameBalanceWithComission = BigNumber.from(eth.value).sub(comission)
            expect(gameBalance).to.eq(gameBalanceWithComission)

            // Should wallet balance have change
            const walletBalance = await this.Wallet.balance()
            expect(walletBalance).to.equal(comission)
        })

        it("Should create game from tokens ERC20", async function () {
            const gameID = gameArgs.gameID
            const isTokenGame = true
            const tokenBet = gameArgs.tokens
            const comission = BigNumber.from(gameArgs.tokens).mul(gameArgs.comission).div(100)

            // Should approve tictactoe
            await this.ERC20.approve(this.Implement.address, tokenBet)

            await this.Implement.createGamefromERC20(this.ERC20.address, gameArgs.days, gameArgs.hours, gameArgs.minutes, tokenBet)

            // Should exist game
            const ownerGame = await this.Implement.games(gameID)

            expect(ownerGame.betSize).to.equal(gameArgs.tokens)
            expect(ownerGame.owner).to.equal(this.owner.address)
            expect(ownerGame.state).to.equal(game.state.free)
            expect(ownerGame.winner).to.equal(game.sign.free)
            expect(await this.Implement.isERC20Game(gameID)).to.equal(isTokenGame)
            const waitTime = BigNumber.from(duration.days(gameArgs.days.toString())).add(
                duration.hours(gameArgs.hours.toString()).add(duration.minutes(gameArgs.minutes.toString()))
            )
            expect(ownerGame.waitingTime).to.equal(waitTime)
            expect(ownerGame.lastActiveTime).to.above(game.lastActiveTime)

            // Should game balance have change
            const gameBalance = await this.ERC20.balanceOf(this.Implement.address)
            const gameBalanceWithComission = BigNumber.from(tokenBet).sub(comission)
            expect(gameBalance).to.equal(gameBalanceWithComission)

            // Should wallet balance have change
            const walletBalance = await this.ERC20.balanceOf(this.Wallet.address)
            expect(walletBalance).to.equal(comission)
        })
    })

    describe("Join game", function () {
        it("Should join to game from ETH", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }
            const comission = BigNumber.from(eth.value.toString()).mul(gameArgs.comission).div(100)

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            let myGame = await this.Implement.games(gameID)
            const creationTime = myGame.lastActiveTime

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Refresh game after join
            myGame = await this.Implement.games(gameID)
            const ownerSign = await this.Implement.sign(myGame.owner, gameID)
            const rivalSign = await this.Implement.sign(myGame.rival, gameID)

            // Game's fields should have changed
            expect(myGame.rival).to.equal(this.bob.address)
            expect(myGame.state).to.equal(game.state.playing)
            expect(myGame.lastActiveTime).to.above(creationTime)
            expect(ownerSign).to.equal(game.sign.cross)
            expect(rivalSign).to.equal(game.sign.zero)

            // Should game balance have change
            const gameBalance = await waffle.provider.getBalance(this.Implement.address)
            const gameBalanceWithComission = BigNumber.from(eth.value).sub(comission).mul(2)
            expect(gameBalance).to.eq(gameBalanceWithComission)

            // Should wallet balance have change
            const walletBalance = await this.Wallet.balance()
            const totalBalance = BigNumber.from(comission).mul(2)
            expect(walletBalance).to.equal(totalBalance)
        })

        it("Should join to game from ERC20 tokens", async function () {
            const gameID = gameArgs.gameID
            const tokenBet = gameArgs.tokens
            const comission = BigNumber.from(gameArgs.tokens).mul(gameArgs.comission).div(100)

            // Should approve tokens for game
            await this.ERC20.transfer(this.bob.address, tokenBet)
            await this.ERC20.approve(this.Implement.address, tokenBet)
            await this.ERC20.connect(this.bob).approve(this.Implement.address, tokenBet)

            // Owner create game from ERC20
            await this.Implement.createGamefromERC20(this.ERC20.address, gameArgs.days, gameArgs.hours, gameArgs.minutes, tokenBet)

            let myGame = await this.Implement.games(gameID)
            const creationTime = myGame.lastActiveTime

            // Join to game from ERC20
            await this.Implement.connect(this.bob).joinGameFromERC20(gameID, this.ERC20.address)

            // Refresh game after join
            myGame = await this.Implement.games(gameID)
            const ownerSign = await this.Implement.sign(myGame.owner, gameID)
            const rivalSign = await this.Implement.sign(myGame.rival, gameID)

            // Game's fields should have changed
            expect(myGame.rival).to.equal(this.bob.address)
            expect(myGame.state).to.equal(game.state.playing)
            expect(myGame.lastActiveTime).to.above(creationTime)
            expect(ownerSign).to.equal(game.sign.cross)
            expect(rivalSign).to.equal(game.sign.zero)

            // Should game balance have change
            const gameBalance = await this.ERC20.balanceOf(this.Implement.address)
            const gameBalanceWithComission = BigNumber.from(tokenBet).sub(comission).mul(2)
            expect(gameBalance).to.equal(gameBalanceWithComission)

            // Should wallet balance have change
            const walletBalance = await this.ERC20.balanceOf(this.Wallet.address)
            const totalBalance = BigNumber.from(comission).mul(2)
            expect(walletBalance).to.equal(totalBalance)
        })
    })

    describe("Make move", function () {
        it("Should make move", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            let myGame = await this.Implement.games(gameID)
            const joinTime = myGame.lastActiveTime
            const isCrossMove = myGame.isCrossMove

            let cells = await this.Implement.getCell(gameID)

            // Cells should be zero
            expect(cells).to.deep.equal(game.cell)

            // Make move
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])

            // Fields should be different of join time
            myGame = await this.Implement.games(gameID)
            expect(myGame.lastActiveTime).to.above(joinTime)
            expect(myGame.isCrossMove).to.equal(!isCrossMove)

            // Cell should change
            cells = await this.Implement.getCell(gameID)
            expect(cells[gameArgs.x[0]][gameArgs.y[0]]).to.equal(game.sign.cross)
        })

        it("Should fail if move time over", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Time skip
            await increase(duration.days(gameArgs.days.toString()))
            await increase(duration.hours(gameArgs.hours.toString()))
            await increase(duration.minutes(gameArgs.minutes.toString()))

            // Make a late move
            await expect(this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])).to.be.revertedWith("Move time over")
        })

        it("Should fail if wrong player's move", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Should make first move cross
            await expect(this.Implement.connect(this.bob).step(gameID, gameArgs.x[0], gameArgs.y[0])).to.be.revertedWith("Not your move")
        })
    })

    describe("End game and withdraws", function () {
        it("Should win cross in ETH bet and withdraw winning", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make moves
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])

            // Game's fields should update
            let myGame = await this.Implement.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.cross)

            // Should withdraw winning
            const winning = BigNumber.from(myGame.betSize).mul(2)
            const winningWithComission = 100 - gameArgs.comission
            const totalWinning = BigNumber.from(winning).mul(winningWithComission).div(100)

            // Should owner and game balances have changes
            const ownerBalanceBefore = await waffle.provider.getBalance(this.owner.address)
            const gameBalanceBefore = await waffle.provider.getBalance(this.Implement.address)

            await this.Implement.withdrawETH(gameID)

            const ownerBalanceAfter = await waffle.provider.getBalance(this.owner.address)
            const gameBalanceAfter = await waffle.provider.getBalance(this.Implement.address)

            expect(ownerBalanceAfter).to.above(BigNumber.from(ownerBalanceBefore))
            expect(gameBalanceAfter).to.equal(BigNumber.from(gameBalanceBefore).sub(totalWinning))
        })

        it("Should win cross in tokens bet and withdraw winning", async function () {
            const gameID = gameArgs.gameID
            const tokenBet = gameArgs.tokens

            // Should approve tokens for game
            await this.ERC20.transfer(this.bob.address, tokenBet)
            await this.ERC20.approve(this.Implement.address, tokenBet)
            await this.ERC20.connect(this.bob).approve(this.Implement.address, tokenBet)

            // Owner create game from ERC20
            await this.Implement.createGamefromERC20(this.ERC20.address, gameArgs.days, gameArgs.hours, gameArgs.minutes, tokenBet)

            // Join to game from ERC20
            await this.Implement.connect(this.bob).joinGameFromERC20(gameID, this.ERC20.address)

            // Make moves
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])

            // Game's fields should update
            let myGame = await this.Implement.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.cross)

            // Should withdraw winning
            const winning = BigNumber.from(myGame.betSize).mul(2)
            const winningWithComission = 100 - gameArgs.comission
            const totalWinning = BigNumber.from(winning).mul(winningWithComission).div(100)

            // Should owner and game balances have changes
            const ownerBalanceBefore = await this.ERC20.balanceOf(this.owner.address)
            const gameBalanceBefore = await this.ERC20.balanceOf(this.Implement.address)

            await this.Implement.withdrawERC20(gameID, this.ERC20.address)

            const ownerBalanceAfter = await this.ERC20.balanceOf(this.owner.address)
            const gameBalanceAfter = await this.ERC20.balanceOf(this.Implement.address)

            expect(ownerBalanceAfter).to.equal(BigNumber.from(ownerBalanceBefore).add(totalWinning))
            expect(gameBalanceAfter).to.equal(BigNumber.from(gameBalanceBefore).sub(totalWinning))
        })

        it("Should end in a draw in ETH bet and withdraw winning", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make moves
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[1])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[0])
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[1])

            // Game's fields should update
            let myGame = await this.Implement.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.draw)

            // Should withdraw winning
            const winning = BigNumber.from(myGame.betSize)
            const winningWithComission = 100 - gameArgs.comission
            const totalCost = BigNumber.from(winning).mul(2).mul(winningWithComission).div(100)

            // Should owner, rival and game balances have changes
            const ownerBalanceBefore = await waffle.provider.getBalance(this.owner.address)
            const rivalBalanceBefore = await waffle.provider.getBalance(this.bob.address)
            const gameBalanceBefore = await waffle.provider.getBalance(this.Implement.address)

            await this.Implement.withdrawETH(gameID)
            await this.Implement.connect(this.bob).withdrawETH(gameID)

            const ownerBalanceAfter = await waffle.provider.getBalance(this.owner.address)
            const rivalBalanceAfter = await waffle.provider.getBalance(this.bob.address)
            const gameBalanceAfter = await waffle.provider.getBalance(this.Implement.address)

            expect(ownerBalanceAfter).to.above(BigNumber.from(ownerBalanceBefore))
            expect(rivalBalanceAfter).to.above(BigNumber.from(rivalBalanceBefore))
            expect(gameBalanceAfter).to.equal(BigNumber.from(gameBalanceBefore).sub(totalCost))
        })

        it("Should end if move time over (game in tokens bet)", async function () {
            const gameID = gameArgs.gameID
            const tokenBet = gameArgs.tokens

            // Should approve tokens for game
            await this.ERC20.transfer(this.bob.address, tokenBet)
            await this.ERC20.approve(this.Implement.address, tokenBet)
            await this.ERC20.connect(this.bob).approve(this.Implement.address, tokenBet)

            // Owner create game from ERC20
            await this.Implement.createGamefromERC20(this.ERC20.address, gameArgs.days, gameArgs.hours, gameArgs.minutes, tokenBet)

            // Join to game from ERC20
            await this.Implement.connect(this.bob).joinGameFromERC20(gameID, this.ERC20.address)

            // Time skip
            await increase(duration.days(gameArgs.days.toString()))
            await increase(duration.hours(gameArgs.hours.toString()))
            await increase(duration.minutes(gameArgs.minutes.toString()))

            // Should end game if waiting time over
            await this.Implement.checkGameTime(gameID)

            // Game's fields should update
            let myGame = await this.Implement.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.zero)
        })
    })

    describe("Games", function () {
        it("Should get free games", async function () {
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Free games
            const freeGames = await this.Implement.freeGames()
            expect(freeGames[0].owner).to.equal(this.owner.address)
            expect(freeGames[0].state).to.equal(game.state.free)
            expect(freeGames[0].winner).to.equal(game.sign.free)
            const waitTime = BigNumber.from(duration.days(gameArgs.days.toString())).add(
                duration.hours(gameArgs.hours.toString()).add(duration.minutes(gameArgs.minutes.toString()))
            )
            expect(freeGames[0].waitingTime).to.equal(waitTime)
            expect(freeGames[0].lastActiveTime).to.above(game.lastActiveTime)
        })
    })

    describe("Statistic", function () {
        it("Should get statistic of end in draw games", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Should be 0%
            expect(await this.Implement.getDrawGameStatistic()).to.equal(gameArgs.percent[0])

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make moves
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[1])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[0])
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[1])

            // Should be 100%
            expect(await this.Implement.getDrawGameStatistic()).to.equal(gameArgs.percent[1])
        })

        it("Should get games statistic of cross win", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Should be 0%
            expect(await this.Implement.getCrossGameStatistic()).to.equal(gameArgs.percent[0])

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make move
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])

            // Should be 100%
            expect(await this.Implement.getCrossGameStatistic()).to.equal(gameArgs.percent[1])
        })

        it("Should get games statistic of zero win", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Should be 0%
            expect(await this.Implement.getZeroGameStatistic()).to.equal(gameArgs.percent[0])

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make move
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[0])

            // Should be 100%
            expect(await this.Implement.getZeroGameStatistic()).to.equal(gameArgs.percent[1])
        })

        it("Should get games statistic by address", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Should be 0%
            expect(await this.Implement.getStatisticByAddress(this.owner.address)).to.equal(gameArgs.percent[0])

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make move
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])

            // Should be 100%
            expect(await this.Implement.getStatisticByAddress(this.owner.address)).to.equal(gameArgs.percent[1])
        })
    })
})

describe("Multisig Wallet", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareTicTacToeTokens(this, this.owner)
    })

    describe("Submit", function () {
        it("Should submit ETH transaction", async function () {
            const txId = 0
            const txReceiver = this.owner.address
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }
            const txValue = eth.value

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Should submit
            await this.Wallet.submit(txReceiver, txValue)
            const transaction = await this.Wallet.transactions(txId)
            expect(transaction.to).to.equal(txReceiver)
            expect(transaction.value).to.equal(txValue)
            expect(transaction.executed).to.equal(false)
        })

        it("Should submit ERC20 transaction", async function () {
            const txId = 0
            const txReceiver = this.owner.address
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }
            const txValue = eth.value
            const tokenBet = gameArgs.tokens

            // Should approve tokens for game
            await this.ERC20.approve(this.Implement.address, tokenBet)

            // Owner create game from ERC20
            await this.Implement.createGamefromERC20(this.ERC20.address, gameArgs.days, gameArgs.hours, gameArgs.minutes, tokenBet)

            // Should submit
            await this.Wallet.submitERC20(txReceiver, txValue, this.ERC20.address)
            const transaction = await this.Wallet.transactions(txId)
            const tokenTx = await this.Wallet.tokenTx(txId)
            expect(tokenTx.isERC20Tx).to.equal(true)
            expect(tokenTx.tokenAddress).to.equal(this.ERC20.address)
            expect(transaction.to).to.equal(txReceiver)
            expect(transaction.value).to.equal(txValue)
            expect(transaction.executed).to.equal(false)
        })
    })

    describe("Approve", function () {
        it("Should approve transaction", async function () {
            const txId = 0
            const txReceiver = this.owner.address
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }
            const txValue = eth.value

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Submit
            await this.Wallet.submit(txReceiver, txValue)

            // Approve
            await this.Wallet.approve(txId)
            const isApproved = await this.Wallet.approved(txId, this.owner.address)
            expect(isApproved).to.equal(true)
        })
    })

    describe("Execute", function () {
        it("Should execute ETH transaction", async function () {
            const txId = 0
            const txReceiver = this.owner.address
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }
            const txValue = eth.value

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Submit
            const totalfunds = BigNumber.from(txValue).mul(gameArgs.comission).div(100)
            await this.Wallet.submit(txReceiver, totalfunds)

            // Approve transaction
            await this.Wallet.approve(txId)
            await this.Wallet.connect(this.alice).approve(txId)

            // Should owner balances have changes
            const ownerBalanceBefore = await waffle.provider.getBalance(this.owner.address)
            const walletBalanceBefore = await this.Wallet.balance()

            // Execute
            await this.Wallet.execute(txId)

            const ownerBalanceAfter = await waffle.provider.getBalance(this.owner.address)
            const walletBalanceAfter = await this.Wallet.balance()
            expect(ownerBalanceAfter).to.above(BigNumber.from(ownerBalanceBefore))
            expect(walletBalanceAfter).to.equal(BigNumber.from(walletBalanceBefore).sub(totalfunds))
        })

        it("Should execute tokens transaction", async function () {
            const txId = 0
            const txReceiver = this.owner.address
            const txValue = gameArgs.tokens
            const totalfunds = BigNumber.from(txValue).mul(gameArgs.comission).div(100)

            // Should approve tokens for game
            await this.ERC20.approve(this.Implement.address, gameArgs.tokens)

            // Owner create game from ERC20
            await this.Implement.createGamefromERC20(this.ERC20.address, gameArgs.days, gameArgs.hours, gameArgs.minutes, txValue)

            // Submit
            await this.Wallet.submitERC20(txReceiver, totalfunds, this.ERC20.address)

            // Approve transaction
            await this.Wallet.approve(txId)
            await this.Wallet.connect(this.alice).approve(txId)

            // Should owner and wallet balances have changes
            const reciverBalanceBefore = await this.ERC20.balanceOf(txReceiver)
            const walletBalanceBefore = await this.ERC20.balanceOf(this.Wallet.address)

            // Execute
            await this.Wallet.execute(txId)

            const reciverBalanceAfter = await this.ERC20.balanceOf(txReceiver)
            const walletBalanceAfter = await this.ERC20.balanceOf(this.Wallet.address)
            expect(reciverBalanceAfter).to.equal(BigNumber.from(reciverBalanceBefore).add(totalfunds))
            expect(walletBalanceAfter).to.equal(BigNumber.from(walletBalanceBefore).sub(totalfunds))
        })
    })
})
