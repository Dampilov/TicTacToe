import { BigNumber } from "ethers"
import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareTicTacToeTokens, prepareSigners, gameArgs, game, ERC20Args, wallet } from "./utils/prepare"
import { Web3Provider } from "ethers/node_modules/@ethersproject/providers"

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
            const gameID = 0
            const txReceiver = this.owner.address
            const eth = { value: ethers.utils.parseEther(gameArgs.ether) }
            const txValue = eth.value

            // Game creation from ETH
            await this.Implement.createGameFromEth(gameArgs.days, gameArgs.hours, gameArgs.minutes, eth)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromEth(gameID, eth)

            // Make moves for cross win
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])

            await this.Implement.withdrawETH(gameID)

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
            const gameID = 0
            const txReceiver = this.owner.address
            const txValue = gameArgs.tokens
            const totalfunds = BigNumber.from(txValue).mul(2).mul(gameArgs.comission).div(100)

            // Should approve tokens for game
            await this.ERC20.transfer(this.bob.address, gameArgs.tokens)
            await this.ERC20.approve(this.Implement.address, gameArgs.tokens)
            await this.ERC20.connect(this.bob).approve(this.Implement.address, gameArgs.tokens)

            // Owner create game from ERC20
            await this.Implement.createGamefromERC20(this.ERC20.address, gameArgs.days, gameArgs.hours, gameArgs.minutes, txValue)

            // Join to game from ETH
            await this.Implement.connect(this.bob).joinGameFromERC20(gameID, this.ERC20.address)

            // Make moves for cross win
            await this.Implement.step(gameID, gameArgs.x[0], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[1], gameArgs.y[1])
            await this.Implement.step(gameID, gameArgs.x[1], gameArgs.y[0])
            await this.Implement.connect(this.bob).step(gameID, gameArgs.x[2], gameArgs.y[2])
            await this.Implement.step(gameID, gameArgs.x[2], gameArgs.y[0])

            await this.Implement.withdrawERC20(gameID, this.ERC20.address)

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
