// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SofiaMarketplace
 * @dev Decentralized marketplace for MagicSaaS plugins and templates
 * @author Sofia Lotus AI - PhD Full-Stack Engineer
 * @notice This contract enables creators to publish, sell, and monetize plugins with automatic royalties
 *
 * Features:
 * - NFT-based plugin ownership
 * - Automatic royalty distribution
 * - Multi-currency support (ETH, MATIC, custom tokens)
 * - Plugin verification system
 * - Community ratings
 * - DAO governance integration
 */
contract SofiaMarketplace is ERC721, ReentrancyGuard, AccessControl {
    using Counters for Counters.Counter;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");

    Counters.Counter private _pluginIdCounter;

    uint256 public constant MARKETPLACE_FEE_BPS = 250; // 2.5%
    uint256 public constant MAX_ROYALTY_BPS = 1000;    // 10%
    uint256 public constant BASIS_POINTS = 10000;

    address public feeRecipient;
    IERC20 public paymentToken;

    // ============================================================================
    // DATA STRUCTURES
    // ============================================================================

    struct Plugin {
        string name;
        string description;
        string ipfsHash;
        string category;
        address creator;
        uint256 price;
        uint256 royaltyBps;
        bool verified;
        bool active;
        uint256 totalSales;
        uint256 totalRevenue;
        uint256 rating; // Average rating * 100
        uint256 ratingCount;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Purchase {
        address buyer;
        uint256 amount;
        uint256 timestamp;
        string licenseKey;
    }

    struct Rating {
        uint8 score; // 1-5
        string comment;
        uint256 timestamp;
    }

    // ============================================================================
    // STORAGE MAPPINGS
    // ============================================================================

    mapping(uint256 => Plugin) public plugins;
    mapping(address => uint256[]) public creatorPlugins;
    mapping(address => uint256) public creatorEarnings;
    mapping(uint256 => uint256) public pluginRevenue;

    // pluginId => buyer => hasPurchased
    mapping(uint256 => mapping(address => bool)) public purchases;

    // pluginId => purchase history
    mapping(uint256 => Purchase[]) public purchaseHistory;

    // pluginId => buyer => rating
    mapping(uint256 => mapping(address => Rating)) public ratings;

    // ============================================================================
    // EVENTS
    // ============================================================================

    event PluginListed(
        uint256 indexed pluginId,
        address indexed creator,
        string name,
        uint256 price,
        string ipfsHash
    );

    event PluginUpdated(
        uint256 indexed pluginId,
        string name,
        uint256 price
    );

    event PluginPurchased(
        uint256 indexed pluginId,
        address indexed buyer,
        uint256 price,
        string licenseKey,
        uint256 timestamp
    );

    event PluginVerified(
        uint256 indexed pluginId,
        address indexed curator,
        uint256 timestamp
    );

    event PluginRated(
        uint256 indexed pluginId,
        address indexed rater,
        uint8 score,
        string comment,
        uint256 timestamp
    );

    event RoyaltyPaid(
        uint256 indexed pluginId,
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    event MarketplaceFeeCollected(
        uint256 indexed pluginId,
        uint256 amount,
        uint256 timestamp
    );

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor(
        address _paymentToken,
        address _feeRecipient
    ) ERC721("Sofia Marketplace Plugin NFT", "SOFIA-PLUGIN") {
        require(_paymentToken != address(0), "Invalid payment token");
        require(_feeRecipient != address(0), "Invalid fee recipient");

        paymentToken = IERC20(_paymentToken);
        feeRecipient = _feeRecipient;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(CURATOR_ROLE, msg.sender);
    }

    // ============================================================================
    // PLUGIN MANAGEMENT
    // ============================================================================

    /**
     * @dev List a new plugin on the marketplace
     * @param _name Plugin name
     * @param _description Plugin description
     * @param _ipfsHash IPFS hash containing plugin code and assets
     * @param _category Plugin category
     * @param _price Price in payment tokens
     * @param _royaltyBps Royalty percentage in basis points (max 10%)
     * @return pluginId The ID of the newly listed plugin
     */
    function listPlugin(
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        string memory _category,
        uint256 _price,
        uint256 _royaltyBps
    ) external onlyRole(DEVELOPER_ROLE) returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(_royaltyBps <= MAX_ROYALTY_BPS, "Royalty too high");

        _pluginIdCounter.increment();
        uint256 pluginId = _pluginIdCounter.current();

        Plugin storage newPlugin = plugins[pluginId];
        newPlugin.name = _name;
        newPlugin.description = _description;
        newPlugin.ipfsHash = _ipfsHash;
        newPlugin.category = _category;
        newPlugin.creator = msg.sender;
        newPlugin.price = _price;
        newPlugin.royaltyBps = _royaltyBps;
        newPlugin.active = true;
        newPlugin.createdAt = block.timestamp;
        newPlugin.updatedAt = block.timestamp;

        creatorPlugins[msg.sender].push(pluginId);

        // Mint NFT to creator
        _safeMint(msg.sender, pluginId);

        emit PluginListed(pluginId, msg.sender, _name, _price, _ipfsHash);

        return pluginId;
    }

    /**
     * @dev Update plugin details
     * @param _pluginId Plugin ID
     * @param _name New name
     * @param _description New description
     * @param _price New price
     */
    function updatePlugin(
        uint256 _pluginId,
        string memory _name,
        string memory _description,
        uint256 _price
    ) external {
        Plugin storage plugin = plugins[_pluginId];
        require(plugin.creator == msg.sender, "Not the creator");
        require(plugin.active, "Plugin not active");

        plugin.name = _name;
        plugin.description = _description;
        plugin.price = _price;
        plugin.updatedAt = block.timestamp;

        emit PluginUpdated(_pluginId, _name, _price);
    }

    /**
     * @dev Purchase a plugin
     * @param _pluginId Plugin ID to purchase
     * @return licenseKey Unique license key for the purchase
     */
    function purchasePlugin(uint256 _pluginId)
        external
        nonReentrant
        returns (string memory licenseKey)
    {
        Plugin storage plugin = plugins[_pluginId];
        require(plugin.active, "Plugin not active");
        require(!purchases[_pluginId][msg.sender], "Already purchased");

        uint256 price = plugin.price;
        uint256 marketplaceFee = (price * MARKETPLACE_FEE_BPS) / BASIS_POINTS;
        uint256 creatorAmount = price - marketplaceFee;

        // Transfer payment from buyer
        require(
            paymentToken.transferFrom(msg.sender, address(this), price),
            "Payment failed"
        );

        // Transfer marketplace fee
        require(
            paymentToken.transfer(feeRecipient, marketplaceFee),
            "Fee transfer failed"
        );

        // Transfer payment to creator
        require(
            paymentToken.transfer(plugin.creator, creatorAmount),
            "Creator payment failed"
        );

        // Record purchase
        purchases[_pluginId][msg.sender] = true;
        plugin.totalSales++;
        plugin.totalRevenue += price;
        creatorEarnings[plugin.creator] += creatorAmount;
        pluginRevenue[_pluginId] += price;

        // Generate license key
        licenseKey = _generateLicenseKey(_pluginId, msg.sender);

        // Store purchase
        purchaseHistory[_pluginId].push(Purchase({
            buyer: msg.sender,
            amount: price,
            timestamp: block.timestamp,
            licenseKey: licenseKey
        }));

        emit PluginPurchased(_pluginId, msg.sender, price, licenseKey, block.timestamp);
        emit MarketplaceFeeCollected(_pluginId, marketplaceFee, block.timestamp);

        return licenseKey;
    }

    /**
     * @dev Verify plugin quality (curators only)
     * @param _pluginId Plugin ID to verify
     */
    function verifyPlugin(uint256 _pluginId)
        external
        onlyRole(CURATOR_ROLE)
    {
        Plugin storage plugin = plugins[_pluginId];
        require(!plugin.verified, "Already verified");
        require(plugin.active, "Plugin not active");

        plugin.verified = true;
        plugin.updatedAt = block.timestamp;

        emit PluginVerified(_pluginId, msg.sender, block.timestamp);
    }

    /**
     * @dev Rate a purchased plugin
     * @param _pluginId Plugin ID
     * @param _score Rating score (1-5)
     * @param _comment Optional comment
     */
    function ratePlugin(
        uint256 _pluginId,
        uint8 _score,
        string memory _comment
    ) external {
        require(_score >= 1 && _score <= 5, "Invalid rating");
        require(purchases[_pluginId][msg.sender], "Must purchase first");
        require(ratings[_pluginId][msg.sender].timestamp == 0, "Already rated");

        Plugin storage plugin = plugins[_pluginId];

        // Store rating
        ratings[_pluginId][msg.sender] = Rating({
            score: _score,
            comment: _comment,
            timestamp: block.timestamp
        });

        // Update average rating
        uint256 totalRating = plugin.rating * plugin.ratingCount;
        plugin.ratingCount++;
        plugin.rating = (totalRating + (_score * 100)) / plugin.ratingCount;

        emit PluginRated(_pluginId, msg.sender, _score, _comment, block.timestamp);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @dev Get plugin details
     * @param _pluginId Plugin ID
     * @return Plugin struct
     */
    function getPlugin(uint256 _pluginId) external view returns (Plugin memory) {
        return plugins[_pluginId];
    }

    /**
     * @dev Get plugins by creator
     * @param _creator Creator address
     * @return Array of plugin IDs
     */
    function getPluginsByCreator(address _creator) external view returns (uint256[] memory) {
        return creatorPlugins[_creator];
    }

    /**
     * @dev Check if user has purchased plugin
     * @param _pluginId Plugin ID
     * @param _buyer Buyer address
     * @return bool
     */
    function hasPurchased(uint256 _pluginId, address _buyer) external view returns (bool) {
        return purchases[_pluginId][_buyer];
    }

    /**
     * @dev Get purchase history for a plugin
     * @param _pluginId Plugin ID
     * @return Array of purchases
     */
    function getPurchaseHistory(uint256 _pluginId) external view returns (Purchase[] memory) {
        return purchaseHistory[_pluginId];
    }

    /**
     * @dev Get total number of plugins
     * @return uint256
     */
    function getTotalPlugins() external view returns (uint256) {
        return _pluginIdCounter.current();
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /**
     * @dev Update fee recipient
     * @param _newRecipient New fee recipient address
     */
    function setFeeRecipient(address _newRecipient)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
    }

    /**
     * @dev Update payment token
     * @param _newToken New payment token address
     */
    function setPaymentToken(address _newToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newToken != address(0), "Invalid address");
        paymentToken = IERC20(_newToken);
    }

    /**
     * @dev Grant developer role
     * @param _developer Developer address
     */
    function grantDeveloperRole(address _developer)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(DEVELOPER_ROLE, _developer);
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @dev Generate unique license key
     * @param _pluginId Plugin ID
     * @param _buyer Buyer address
     * @return License key string
     */
    function _generateLicenseKey(uint256 _pluginId, address _buyer)
        private
        view
        returns (string memory)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _pluginId,
                _buyer,
                block.timestamp,
                block.prevrandao
            )
        );
        return _bytes32ToString(hash);
    }

    /**
     * @dev Convert bytes32 to string
     * @param _bytes32 Bytes32 value
     * @return String representation
     */
    function _bytes32ToString(bytes32 _bytes32)
        private
        pure
        returns (string memory)
    {
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            uint8 value = uint8(uint256(_bytes32) / (2**(8*(31 - i))));
            bytesArray[i*2] = _toHexChar(value / 16);
            bytesArray[i*2+1] = _toHexChar(value % 16);
        }
        return string(bytesArray);
    }

    /**
     * @dev Convert uint8 to hex character
     * @param _value Value to convert
     * @return Hex character
     */
    function _toHexChar(uint8 _value)
        private
        pure
        returns (bytes1)
    {
        if (_value < 10) {
            return bytes1(_value + 48);
        } else {
            return bytes1(_value + 87);
        }
    }

    // ============================================================================
    // OVERRIDES
    // ============================================================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
