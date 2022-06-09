import { BigNumber } from "ethers"
import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
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
            expect(await this.Implement.comission()).to.equal(gameArgs.comission)
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
            expect(gameBalance).to.eq(eth.value)

            // Should wallet balance have change
            /* const walletBalance = await this.Wallet.balance()
            expect(walletBalance).to.equal(comission) */
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
            expect(gameBalance).to.equal(tokenBet)

            // Should wallet balance have change
            /* const walletBalance = await this.ERC20.balanceOf(this.Wallet.address)
            expect(walletBalance).to.equal(comission) */
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
            const totalBet = BigNumber.from(eth.value).mul(2)
            expect(gameBalance).to.eq(totalBet)
        })

        it("Should join to game from ERC20 tokens", async function () {
            const gameID = gameArgs.gameID
            const tokenBet = gameArgs.tokens

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
            const totalBet = BigNumber.from(tokenBet).mul(2)
            expect(gameBalance).to.equal(totalBet)
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
        it("Should win zero in ETH bet and withdraw winning", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make moves for cross win
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[1])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[0], gameArgs.y[0])

            // Game's fields should update
            let myGame = await this.Implement.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.zero)

            // Should withdraw winning
            const winning = BigNumber.from(myGame.betSize).mul(2)
            const winningWithComission = 100 - gameArgs.comission
            const totalWinning = BigNumber.from(winning).mul(winningWithComission).div(100)

            // Should winner and game balances have changes
            const winnerBalanceBefore = await waffle.provider.getBalance(this.bob.address)
            const gameBalanceBefore = await waffle.provider.getBalance(this.Implement.address)

            await this.Implement.connect(this.bob).withdrawETH(gameID)

            const winnerBalanceAfter = await waffle.provider.getBalance(this.bob.address)
            const gameBalanceAfter = await waffle.provider.getBalance(this.Implement.address)

            expect(winnerBalanceAfter).to.above(BigNumber.from(winnerBalanceBefore))
            expect(gameBalanceAfter).to.equal(BigNumber.from(gameBalanceBefore).sub(totalWinning))
        })

        it("Should win zero in tokens bet and withdraw winning", async function () {
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
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[1])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[0], gameArgs.y[0])

            // Game's fields should update
            let myGame = await this.Implement.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.zero)

            // Should withdraw winning
            const winning = BigNumber.from(myGame.betSize).mul(2)
            const winningWithComission = 100 - gameArgs.comission
            const totalWinning = BigNumber.from(winning).mul(winningWithComission).div(100)

            // Should winner and game balances have changes
            const winnerBalanceBefore = await this.ERC20.balanceOf(this.bob.address)
            const gameBalanceBefore = await this.ERC20.balanceOf(this.Implement.address)

            await this.Implement.connect(this.bob).withdrawERC20(gameID, this.ERC20.address)

            const winnerBalanceAfter = await this.ERC20.balanceOf(this.bob.address)
            const gameBalanceAfter = await this.ERC20.balanceOf(this.Implement.address)

            expect(winnerBalanceAfter).to.equal(BigNumber.from(winnerBalanceBefore).add(totalWinning))
            expect(gameBalanceAfter).to.equal(BigNumber.from(gameBalanceBefore).sub(totalWinning))
        })

        it("Should have access to cancel game if no one has joined within waiting time", async function () {
            const gameID = gameArgs.gameID
            const tokenBet = gameArgs.tokens

            // Should approve tokens for game
            await this.ERC20.transfer(this.bob.address, tokenBet)
            await this.ERC20.connect(this.bob).approve(this.Implement.address, tokenBet)

            // Owner create game from ERC20
            await this.Implement.connect(this.bob).createGamefromERC20(
                this.ERC20.address,
                gameArgs.days,
                gameArgs.hours,
                gameArgs.minutes,
                tokenBet
            )

            // Time skip
            await increase(duration.days(gameArgs.days.toString()))
            await increase(duration.hours(gameArgs.hours.toString()))
            await increase(duration.minutes(gameArgs.minutes.toString()))

            // Should can withdraw if waiting time over
            await this.Implement.connect(this.bob).cancelGame(gameID)

            // Should withdraw with comission
            const winning = BigNumber.from(tokenBet)
            const winningWithComission = 100 - gameArgs.comission
            const totalWinning = BigNumber.from(winning).mul(winningWithComission).div(100)

            // Should withdraw, than owner and game balances should have changes
            const ownerBalanceBefore = await this.ERC20.balanceOf(this.bob.address)
            const gameBalanceBefore = await this.ERC20.balanceOf(this.Implement.address)

            await this.Implement.connect(this.bob).withdrawERC20(gameID, this.ERC20.address)

            const ownerBalanceAfter = await this.ERC20.balanceOf(this.bob.address)
            const gameBalanceAfter = await this.ERC20.balanceOf(this.Implement.address)

            expect(ownerBalanceAfter).to.equal(BigNumber.from(ownerBalanceBefore).add(totalWinning))
            expect(gameBalanceAfter).to.equal(BigNumber.from(gameBalanceBefore).sub(totalWinning))
        })

        it("Should send comission to wallet", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make moves for cross win
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[1])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[0], gameArgs.y[0])

            // Should withdraw winning
            const winning = BigNumber.from(eth.value).mul(2)
            const fundsWithComission = gameArgs.comission
            const totalFunds = BigNumber.from(winning).mul(fundsWithComission).div(100)

            // Should wallet balance have change
            const walletBalanceBefore = await waffle.provider.getBalance(this.Wallet.address)

            await this.Implement.connect(this.owner).withdrawETH(gameID)

            const walletBalanceAfter = await waffle.provider.getBalance(this.Wallet.address)

            expect(walletBalanceAfter).to.equal(BigNumber.from(walletBalanceBefore).add(totalFunds))
        })

        it("Should end in a draw in ETH bet and withdraw winning", async function () {
            const gameID = gameArgs.gameID
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }

            // Game creation from ETH
            await this.Implement.connect(this.alice).createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make moves
            await this.Implement.connect(this.alice).step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.connect(this.alice).step(gameID, gameArgs.x[2], gameArgs.y[1])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.alice).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[0])
            await this.Implement.connect(this.alice).step(gameID, gameArgs.x[0], gameArgs.y[2])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[2])
            await this.Implement.connect(this.alice).step(gameID, gameArgs.x[0], gameArgs.y[1])

            // Game's fields should update
            let myGame = await this.Implement.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.draw)

            // Should withdraw winning
            const winning = BigNumber.from(myGame.betSize)
            const winningWithComission = 100 - gameArgs.comission
            const totalCost = BigNumber.from(winning).mul(2).mul(winningWithComission).div(100)

            // Should owner, rival and game balances have changes
            const ownerBalanceBefore = await waffle.provider.getBalance(this.alice.address)
            const rivalBalanceBefore = await waffle.provider.getBalance(this.bob.address)
            const gameBalanceBefore = await waffle.provider.getBalance(this.Implement.address)

            await this.Implement.connect(this.alice).withdrawETH(gameID)
            await this.Implement.connect(this.bob).withdrawETH(gameID)

            const ownerBalanceAfter = await waffle.provider.getBalance(this.alice.address)
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
