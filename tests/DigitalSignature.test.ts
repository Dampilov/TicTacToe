import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareProxyTokens, prepareSigners, digital, gameArgs } from "./utils/prepare"
import { Web3Provider } from "ethers/node_modules/@ethersproject/providers"

use(waffle.solidity)

describe("TicTacToe game contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareProxyTokens(this, this.owner)
    })

    describe("Deployment", function () {
        it("Should TicTacToe be deployed", async function () {
            expect(await this.Implement.address).to.be.properAddress
            expect(await this.Implement.comission()).to.equal(gameArgs.comission)
        })

        it("Should Wallet be deployed", async function () {
            expect(await this.Implement.wallet()).to.eq(this.Wallet.address)
        })
    })

    describe("Change comission", function () {
        it("Should change comission", async function () {
            await this.Implement.setPermitValidDays(digital.permitValidDays)
            const permitValidDays = await this.Implement.permitDeadline()
            const domain = {
                name: digital.domain.name,
                chainId: digital.domain.chainId,
                verifyingContract: this.Implement.address,
            }

            const message = {
                participant: this.bob.address,
                value: digital.newComission,
                nonce: 0,
                deadline: +permitValidDays,
            }

            const digitalData = JSON.stringify({
                types: digital.types,
                domain: domain,
                primaryType: digital.primaryType,
                message: message,
            })

            const res = await ethers.provider.send("eth_signTypedData_v4", [this.owner.address, digitalData])
            await this.Implement.connect(this.bob).changeCommision(digital.newComission, res)
            const newComission = await this.Implement.comission()
            expect(newComission).to.eq(digital.newComission)
        })

        it("Should fail if try secont time", async function () {
            await this.Implement.setPermitValidDays(digital.permitValidDays)
            const permitValidDays = await this.Implement.permitDeadline()

            const domain = {
                name: digital.domain.name,
                chainId: digital.domain.chainId,
                verifyingContract: this.Implement.address,
            }

            const message = {
                participant: this.bob.address,
                value: digital.newComission,
                nonce: 0,
                deadline: +permitValidDays,
            }

            const digitalData = JSON.stringify({
                types: digital.types,
                domain: domain,
                primaryType: digital.primaryType,
                message: message,
            })

            const res = await ethers.provider.send("eth_signTypedData_v4", [this.owner.address, digitalData])
            await this.Implement.connect(this.bob).changeCommision(digital.newComission, res)
            await expect(this.Implement.connect(this.misha).changeCommision(50, res)).to.be.revertedWith("No permission")
        })
    })
})
