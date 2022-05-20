import { BigNumber } from "ethers"
import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareTicTacToeTokens, prepareSigners, args, game } from "./utils/prepare"
import { duration, increase } from "./utils/time"

use(waffle.solidity)

describe("Todo list contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareTicTacToeTokens(this, this.bob)
    })

    describe("Deployment", function () {
        it("Should be deployed", async function () {
            expect(await this.token1.address).to.be.properAddress
        })
    })

    describe("Game creation", function () {
        it("Should create game", async function () {
            await this.token1.connect(this.bob).createGame(args.days, args.hours, args.minutes)

            const bobGame = await this.token1.games(args.gameID)

            expect(bobGame.owner).to.equal(this.bob.address)
            expect(bobGame.state).to.equal(game.state.free)
            expect(bobGame.winner).to.equal(game.sign.free)
            const waitTime = BigNumber.from(duration.days(args.days.toString())).add(
                duration.hours(args.hours.toString()).add(duration.minutes(args.minutes.toString()))
            )
            expect(bobGame.waitingTime).to.equal(waitTime)
            expect(bobGame.lastActiveTime).to.above(game.lastActiveTime)
        })
    })

    describe("Join game", function () {
        it("Should join to game", async function () {
            const gameID = args.gameID
            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)
            let myGame = await this.token1.games(gameID)
            const creationTime = myGame.lastActiveTime

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Refresh game after join
            myGame = await this.token1.games(gameID)

            // Game's fields should have changed
            expect(myGame.rival).to.equal(this.bob.address)
            expect(myGame.state).to.equal(game.state.playing)
            expect(myGame.lastActiveTime).to.above(creationTime)
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            const rivalSign = await this.token1.sign(this.bob.address, gameID)
            expect(ownerSign).to.above(game.sign.free)
            expect(rivalSign).to.above(game.sign.free)
        })

        it("Should fail if joined is owner", async function () {
            const gameID = args.gameID
            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)
            let myGame = await this.token1.games(gameID)
            const creationTime = myGame.lastActiveTime

            // Join to game
            await expect(this.token1.connect(this.owner).joinGame(gameID)).to.be.revertedWith("Can't play with yourself")

            // Refresh game after join
            myGame = await this.token1.games(gameID)

            // Task shouldn't have changed
            expect(myGame.rival).to.not.equal(this.owner.address)
            expect(myGame.state).to.equal(game.state.free)
            expect(myGame.lastActiveTime).to.equal(creationTime)
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            const rivalSign = await this.token1.sign(this.bob.address, gameID)
            expect(ownerSign).to.equal(game.sign.free)
            expect(rivalSign).to.equal(game.sign.free)
        })

        it("Should fail if game not exist", async function () {
            const gameID = args.gameID

            // Join to game
            await expect(this.token1.connect(this.owner).joinGame(gameID)).to.be.revertedWith("That game not exist")
        })
        /*
        it("Should complete task and if completed not in deadline, should mark it", async function () {
            const taskId = 0

            // Create a task with a 1 hour timer
            const taskName = "Write module for contract"
            await this.token1.connect(this.bob).createTask(taskName, 0, 1)

            let bobTask = await this.token1.tasks(taskId)

            expect(bobTask.name).to.equal(taskName)
            expect(bobTask.completed).to.equal(false)
            expect(bobTask.timeLeft).to.above(0)

            // Time skip 1 hours
            increase(duration.hours("1"))

            // Task complition
            await this.token1.connect(this.bob).completeTask(taskId)

            bobTask = await this.token1.tasks(taskId)

            expect(bobTask.completed).to.equal(true)
            expect(await this.token1.notInDeadline(taskId)).to.equal(true)
        })*/
    })

    describe("Make move", function () {
        it("Should make move", async function () {
            const gameID = args.gameID

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            let myGame = await this.token1.games(gameID)
            const joinTime = myGame.lastActiveTime
            const isCrossMove = myGame.isCrossMove

            let cells = await this.token1.getCell(gameID)

            // Cells should be zero
            expect(cells).to.deep.equal(game.cell)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            ownerSign == game.sign.cross
                ? await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                : await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])

            // Fields should be different of join time
            myGame = await this.token1.games(gameID)
            expect(myGame.lastActiveTime).to.above(joinTime)
            expect(myGame.isCrossMove).to.equal(!isCrossMove)

            // Cell should change
            cells = await this.token1.getCell(gameID)
            expect(cells[args.x[0]][args.y[0]]).to.equal(game.sign.cross)
        })

        it("Should fail if move time over", async function () {
            const gameID = args.gameID

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Time skip
            increase(duration.days(args.days.toString()))
            increase(duration.hours(args.hours.toString()))
            increase(duration.minutes(args.minutes.toString()))

            // Make a late move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross)
                await expect(this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])).to.be.revertedWith("Move time over")
            else await expect(this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])).to.be.revertedWith("Move time over")
        })

        it("Should fail if wrong player's move", async function () {
            const gameID = args.gameID

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) {
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                await expect(this.token1.connect(this.owner).step(gameID, args.x[1], args.y[1])).to.be.revertedWith("Not your move")
            } else {
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])
                await expect(this.token1.connect(this.bob).step(gameID, args.x[1], args.y[1])).to.be.revertedWith("Not your move")
            }
        })
    })

    describe("End game", function () {
        it("Should win cross", async function () {
            const gameID = args.gameID

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) {
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[0])
            } else {
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[0])
            }

            // Game's fields should update
            let myGame = await this.token1.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.cross)
        })

        it("Should end in a draw", async function () {
            const gameID = args.gameID

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) {
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[1])
            } else {
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[1])
            }

            // Game's fields should update
            let myGame = await this.token1.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)
            expect(myGame.winner).to.equal(game.sign.draw)
        })

        it("Should end if move time over", async function () {
            const gameID = args.gameID

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Time skip
            increase(duration.days(args.days.toString()))
            increase(duration.hours(args.hours.toString()))
            increase(duration.minutes(args.minutes.toString()))

            // Should end game if waiting time over
            await this.token1.connect(this.owner).checkGameTime(gameID)

            // Game's fields should update
            let myGame = await this.token1.games(gameID)
            expect(myGame.state).to.equal(game.state.finished)

            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) expect(myGame.winner).to.equal(game.sign.zero)
            else expect(myGame.winner).to.equal(ownerSign)
        })
    })

    describe("Games", function () {
        it("Should get free games", async function () {
            const gameID = args.gameID

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Free games
            const freeGames = await this.token1.freeGames()
            expect(freeGames[0].owner).to.equal(this.owner.address)
            expect(freeGames[0].state).to.equal(game.state.free)
            expect(freeGames[0].winner).to.equal(game.sign.free)
            const waitTime = BigNumber.from(duration.days(args.days.toString())).add(
                duration.hours(args.hours.toString()).add(duration.minutes(args.minutes.toString()))
            )
            expect(freeGames[0].waitingTime).to.equal(waitTime)
            expect(freeGames[0].lastActiveTime).to.above(game.lastActiveTime)
        })
    })

    describe("Statistic", function () {
        it("Should get statistic of end in draw games", async function () {
            const gameID = args.gameID

            // Should be 0%
            expect(await this.token1.getDrawGameStatistic()).to.equal(args.percent[0])

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) {
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[1])
            } else {
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[1])
            }

            // Should be 100%
            expect(await this.token1.getDrawGameStatistic()).to.equal(args.percent[1])
        })

        it("Should get games statistic of cross win", async function () {
            const gameID = args.gameID

            // Should be 0%
            expect(await this.token1.getCrossGameStatistic()).to.equal(args.percent[0])

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) {
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[0])
            } else {
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[0])
            }

            // Should be 100%
            expect(await this.token1.getCrossGameStatistic()).to.equal(args.percent[1])
        })

        it("Should get games statistic of zero win", async function () {
            const gameID = args.gameID

            // Should be 0%
            expect(await this.token1.getZeroGameStatistic()).to.equal(args.percent[0])

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) {
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[0])
            } else {
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[0])
            }

            // Should be 100%
            expect(await this.token1.getZeroGameStatistic()).to.equal(args.percent[1])
        })

        it("Should get games statistic by address", async function () {
            const gameID = args.gameID

            // Should be 0%
            expect(await this.token1.getStatisticByAddress(this.owner.address)).to.equal(args.percent[0])

            // Game creation
            await this.token1.connect(this.owner).createGame(args.days, args.hours, args.minutes)

            // Join to game
            await this.token1.connect(this.bob).joinGame(gameID)

            // Make move
            const ownerSign = await this.token1.sign(this.owner.address, gameID)
            if (ownerSign == game.sign.cross) {
                await this.token1.connect(this.owner).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[0])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[2], args.y[0])
            } else {
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[0])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[1])
                await this.token1.connect(this.bob).step(gameID, args.x[2], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[2])
                await this.token1.connect(this.bob).step(gameID, args.x[0], args.y[2])
                await this.token1.connect(this.owner).step(gameID, args.x[1], args.y[0])
            }

            // Should be 100%
            expect(await this.token1.getStatisticByAddress(this.owner.address)).to.equal(args.percent[1])
        })
    })
    /*
    describe("Tasks statistic", function () {
        it("Should get percentage of completed not in deadline tasks", async function () {
            const taskId = 0
            const taskOwner = this.bob

            // Task creation
            const taskName = "Write module for contract"
            await this.token1.connect(taskOwner).createTask(taskName, 0, 1)

            let bobTask = await this.token1.tasks(taskId)

            expect(bobTask.name).to.equal(taskName)
            expect(bobTask.completed).to.equal(false)
            expect(bobTask.timeLeft).to.above(0)

            // Task complition
            await this.token1.connect(taskOwner).completeTask(taskId)

            bobTask = await this.token1.tasks(taskId)

            // Task's status should have changed
            expect(bobTask.completed).to.equal(true)

            // Tasks percentage
            const percentage = await this.token1.connect(taskOwner).getStatisticByAddress(taskOwner.address)
            expect(percentage).to.equal(100)
        })

        it("Should get 0 if owner don't have any completed tasks", async function () {
            const taskId = 0
            const taskOwner = this.bob

            // Task creation
            const taskName = "Write module for contract"
            await this.token1.connect(taskOwner).createTask(taskName, 0, 1)

            let bobTask = await this.token1.tasks(taskId)

            expect(bobTask.name).to.equal(taskName)
            expect(bobTask.completed).to.equal(false)
            expect(bobTask.timeLeft).to.above(0)

            // Tasks percentage
            const percentage = await this.token1.connect(taskOwner).getStatisticByAddress(taskOwner.address)
            expect(percentage).to.equal(0)
        })
    })*/
})
