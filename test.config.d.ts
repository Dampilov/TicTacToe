import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { TicTacToe, Wallet, ERC20Mock, TicTacProxy } from "./build/typechain"
import { Contract } from "ethers"

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
        Wallet: Wallet
        ERC20: ERC20Mock
        Implementation: TicTacToe
        Proxy: TicTacProxy
        Implement: Contract
    }
}
