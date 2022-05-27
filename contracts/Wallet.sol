// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface MultisigWallet {
    event Deposit(address indexed sender, uint256 indexed amount);
    event DepositERC20(address indexed tokenAddress, uint256 indexed amount);
    event Approval(address indexed owner, uint256 indexed txId);
    event Submit(uint256 indexed txId);
    event Execute(uint256 indexed txId);

    function receiveERC20(address _tokenAddress, uint256 _value) external;

    function submit(address _to, uint256 _value) external;

    function submitERC20(
        address _to,
        uint256 _value,
        address tokenAddress
    ) external;

    function approve(uint256 _txId) external;

    function execute(uint256 _txId) external;

    function balance() external view returns (uint256);
}

/// @title MultisigWallet
/// @author Dampilov D.

contract Wallet is MultisigWallet {
    /// @dev Required count of owners
    uint256 public required;

    address[] public owners;
    Transaction[] public transactions;

    mapping(address => bool) isOwner;

    /// @dev If wanna withdraw ERC20 tokens
    mapping(uint256 => ERC20Tx) public tokenTx;
    mapping(uint256 => mapping(address => bool)) public approved;

    struct ERC20Tx {
        bool isERC20Tx;
        address tokenAddress;
    }

    struct Transaction {
        bool executed;
        address to;
        uint256 value;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExist(uint256 _txId) {
        require(_txId < transactions.length, "tx doesn't exist");
        _;
    }

    modifier notApproved(uint256 _txId) {
        require(!approved[_txId][msg.sender], "tx already approved");
        _;
    }

    modifier notExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "tx already executed");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required < _owners.length, "Invalid require number");

        required = _required;
        for (uint256 i; i < _owners.length; i++) {
            require(_owners[i] != address(0), "There is a null address");
            require(!isOwner[_owners[i]], "Not unique owners");

            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
        }
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function receiveERC20(address _tokenAddress, uint256 _value) external {
        emit DepositERC20(_tokenAddress, _value);
    }

    /// @notice Create transaction to withdraw ether funds
    function submit(address _to, uint256 _value) public onlyOwner {
        transactions.push(Transaction(false, _to, _value));
        emit Submit(transactions.length - 1);
    }

    /// @notice Create transaction to withdraw tokens funds
    function submitERC20(
        address _to,
        uint256 _value,
        address tokenAddress
    ) external onlyOwner {
        submit(_to, _value);
        tokenTx[transactions.length - 1] = ERC20Tx(true, tokenAddress);
    }

    /// @notice Approve transaction to withdraw funds
    function approve(uint256 _txId) external onlyOwner txExist(_txId) notApproved(_txId) notExecuted(_txId) {
        approved[_txId][msg.sender] = true;
        emit Approval(msg.sender, _txId);
    }

    /// @dev Count the number of approved owners by transaction
    function _getApprovalCount(uint256 _txId) private view returns (uint256 count) {
        for (uint256 i; i < owners.length; i++) {
            if (approved[_txId][owners[i]]) count++;
        }
    }

    /// @notice Try to execute a transaction
    function execute(uint256 _txId) external txExist(_txId) notExecuted(_txId) {
        require(_getApprovalCount(_txId) >= required, "Not approved");
        transactions[_txId].executed = true;

        if (tokenTx[_txId].isERC20Tx) {
            ERC20(tokenTx[_txId].tokenAddress).transfer(transactions[_txId].to, transactions[_txId].value);
        } else {
            (bool success, ) = transactions[_txId].to.call{value: transactions[_txId].value}("");
            require(success, "tx failed");
        }
        emit Execute(_txId);
    }

    /// @notice View ETH balance of wallet
    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}
