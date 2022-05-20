import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { Address } from "hardhat-deploy/dist/types"

export async function prepareSigners(thisObject: Mocha.Context) {
    thisObject.signers = await ethers.getSigners()
    thisObject.owner = thisObject.signers[0]
    thisObject.alice = thisObject.signers[1]
    thisObject.bob = thisObject.signers[2]
    thisObject.carol = thisObject.signers[3]
    thisObject.tema = thisObject.signers[4]
    thisObject.misha = thisObject.signers[5]
}

export async function prepareTicTacToeTokens(thisObject: Mocha.Context, signer: SignerWithAddress) {
    const tokenFactory = await ethers.getContractFactory("TicTacToe")

    const TicTacToe = await tokenFactory.connect(signer).deploy()
    await TicTacToe.deployed()
    thisObject.token1 = TicTacToe
}

export const args = {
    gameID: 0,
    days: 0,
    hours: 1,
    minutes: 0,
    x: [0, 1, 2],
    y: [0, 1, 2],
    percent: [0, 100],
}

export const game = {
    state: {
        free: 0,
        playing: 1,
        finished: 2,
    },
    cell: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ],
    isCrossMove: true,
    sign: {
        free: 0,
        cross: 1,
        zero: 2,
        draw: 3,
    },
    waitingTime: 0,
    lastActiveTime: 0,
}
