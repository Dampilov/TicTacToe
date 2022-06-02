// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./TicTacToe.sol";

/// @title TicTacToe contract
/// @author Dampilov D.

contract TicTacToeV2 is TicTacToe {
    /// @notice Get current version of implementation
    function currentVersion() external pure returns (string memory) {
        return "v2.0";
    }
}
