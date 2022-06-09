// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title TicTac Proxy contract
/// @author Dampilov D.

contract TicTacProxy is ERC1967Proxy {
    /// @notice The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    /// @notice The EIP-712 typehash for the permit struct used by the contract
    bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address participant,uint256 value,uint256 nonce,uint256 deadline)");
    uint256 permitNonce;
    uint256 public permitDeadline;
    bytes32 domainSeparator;

    uint256 gameId;
    uint256 public comission;
    address public wallet;

    mapping(uint256 => Game) public games;
    mapping(uint256 => bool) public isERC20Game;
    mapping(uint256 => mapping(address => bool)) canWithdraw;
    mapping(uint256 => SquareState[3][3]) public cells;

    /// @notice Sign for gamer, cross or zero
    mapping(address => mapping(uint256 => SquareState)) public sign;

    struct EIP712Domain {
        string name;
        uint256 chainId;
        address verifyingContract;
    }

    struct Permit {
        address participant;
        uint256 value;
        uint256 nonce;
        uint256 deadline;
    }

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
