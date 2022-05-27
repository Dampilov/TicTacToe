import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { TicTacToe, Wallet, ERC20Mock } from "./build/typechain"

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
        token2: ERC20Mock
        token3: Wallet
    }
}
