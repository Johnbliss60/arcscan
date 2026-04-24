// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title ArcScan — Pay-to-scan token intelligence + onchain voting on Arc Network
/// @notice Users pay USDC to scan tokens and cast community votes
/// @dev USDC on Arc Testnet: 0x3600000000000000000000000000000000000000 (6 decimals via ERC-20)

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract ArcScan {
    // ─── USDC on Arc Testnet (6 decimals via ERC-20 interface) ───────────
    IERC20 public immutable USDC;

    // ─── OWNER ────────────────────────────────────────────────────────────
    address public owner;

    // ─── SCAN TIERS ───────────────────────────────────────────────────────
    // Prices in USDC with 6 decimals
    uint256 public basicScanFee   = 0.50e6;  // $0.50 USDC
    uint256 public proScanFee     = 1.50e6;  // $1.50 USDC
    uint256 public deepScanFee    = 3.00e6;  // $3.00 USDC

    // ─── VOTE FEE ─────────────────────────────────────────────────────────
    uint256 public voteFee = 0.25e6; // $0.25 USDC per vote

    // ─── ENUMS ────────────────────────────────────────────────────────────
    enum ScanTier { Basic, Pro, Deep }
    enum VoteSignal { Bullish, Bearish, Neutral }

    // ─── STRUCTS ──────────────────────────────────────────────────────────
    struct ScanRecord {
        address scanner;
        address tokenAddress;
        ScanTier tier;
        uint256 feePaid;     // USDC (6 decimals)
        uint256 timestamp;
        bytes32 resultHash;  // IPFS CID hash of scan report
    }

    struct TokenVotes {
        uint256 bullish;
        uint256 bearish;
        uint256 neutral;
        uint256 totalFees;   // total USDC collected from votes on this token
    }

    // ─── STATE ────────────────────────────────────────────────────────────
    mapping(uint256 => ScanRecord) public scans;
    uint256 public scanCount;

    // tokenAddress => TokenVotes
    mapping(address => TokenVotes) public tokenVotes;

    // voter => tokenAddress => has voted (one vote per token per wallet)
    mapping(address => mapping(address => bool)) public hasVoted;

    // total USDC collected by protocol
    uint256 public totalFeesCollected;

    // ─── EVENTS ───────────────────────────────────────────────────────────
    event ScanPurchased(
        uint256 indexed scanId,
        address indexed scanner,
        address indexed tokenAddress,
        ScanTier tier,
        uint256 feePaid,
        uint256 timestamp
    );

    event ScanResultPosted(
        uint256 indexed scanId,
        bytes32 resultHash
    );

    event VoteCast(
        address indexed voter,
        address indexed tokenAddress,
        VoteSignal signal,
        uint256 feePaid,
        uint256 timestamp
    );

    event FeesWithdrawn(address indexed to, uint256 amount);
    event FeesUpdated(uint256 basicFee, uint256 proFee, uint256 deepFee, uint256 voteFee);

    // ─── CONSTRUCTOR ──────────────────────────────────────────────────────
    constructor(address _usdc) {
        USDC = IERC20(_usdc);
        owner = msg.sender;
    }

    // ─── MODIFIERS ────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "ArcScan: not owner");
        _;
    }

    // ─── SCAN ─────────────────────────────────────────────────────────────

    /// @notice Purchase a scan for a token. Pays USDC from caller's wallet.
    /// @param tokenAddress The token contract to be scanned
    /// @param tier 0=Basic, 1=Pro, 2=Deep
    function purchaseScan(address tokenAddress, ScanTier tier) external returns (uint256 scanId) {
        require(tokenAddress != address(0), "ArcScan: zero address");

        uint256 fee = _tierFee(tier);

        // Pull USDC from caller — caller must approve this contract first
        bool ok = USDC.transferFrom(msg.sender, address(this), fee);
        require(ok, "ArcScan: USDC transfer failed");

        scanId = scanCount++;
        scans[scanId] = ScanRecord({
            scanner: msg.sender,
            tokenAddress: tokenAddress,
            tier: tier,
            feePaid: fee,
            timestamp: block.timestamp,
            resultHash: bytes32(0) // filled in after scan engine runs
        });

        totalFeesCollected += fee;

        emit ScanPurchased(scanId, msg.sender, tokenAddress, tier, fee, block.timestamp);
    }

    /// @notice Post scan result hash (owner/oracle only, e.g. your backend)
    function postScanResult(uint256 scanId, bytes32 resultHash) external onlyOwner {
        require(scanId < scanCount, "ArcScan: invalid scanId");
        scans[scanId].resultHash = resultHash;
        emit ScanResultPosted(scanId, resultHash);
    }

    // ─── VOTE ─────────────────────────────────────────────────────────────

    /// @notice Cast a community vote on a token. Costs 0.25 USDC.
    /// @param tokenAddress Token to vote on
    /// @param signal 0=Bullish, 1=Bearish, 2=Neutral
    function castVote(address tokenAddress, VoteSignal signal) external {
        require(tokenAddress != address(0), "ArcScan: zero address");
        require(!hasVoted[msg.sender][tokenAddress], "ArcScan: already voted");

        bool ok = USDC.transferFrom(msg.sender, address(this), voteFee);
        require(ok, "ArcScan: USDC transfer failed");

        hasVoted[msg.sender][tokenAddress] = true;
        tokenVotes[tokenAddress].totalFees += voteFee;
        totalFeesCollected += voteFee;

        if (signal == VoteSignal.Bullish) {
            tokenVotes[tokenAddress].bullish++;
        } else if (signal == VoteSignal.Bearish) {
            tokenVotes[tokenAddress].bearish++;
        } else {
            tokenVotes[tokenAddress].neutral++;
        }

        emit VoteCast(msg.sender, tokenAddress, signal, voteFee, block.timestamp);
    }

    // ─── VIEWS ────────────────────────────────────────────────────────────

    function getVotes(address tokenAddress) external view returns (
        uint256 bullish,
        uint256 bearish,
        uint256 neutral,
        uint256 total
    ) {
        TokenVotes memory v = tokenVotes[tokenAddress];
        bullish = v.bullish;
        bearish = v.bearish;
        neutral = v.neutral;
        total = v.bullish + v.bearish + v.neutral;
    }

    function getScan(uint256 scanId) external view returns (ScanRecord memory) {
        require(scanId < scanCount, "ArcScan: invalid scanId");
        return scans[scanId];
    }

    function tierFee(ScanTier tier) external view returns (uint256) {
        return _tierFee(tier);
    }

    // ─── OWNER ────────────────────────────────────────────────────────────

    /// @notice Withdraw collected USDC fees to owner wallet
    function withdrawFees(address to) external onlyOwner {
        uint256 bal = USDC.balanceOf(address(this));
        require(bal > 0, "ArcScan: nothing to withdraw");
        USDC.transfer(to, bal);
        emit FeesWithdrawn(to, bal);
    }

    /// @notice Update fee amounts
    function setFees(
        uint256 _basic,
        uint256 _pro,
        uint256 _deep,
        uint256 _vote
    ) external onlyOwner {
        basicScanFee = _basic;
        proScanFee   = _pro;
        deepScanFee  = _deep;
        voteFee      = _vote;
        emit FeesUpdated(_basic, _pro, _deep, _vote);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ArcScan: zero address");
        owner = newOwner;
    }

    // ─── INTERNAL ─────────────────────────────────────────────────────────
    function _tierFee(ScanTier tier) internal view returns (uint256) {
        if (tier == ScanTier.Basic) return basicScanFee;
        if (tier == ScanTier.Pro)   return proScanFee;
        return deepScanFee;
    }
}
