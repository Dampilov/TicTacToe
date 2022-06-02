import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ContractFactory } from "ethers"
import { ethers, upgrades } from "hardhat"

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
    const TicTacToeFactory = await ethers.getContractFactory("TicTacToe")
    const ERC20Factory = await ethers.getContractFactory("ERC20Mock")
    const WalletFactory = await ethers.getContractFactory("Wallet")

    const Wallet = await WalletFactory.connect(signer).deploy([thisObject.owner.address, thisObject.alice.address], 2)
    await Wallet.deployed()
    thisObject.Wallet = Wallet

    const ERC20Mock = await ERC20Factory.connect(signer).deploy(ERC20Args.totalSupply)
    await ERC20Mock.deployed()
    thisObject.ERC20 = ERC20Mock

    const Implement = await upgrades.deployProxy(TicTacToeFactory.connect(signer) as ContractFactory, [Wallet.address], {
        initializer: "initialize",
        kind: "uups",
    })
    await Implement.deployed()
    thisObject.Implement = Implement
}

export async function prepareProxyTokens(thisObject: Mocha.Context, signer: SignerWithAddress) {
    const TicTacToeFactory = await ethers.getContractFactory("TicTacToe")
    const WalletFactory = await ethers.getContractFactory("Wallet")
    const TicTacProxyFactory = await ethers.getContractFactory("TicTacProxy")

    const Wallet = await WalletFactory.connect(signer).deploy([thisObject.owner.address, thisObject.alice.address], 2)
    await Wallet.deployed()
    thisObject.Wallet = Wallet

    const Implement = await upgrades.deployProxy(TicTacToeFactory.connect(signer) as ContractFactory, [Wallet.address], {
        initializer: "initialize",
        kind: "uups",
    })
    await Implement.deployed()
    thisObject.Implement = Implement

    const TicTacProxy = await TicTacProxyFactory.connect(signer).deploy(Implement.address)
    await TicTacProxy.deployed()
    thisObject.Proxy = TicTacProxy
}

export const gameArgs = {
    gameID: 0,
    days: 0,
    hours: 1,
    minutes: 0,
    x: [0, 1, 2],
    y: [0, 1, 2],
    percent: [0, 100],
    ether: "1",
    tokens: 100,
    comission: 5,
}

export const wallet = {
    tokens: [0],
}

export const ERC20Args = {
    name: "DogyCoin",
    symbol: "DGC",
    totalSupply: 200,
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
