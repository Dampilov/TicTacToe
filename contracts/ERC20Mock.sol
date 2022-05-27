// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title A simple ERC20 contract
contract ERC20Mock is ERC20 {
    constructor(uint256 totalSupply_) ERC20("ERC20Mock", "ERC") {
        ERC20._mint(msg.sender, totalSupply_);
    }

    /**
     * @notice Return decimals ERC20 contract
     */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
