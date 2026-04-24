// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/ArcScan.sol";

/// @dev Mock ERC-20 USDC for testing
contract MockUSDC is IERC20 {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    function mint(address to, uint256 amount) external {
        balances[to] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowances[from][msg.sender] >= amount, "allowance");
        require(balances[from] >= amount, "balance");
        allowances[from][msg.sender] -= amount;
        balances[from] -= amount;
        balances[to] += amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balances[msg.sender] >= amount, "balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }
}

contract ArcScanTest is Test {
    ArcScan public arcScan;
    MockUSDC public usdc;

    address owner = address(this);
    address user1 = address(0x1001);
    address user2 = address(0x1002);
    address token = address(0xDEAD);

    function setUp() public {
        usdc = new MockUSDC();
        arcScan = new ArcScan(address(usdc));

        // Fund users
        usdc.mint(user1, 100e6); // 100 USDC
        usdc.mint(user2, 100e6);

        // Approve
        vm.prank(user1);
        usdc.approve(address(arcScan), type(uint256).max);
        vm.prank(user2);
        usdc.approve(address(arcScan), type(uint256).max);
    }

    // ─── SCAN TESTS ───────────────────────────────────────────────────────

    function testBasicScanFee() public {
        vm.prank(user1);
        uint256 scanId = arcScan.purchaseScan(token, ArcScan.ScanTier.Basic);

        ArcScan.ScanRecord memory r = arcScan.getScan(scanId);
        assertEq(r.feePaid, 0.50e6);
        assertEq(r.scanner, user1);
        assertEq(uint256(r.tier), 0);
    }

    function testProScanFee() public {
        vm.prank(user1);
        arcScan.purchaseScan(token, ArcScan.ScanTier.Pro);
        assertEq(usdc.balanceOf(address(arcScan)), 1.50e6);
    }

    function testDeepScanFee() public {
        vm.prank(user1);
        arcScan.purchaseScan(token, ArcScan.ScanTier.Deep);
        assertEq(usdc.balanceOf(address(arcScan)), 3.00e6);
    }

    function testScanCountIncrements() public {
        vm.startPrank(user1);
        arcScan.purchaseScan(token, ArcScan.ScanTier.Basic);
        arcScan.purchaseScan(token, ArcScan.ScanTier.Pro);
        vm.stopPrank();
        assertEq(arcScan.scanCount(), 2);
    }

    function testPostScanResult() public {
        vm.prank(user1);
        uint256 id = arcScan.purchaseScan(token, ArcScan.ScanTier.Basic);

        bytes32 hash = keccak256("ipfs://QmScanReport123");
        arcScan.postScanResult(id, hash);

        ArcScan.ScanRecord memory r = arcScan.getScan(id);
        assertEq(r.resultHash, hash);
    }

    function testOnlyOwnerCanPostResult() public {
        vm.prank(user1);
        uint256 id = arcScan.purchaseScan(token, ArcScan.ScanTier.Basic);

        vm.prank(user1);
        vm.expectRevert("ArcScan: not owner");
        arcScan.postScanResult(id, bytes32(0));
    }

    // ─── VOTE TESTS ───────────────────────────────────────────────────────

    function testCastBullishVote() public {
        vm.prank(user1);
        arcScan.castVote(token, ArcScan.VoteSignal.Bullish);

        (uint256 b,,, uint256 t) = arcScan.getVotes(token);
        assertEq(b, 1);
        assertEq(t, 1);
        assertEq(usdc.balanceOf(address(arcScan)), 0.25e6);
    }

    function testCannotVoteTwice() public {
        vm.startPrank(user1);
        arcScan.castVote(token, ArcScan.VoteSignal.Bullish);
        vm.expectRevert("ArcScan: already voted");
        arcScan.castVote(token, ArcScan.VoteSignal.Bearish);
        vm.stopPrank();
    }

    function testMultipleVoters() public {
        vm.prank(user1);
        arcScan.castVote(token, ArcScan.VoteSignal.Bullish);
        vm.prank(user2);
        arcScan.castVote(token, ArcScan.VoteSignal.Bearish);

        (uint256 b, uint256 bear,, uint256 t) = arcScan.getVotes(token);
        assertEq(b, 1);
        assertEq(bear, 1);
        assertEq(t, 2);
    }

    // ─── FEE TESTS ────────────────────────────────────────────────────────

    function testWithdrawFees() public {
        vm.prank(user1);
        arcScan.purchaseScan(token, ArcScan.ScanTier.Deep); // 3 USDC

        uint256 before = usdc.balanceOf(owner);
        arcScan.withdrawFees(owner);
        assertEq(usdc.balanceOf(owner), before + 3.00e6);
        assertEq(usdc.balanceOf(address(arcScan)), 0);
    }

    function testSetFees() public {
        arcScan.setFees(1e6, 2e6, 5e6, 0.5e6);
        assertEq(arcScan.basicScanFee(), 1e6);
        assertEq(arcScan.proScanFee(), 2e6);
        assertEq(arcScan.deepScanFee(), 5e6);
        assertEq(arcScan.voteFee(), 0.5e6);
    }
}
