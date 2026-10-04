// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSigWallet {

    // ── REENTRANCY GUARD
    uint256 private _guardStatus;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    modifier nonReentrant() {
        require(_guardStatus != _ENTERED, "Reentrant call detected");
        _guardStatus = _ENTERED;
        _;
        _guardStatus = _NOT_ENTERED;
    }

    // ── EVENTS 
    event Deposit(address indexed sender, uint256 amount);
    event TransactionProposed(uint256 indexed txId, address indexed proposer, address to, uint256 value, bytes data);
    event TransactionApproved(uint256 indexed txId, address indexed owner);
    event TransactionRevoked(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId, address indexed executor);

    // ── STATE 
    address[] public owners;
    uint256 public required; // threshold

    mapping(address => bool) public isOwner;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 approvalCount;
    }

    Transaction[] public transactions;

    // txId => owner => approved
    mapping(uint256 => mapping(address => bool)) public approved;

    // ── MODIFIERS 
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "Already executed");
        _;
    }

    modifier notApproved(uint256 txId) {
        require(!approved[txId][msg.sender], "Already approved");
        _;
    }

    // ── CONSTRUCTOR 
    constructor(address[] memory _owners, uint256 _required) {
        _guardStatus = _NOT_ENTERED; // initialize guard 

        require(_owners.length > 0, "At least one owner required");
        require(
            _required > 0 && _required <= _owners.length,
            "Invalid required count"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
        require(owner != address(0), "Invalid owner address");
        require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
    }

    // ── RECEIVE ETH 
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // ── PROPOSE 
    function propose(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external onlyOwner returns (uint256 txId) {
        require(_to != address(0), "Invalid target address");

        txId = transactions.length;

        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            approvalCount: 0
        }));

        emit TransactionProposed(txId, msg.sender, _to, _value, _data);
    }

    // ── APPROVE 
    function approve(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        notApproved(txId)
    {
        approved[txId][msg.sender] = true;
        transactions[txId].approvalCount += 1;

        emit TransactionApproved(txId, msg.sender);
    }

    // ── REVOKE 
    function revoke(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(approved[txId][msg.sender], "Not approved by you");

        approved[txId][msg.sender] = false;
        transactions[txId].approvalCount -= 1;

        emit TransactionRevoked(txId, msg.sender);
    }

    // ── EXECUTE 
    function execute(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        nonReentrant
    {
        require(
            transactions[txId].approvalCount >= required,
            "Not enough approvals"
        );

        Transaction storage txn = transactions[txId];
        txn.executed = true;

        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        require(success, "Transaction execution failed");

        emit TransactionExecuted(txId, msg.sender);
    }

    // ── VIEW FUNCTIONS 
    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransaction(uint256 txId) external view returns (
        address to,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 approvalCount
    ) {
        Transaction storage txn = transactions[txId];
        return (txn.to, txn.value, txn.data, txn.executed, txn.approvalCount);
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    function hasApproved(uint256 txId, address owner) external view returns (bool) {
        return approved[txId][owner];
    }
}