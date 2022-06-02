import { ContractFactory } from "ethers"
import { expect, use } from "chai"
import { ethers, waffle, upgrades } from "hardhat"
import { prepareProxyTokens, prepareSigners } from "./utils/prepare"

use(waffle.solidity)

describe("TicTac proxy contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareProxyTokens(this, this.owner)
    })

    describe("Deployment", function () {
        it("Should TicTacToe be deployed", async function () {
            expect(await this.Implement.address).to.be.properAddress
        })

        it("Should TicTacProxy be deployed", async function () {
            expect(await this.Proxy.address).to.be.properAddress
        })
    })

    describe("Updation", function () {
        it("Should update imlementation", async function () {
            const newVersion = "v2.0"
            const TicTacToeFactoryV2 = await ethers.getContractFactory("TicTacToeV2")
            const TicTacImplementV2 = await upgrades.upgradeProxy(
                this.Implement.address,
                TicTacToeFactoryV2.connect(this.owner) as ContractFactory
            )

            // Should get new version
            expect(await TicTacImplementV2.currentVersion()).to.equal(newVersion)
        })
    })
})
