// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./Wallet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title TicTacToe contract
/// @author Dampilov D.

contract TicTacToe is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 gameId;
    uint256 commission;
    address public wallet;

    mapping(uint256 => Game) public games;
    mapping(uint256 => bool) public isERC20Game;
    mapping(uint256 => mapping(address => bool)) canWithdraw;
    mapping(uint256 => SquareState[3][3]) public cells;

    /// @notice Sign for gamer, cross or zero
    mapping(address => mapping(uint256 => SquareState)) public sign;

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

    event GameCreated(uint256 indexed _gameId, address indexed owner, uint256 indexed waitingTime, uint256 createdTime, uint256 betSize);
    event JoinedToGame(uint256 indexed _gameId, address indexed joined, uint256 timeOfJoin, uint256 indexed betSize);
    event MoveMade(uint256 indexed _gameId, address indexed whoMoved, uint256 x, uint256 y, uint256 indexed timeOfMove);
    event GameResult(uint256 indexed _gameId, SquareState indexed winner, address indexed winnerAddress, uint256 finishedTime);
    event Withdraw(uint256 indexed _gameId, address indexed recipient, uint256 indexed count);

    /// @dev Game should be free
    modifier GameIsFree(uint256 _gameId) {
        require(games[_gameId].state == GameState.free, "Not free game");
        _;
    }

    /// @dev Already playing the game
    modifier GameIsStarted(uint256 _gameId) {
        require(games[_gameId].state == GameState.playing, "Don't being played");
        _;
    }

    modifier GameIsFinished(uint256 _gameId) {
        require(games[_gameId].state == GameState.finished, "Unauthorized access");
        _;
    }

    modifier onlyPlayer(uint256 _gameId) {
        require(msg.sender == games[_gameId].owner || msg.sender == games[_gameId].rival, "Not your game");
        _;
    }

    modifier GameExist(uint256 _gameId) {
        require(_gameId < gameId, "Game not exist");
        _;
    }

    /// @dev Function instead of constructor
    function initialize(address _walletAddress) external initializer {
        gameId = 0;
        commission = 5;
        wallet = _walletAddress;
        /// @dev Initialize owner, whos can upgrade this contract
        __Ownable_init();
    }

    function changeCommision(uint256 _newCommision) external onlyOwner {
        commission = _newCommision;
    }

    /// @notice Create new game from ether
    /// @param _days, _hours, _minutes - move waiting time
    function createGameFromEth(
        uint8 _days,
        uint8 _hours,
        uint8 _minutes
    ) external payable {
        require(_days + _hours + _minutes > 0, "Time not set");
        (bool success, ) = address(wallet).call{value: (msg.value * commission) / 100}("");
        require(success, "Failed to send Ether");
        _createGame(_days, _hours, _minutes, msg.value);
    }

    /// @notice Create new game from ERC20 tokens
    /// @param _days, _hours, _minutes - move waiting time
    function createGamefromERC20(
        address _token,
        uint64 _days,
        uint64 _hours,
        uint64 _minutes,
        uint256 _betAmount
    ) external {
        require(_days + _hours + _minutes > 0, "Time not set");
        ERC20(_token).transferFrom(msg.sender, address(this), _betAmount);
        ERC20(_token).transfer(address(wallet), (_betAmount * commission) / 100);
        MultisigWallet(wallet).receiveERC20(_token, _betAmount);
        isERC20Game[gameId] = true;
        _createGame(_days, _hours, _minutes, _betAmount);
    }

    /// @notice Join free game from ether
    function joinGameFromEth(uint256 _gameId) external payable GameIsFree(_gameId) GameExist(_gameId) {
        require(msg.sender != games[_gameId].owner, "Can't play with yourself");
        require(msg.value == games[_gameId].betSize, "Not correct bet size");

        (bool success, ) = address(wallet).call{value: (msg.value * commission) / 100}("");
        require(success, "Failed to send Ether");
        _joinGame(_gameId);
    }

    /// @notice Join free game from ERC20 tokens
    function joinGameFromERC20(uint256 _gameId, address _token) external GameIsFree(_gameId) GameExist(_gameId) {
        require(msg.sender != games[_gameId].owner, "Can't play with yourself");
        require(isERC20Game[_gameId], "Bet by ether");

        ERC20(_token).transferFrom(msg.sender, address(this), games[_gameId].betSize);
        ERC20(_token).transfer(address(wallet), (games[_gameId].betSize * commission) / 100);
        MultisigWallet(wallet).receiveERC20(_token, games[_gameId].betSize);
        _joinGame(_gameId);
    }

    /// @notice Make a move
    /// @param _x, _y - coordinates where you want to put your sign
    function step(
        uint256 _gameId,
        uint8 _x,
        uint8 _y
    ) external GameIsStarted(_gameId) onlyPlayer(_gameId) {
        require(block.timestamp <= games[_gameId].waitingTime + games[_gameId].lastActiveTime, "Move time over");
        require(cells[_gameId][_x][_y] == SquareState.free, "Square not free");
        require(_x < 3 && _y < 3, "Not correct position");
        require((games[_gameId].isCrossMove && sign[msg.sender][_gameId] == SquareState.cross) || (!games[_gameId].isCrossMove && sign[msg.sender][_gameId] == SquareState.zero), "Not your move");

        cells[_gameId][_x][_y] = sign[msg.sender][_gameId];
        games[_gameId].isCrossMove = !games[_gameId].isCrossMove;
        games[_gameId].lastActiveTime = block.timestamp;
        emit MoveMade(_gameId, msg.sender, _x, _y, block.timestamp);
        SquareState gameWinner = _checkEndGame(cells[_gameId], sign[msg.sender][_gameId], _x, _y);
        /// @dev If game is over
        if (gameWinner != SquareState.free) {
            _finishGame(_gameId, gameWinner);
        }
    }

    /// @notice Checking if the turn time has expired
    /// @dev If the time is up then the game is over
    function checkGameTime(uint256 _gameId) external {
        if (block.timestamp > games[_gameId].waitingTime + games[_gameId].lastActiveTime) {
            if (games[_gameId].isCrossMove) {
                /// @dev Zero won
                _finishGame(_gameId, SquareState.zero);
            } else {
                /// @dev Cross won
                _finishGame(_gameId, SquareState.cross);
            }
        }
    }

    /// @notice Withdraw ethers, if you won or game end in draw
    function withdrawETH(uint256 _gameId) external GameIsFinished(_gameId) onlyPlayer(_gameId) {
        require(canWithdraw[_gameId][msg.sender], "Can't withdraw");
        require(!isERC20Game[_gameId], "Bet by tokens");
        uint256 withdrawCount;
        delete canWithdraw[_gameId][msg.sender];
        if (games[_gameId].winner == SquareState.draw) {
            withdrawCount = (games[_gameId].betSize * (100 - commission)) / 100;
            payable(msg.sender).transfer(withdrawCount);
            emit Withdraw(_gameId, msg.sender, withdrawCount);
        }
        if (games[_gameId].winner == sign[msg.sender][_gameId]) {
            withdrawCount = (2 * games[_gameId].betSize * (100 - commission)) / 100;
            payable(msg.sender).transfer(withdrawCount);
            emit Withdraw(_gameId, msg.sender, withdrawCount * 2);
        }
    }

    /// @notice Withdraw ERC20 tokens, if you won or game end in draw
    function withdrawERC20(uint256 _gameId, address token) external GameIsFinished(_gameId) onlyPlayer(_gameId) {
        require(isERC20Game[_gameId], "Bet by ether");
        require(canWithdraw[_gameId][msg.sender], "Can't withdraw");
        uint256 withdrawCount;
        withdrawCount = (games[_gameId].betSize * (100 - commission)) / 100;
        delete canWithdraw[_gameId][msg.sender];
        if (games[_gameId].winner == SquareState.draw) {
            ERC20(token).transfer(msg.sender, withdrawCount);
            emit Withdraw(_gameId, msg.sender, withdrawCount);
        }
        if (games[_gameId].winner == sign[msg.sender][_gameId]) {
            ERC20(token).transfer(msg.sender, withdrawCount * 2);
            emit Withdraw(_gameId, msg.sender, withdrawCount * 2);
        }
    }

    /// @return freeGamesList - List of free games
    function freeGames() external view returns (Game[] memory freeGamesList) {
        /// @dev Number of free games
        (uint256 gameCount, ) = _getGamesByFilter(GameState.free, SquareState.free, address(0));
        freeGamesList = new Game[](gameCount);
        uint256 counter;
        for (uint256 i; i < gameId; i++) {
            if (games[i].state == GameState.free) {
                freeGamesList[counter] = games[i];
                counter++;
            }
        }
    }

    /// @return Percentage of games ending in a draw
    function getDrawGameStatistic() external view returns (uint256) {
        /// @dev Numbers of finished and ending in a draw games
        (uint256 gameCount, uint256 signCount) = _getGamesByFilter(GameState.finished, SquareState.draw, address(0));
        return gameCount > 0 ? (signCount * 100) / gameCount : 0;
    }

    /// @return Percentage of games where the cross wins
    function getCrossGameStatistic() external view returns (uint256) {
        /// @dev Numbers of finished and the cross wins games
        (uint256 gameCount, uint256 signCount) = _getGamesByFilter(GameState.finished, SquareState.cross, address(0));
        return gameCount > 0 ? (signCount * 100) / gameCount : 0;
    }

    /// @return Percentage of games where the zero wins
    function getZeroGameStatistic() external view returns (uint256) {
        /// @dev Numbers of finished and the zero wins games
        (uint256 gameCount, uint256 signCount) = _getGamesByFilter(GameState.finished, SquareState.zero, address(0));
        return gameCount > 0 ? (signCount * 100) / gameCount : 0;
    }

    /// @param _gamer - address of player
    /// @return Percentage of games where the player wins
    function getStatisticByAddress(address _gamer) external view returns (uint256) {
        /// @dev Numbers of finished and the player wins games
        (uint256 gameCount, uint256 signCount) = _getGamesByFilter(GameState.finished, SquareState.free, _gamer);
        return gameCount > 0 ? (signCount * 100) / gameCount : 0;
    }

    /// @return cell - game board, three by three matrix
    function getCell(uint256 _gameId) external view returns (uint8[3][3] memory cell) {
        for (uint256 i; i < 3; i++) {
            for (uint256 j; j < 3; j++) {
                if (cells[_gameId][i][j] == SquareState.free) cell[i][j] = 0;
                if (cells[_gameId][i][j] == SquareState.cross) cell[i][j] = 1;
                if (cells[_gameId][i][j] == SquareState.zero) cell[i][j] = 2;
            }
        }
    }

    /// @dev Join player to some free game
    function _joinGame(uint256 _gameId) internal {
        games[_gameId].rival = msg.sender;
        sign[msg.sender][_gameId] = SquareState.zero;
        games[_gameId].state = GameState.playing;
        games[_gameId].lastActiveTime = block.timestamp;
        emit JoinedToGame(_gameId, msg.sender, block.timestamp, games[_gameId].betSize);
    }

    /// @dev Finish game, and determine the winner
    function _finishGame(uint256 _gameId, SquareState winner) internal {
        games[_gameId].state = GameState.finished;
        games[_gameId].winner = winner;
        if (winner == SquareState.draw) {
            canWithdraw[_gameId][games[_gameId].owner] = true;
            canWithdraw[_gameId][games[_gameId].rival] = true;
            emit GameResult(_gameId, winner, address(0), block.timestamp);
        } else {
            if (winner == SquareState.cross) {
                canWithdraw[_gameId][games[_gameId].owner] = true;
                emit GameResult(_gameId, winner, games[_gameId].owner, block.timestamp);
            } else {
                canWithdraw[_gameId][games[_gameId].rival] = true;
                emit GameResult(_gameId, winner, games[_gameId].rival, block.timestamp);
            }
        }
    }

    /// @dev Get number of all games and number of games where the corresponding sign won
    function _getGamesByFilter(
        GameState _state,
        SquareState _sign,
        address _gamer
    ) internal view returns (uint256 gameCount, uint256 signCount) {
        for (uint256 i; i < gameId; i++) {
            if (games[i].state == _state) {
                gameCount++;
                if (games[i].winner == _sign || games[i].winner == sign[_gamer][i]) signCount++;
            }
        }
    }

    /// @dev Create new game
    function _createGame(
        uint64 _days,
        uint64 _hours,
        uint64 _minutes,
        uint256 betAmount
    ) internal {
        games[gameId] = Game(gameId, (_days * 1 days) + (_hours * 1 hours) + (_minutes * 1 minutes), block.timestamp, betAmount, msg.sender, address(0), true, SquareState.free, GameState.free);
        sign[msg.sender][gameId] = SquareState.cross;
        emit GameCreated(gameId, msg.sender, games[gameId].waitingTime, block.timestamp, betAmount);
        gameId++;
    }

    /// @dev Checking if the game is over
    /// @param _x, _y - coordinates where you want to put your sign
    /**
     @return If game is not over, return SquareState.free.
     If someone won, return his sign.
     If game over in draw, return SquareState.draw
     */
    function _checkEndGame(
        SquareState[3][3] memory _cells,
        SquareState _sign,
        uint8 _x,
        uint8 _y
    ) internal pure returns (SquareState) {
        bool[5] memory isNotLine;

        for (uint8 i; i < 3; i++) {
            /// @dev Horizontal check
            if (_cells[_x][i] != _sign) {
                isNotLine[0] = true;
            }
            /// @dev Vertical check
            if (_cells[i][_y] != _sign) {
                isNotLine[1] = true;
            }
            /// @dev Diagonals check
            if (_cells[i][i] != _sign) {
                isNotLine[2] = true;
            }
            if (_cells[i][2 - i] != _sign) {
                isNotLine[3] = true;
            }
            /// @dev Checking for a draw
            for (uint8 j; j < 3; j++) {
                if (_cells[i][j] == SquareState.free) isNotLine[4] = true;
            }
        }
        if (!isNotLine[0] || !isNotLine[1] || !isNotLine[2] || !isNotLine[3]) return _sign;
        if (!isNotLine[4]) return SquareState.draw;
        return SquareState.free;
    }

    /// @dev Turn on upgradeble of this contract
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
