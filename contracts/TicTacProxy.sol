// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title TicTac Proxy contract
/// @author Dampilov D.

contract TicTacProxy is ERC1967Proxy {
    uint256 gameId;
    uint256 commission;
    address wallet;

    mapping(uint256 => Game) games;
    mapping(uint256 => bool) isERC20Game;
    mapping(uint256 => mapping(address => bool)) canWithdraw;
    mapping(uint256 => SquareState[3][3]) cells;

    /// @notice Sign for gamer, cross or zero
    mapping(address => mapping(uint256 => SquareState)) sign;

    enum GameState {
        free,
        playing,
        finished
    }

    /// @dev Conditions for cells
    enum SquareState {
        free,
        cross,
        zero,
        draw
    }

    /// @dev isCrossMove - switch to determine the current move
    /// @dev winner - sign of the winner, or draw if ended in a draw
    struct Game {
        uint256 id;
        uint256 waitingTime;
        uint256 lastActiveTime;
        uint256 betSize;
        address owner;
        address rival;
        bool isCrossMove;
        SquareState winner;
        GameState state;
    }

    constructor(address implementation) ERC1967Proxy(implementation, "") {}

    function getImplementation() external view returns (address) {
        return _implementation();
    }
}
