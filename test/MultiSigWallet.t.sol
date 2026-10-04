// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MultiSigWallet.sol";

contract MultiSigWalletTest is Test {

    MultiSigWallet public wallet;

    address owner1 = address(0x1);
    address owner2 = address(0x2);
    address owner3 = address(0x3);
    address stranger = address(0x4);
    address recipient = address(0x5);

    address[] owners;
    uint256 required = 2;

    function setUp() public {
        owners.push(owner1);
        owners.push(owner2);
        owners.push(owner3);

        wallet = new MultiSigWallet(owners, required);

        // Fund the wallet with 10 ETH
        vm.deal(address(wallet), 10 ether);
    }

    // ── DEPLOYMENT TESTS 

    function test_OwnersSetCorrectly() public {
        address[] memory walletOwners = wallet.getOwners();
        assertEq(walletOwners.length, 3);
        assertEq(walletOwners[0], owner1);
        assertEq(walletOwners[1], owner2);
        assertEq(walletOwners[2], owner3);
    }

    function test_RequiredSetCorrectly() public {
        assertEq(wallet.required(), 2);
    }

    function test_IsOwnerSetCorrectly() public {
        assertTrue(wallet.isOwner(owner1));
        assertTrue(wallet.isOwner(owner2));
        assertTrue(wallet.isOwner(owner3));
        assertFalse(wallet.isOwner(stranger));
    }

    function test_RevertIf_NoOwners() public {
        address[] memory empty;
        vm.expectRevert("At least one owner required");
        new MultiSigWallet(empty, 0);
    }

    function test_RevertIf_RequiredZero() public {
        vm.expectRevert("Invalid required count");
        new MultiSigWallet(owners, 0);
    }

    function test_RevertIf_RequiredExceedsOwners() public {
        vm.expectRevert("Invalid required count");
        new MultiSigWallet(owners, 4);
    }

    function test_RevertIf_DuplicateOwner() public {
        address[] memory dupeOwners = new address[](2);
        dupeOwners[0] = owner1;
        dupeOwners[1] = owner1;
        vm.expectRevert("Duplicate owner");
        new MultiSigWallet(dupeOwners, 2);
    }

    // ── DEPOSIT TESTS 

    function test_ReceiveETH() public {
        vm.deal(stranger, 1 ether);
        vm.prank(stranger);
        (bool success, ) = address(wallet).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(wallet).balance, 11 ether);
    }

    // ── PROPOSE TESTS 

    function test_OwnerCanPropose() public {
        vm.prank(owner1);
        uint256 txId = wallet.propose(recipient, 1 ether, "");
        assertEq(txId, 0);
        assertEq(wallet.getTransactionCount(), 1);
    }

    function test_RevertIf_StrangerProposes() public {
        vm.prank(stranger);
        vm.expectRevert("Not an owner");
        wallet.propose(recipient, 1 ether, "");
    }

    function test_RevertIf_InvalidTarget() public {
        vm.prank(owner1);
        vm.expectRevert("Invalid target address");
        wallet.propose(address(0), 1 ether, "");
    }

    // ── APPROVE TESTS 

    function test_OwnerCanApprove() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner2);
        wallet.approve(0);

        assertTrue(wallet.hasApproved(0, owner2));
    }

    function test_RevertIf_StrangerApproves() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(stranger);
        vm.expectRevert("Not an owner");
        wallet.approve(0);
    }

    function test_RevertIf_DoubleApprove() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner2);
        wallet.approve(0);

        vm.prank(owner2);
        vm.expectRevert("Already approved");
        wallet.approve(0);
    }

    function test_RevertIf_ApprovNonExistentTx() public {
        vm.prank(owner1);
        vm.expectRevert("Transaction does not exist");
        wallet.approve(99);
    }

    // ── REVOKE TESTS 

    function test_OwnerCanRevoke() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner2);
        wallet.approve(0);

        vm.prank(owner2);
        wallet.revoke(0);

        assertFalse(wallet.hasApproved(0, owner2));
    }

    function test_RevertIf_RevokeWithoutApproving() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner2);
        vm.expectRevert("Not approved by you");
        wallet.revoke(0);
    }

    // ── EXECUTE TESTS 

    function test_ExecuteWithEnoughApprovals() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner1);
        wallet.approve(0);

        vm.prank(owner2);
        wallet.approve(0);

        uint256 balanceBefore = recipient.balance;

        vm.prank(owner3);
        wallet.execute(0);

        assertEq(recipient.balance, balanceBefore + 1 ether);

        (, , , bool executed, ) = wallet.getTransaction(0);
        assertTrue(executed);
    }

    function test_RevertIf_NotEnoughApprovals() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner1);
        wallet.approve(0);

        vm.prank(owner2);
        vm.expectRevert("Not enough approvals");
        wallet.execute(0);
    }

    function test_RevertIf_ExecuteAlreadyExecuted() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner1);
        wallet.approve(0);

        vm.prank(owner2);
        wallet.approve(0);

        vm.prank(owner3);
        wallet.execute(0);

        vm.prank(owner3);
        vm.expectRevert("Already executed");
        wallet.execute(0);
    }

    function test_RevertIf_StrangerExecutes() public {
        vm.prank(owner1);
        wallet.propose(recipient, 1 ether, "");

        vm.prank(owner1);
        wallet.approve(0);

        vm.prank(owner2);
        wallet.approve(0);

        vm.prank(stranger);
        vm.expectRevert("Not an owner");
        wallet.execute(0);
    }
}