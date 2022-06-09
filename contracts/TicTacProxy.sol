// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title TicTac Proxy contract
/// @author Dampilov D.

contract TicTacProxy is ERC1967Proxy {
    constructor(address implementation) ERC1967Proxy(implementation, "") {}
}
