import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { TicTacToe } from "./build/typechain"

declare module "mocha" {
    export interface Context {
        // SIGNERS
        signers: SignerWithAddress[]
        owner: SignerWithAddress
        alice: SignerWithAddress
        bob: SignerWithAddress
        carol: SignerWithAddress
        tema: SignerWithAddress
        misha: SignerWithAddress

        // CONTRACTS
        token1: TicTacToe
    }
}
