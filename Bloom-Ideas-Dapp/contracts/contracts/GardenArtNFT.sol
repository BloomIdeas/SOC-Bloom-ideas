// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Import OpenZeppelin Contracts
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @title GardenArtNFT
/// @notice A generative, on-chain fractal SVG NFT representing blooming project ideas with garden-themed visuals
contract GardenArtNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public tokenCounter;

    // --- Customization Constants ---
    uint256 public constant MAX_DEPTH = 5;
    uint256 public constant CANVAS_SIZE = 500;
    uint256 public constant BRANCH_WIDTH = 2;

    string[2] private _gardenColors = [
        "#228B22", // Forest Green
        "#6B8E23"  // Olive Drab
    ];

    struct TokenMetadata {
        string idea;
        string description;
        string minterName;
    }
    
    /// @dev Groups parameters for the recursive function to reduce stack usage.
    struct BranchParams {
        uint256 seed;
        uint256 x;
        uint256 y;
        int256 angle;
        uint256 length;
        uint256 depth;
    }

    mapping(uint256 => TokenMetadata) private _tokenMetadata;

    event ArtMinted(uint256 indexed tokenId, address indexed to, string idea, string minterName);

    constructor() ERC721("GardenArt", "GRDN") {
        tokenCounter = 0;
    }

    // --- Core Functions ---

    function mintArt(
        address to,
        string calldata idea,
        string calldata description,
        string calldata minterName
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(idea).length > 0, "Idea cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(minterName).length > 0, "Minter name cannot be empty");

        unchecked { tokenCounter++; }
        uint256 newTokenId = tokenCounter;
        _safeMint(to, newTokenId);
        _tokenMetadata[newTokenId] = TokenMetadata(idea, description, minterName);
        emit ArtMinted(newTokenId, to, idea, minterName);
        return newTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        TokenMetadata memory metadata = _tokenMetadata[tokenId];
        string memory svg = _generateSVG(tokenId);

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name":"', metadata.idea, ' #', tokenId.toString(),
                '","description":"', metadata.description,
                '","attributes":[{"trait_type":"Minter","value":"', metadata.minterName,
                '"}],"image":"data:image/svg+xml;base64,',
                Base64.encode(bytes(svg)),
                '"}'
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // --- SVG Generation Logic ---

    function _generateSVG(uint256 tokenId) internal view returns (string memory) {
        uint256 seed = uint256(keccak256(abi.encodePacked(tokenId)));

        string memory header = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ',
            CANVAS_SIZE.toString(), " ", CANVAS_SIZE.toString(),
            '"><rect width="100%" height="100%" fill="#F0F0F0"/>'
        ));
        
        string memory elements = _generateFractalBranch(
            BranchParams({
                seed: seed,
                x: CANVAS_SIZE / 2,
                y: CANVAS_SIZE,
                angle: -90,
                length: CANVAS_SIZE / 4,
                depth: 0
            })
        );

        return string(abi.encodePacked(header, elements, "</svg>"));
    }

    function _getBranchLine(string memory x1, string memory y1, string memory x2, string memory y2, uint256 seed) internal view returns (string memory) {
        uint256 colorIdx = uint256(keccak256(abi.encodePacked(seed, "branch_color"))) % 2;
        return string(abi.encodePacked(
            '<line x1="', x1, '" y1="', y1, '" x2="', x2, '" y2="', y2,
            '" stroke="', _gardenColors[colorIdx], '" stroke-width="', BRANCH_WIDTH.toString(), '"/>'
        ));
    }

    /// @dev Converts a signed integer to its string representation.
    function _toString(int256 value) internal pure returns (string memory) {
        if (value < 0) {
            return string(abi.encodePacked("-", uint256(-value).toString()));
        }
        return uint256(value).toString();
    }
    
    /// @dev The main recursive function to draw the fractal tree.
    /// This version is fixed to prevent "Stack too deep" errors by reducing local variables.
    function _generateFractalBranch(BranchParams memory params) internal view returns (string memory) {
        if (params.depth >= MAX_DEPTH || params.length < 2) return "";

        uint256 randomValue = uint256(keccak256(abi.encodePacked(params.seed, params.depth))) % 51;
        int256 randomAngle = params.angle + int256(randomValue) - 25;
        
        // Calculate displacement
        int256 dx = (int256(params.length) * 1000 * _cos(randomAngle)) / 1000;
        int256 dy = (int256(params.length) * 1000 * _sin(randomAngle)) / 1000;

        // Use signed integers for coordinate math
        int256 x2_signed = int256(params.x) + dx;
        int256 y2_signed = int256(params.y) - dy;
        
        uint256 newLength = params.length * 75 / 100;

        string memory childBranches = string(abi.encodePacked(
            _generateFractalBranch(BranchParams({
                seed: params.seed + 1,
                x: x2_signed < 0 ? 0 : uint256(x2_signed),
                y: y2_signed < 0 ? 0 : uint256(y2_signed),
                angle: randomAngle - 20,
                length: newLength,
                depth: params.depth + 1
            })),
            _generateFractalBranch(BranchParams({
                seed: params.seed + 2,
                x: x2_signed < 0 ? 0 : uint256(x2_signed),
                y: y2_signed < 0 ? 0 : uint256(y2_signed),
                angle: randomAngle + 20,
                length: newLength,
                depth: params.depth + 1
            }))
        ));
        
        return string(abi.encodePacked(
            _getBranchLine(
                params.x.toString(), 
                params.y.toString(), 
                _toString(x2_signed),
                _toString(y2_signed),
                params.seed
            ),
            childBranches
        ));
    }
    
    // --- Robust Trigonometry Helpers ---

    /// @dev Approximates cosine for an angle in the first quadrant (0-90 degrees), scaled by 1000.
    function _cosApprox(int256 angle) internal pure returns (int256) {
        // Uses a Taylor series approximation: cos(x) ≈ 1 - x^2/2
        int256 rad = angle * 314159 / 180; // Convert to radians, scaled by 100000
        int256 rad2 = (rad * rad) / 100000;
        return (100000 - rad2 / 2) / 100; // Returns result scaled by 1000
    }

    /// @dev Calculates cosine for any angle, scaled by 1000.
    function _cos(int256 angle) internal pure returns (int256) {
        int256 a = angle % 360;
        if (a < 0) a += 360;

        if (a > 270) return _cosApprox(360 - a);      // Q4: cos(a) = cos(360-a)
        if (a > 180) return -_cosApprox(a - 180);     // Q3: cos(a) = -cos(a-180)
        if (a > 90) return -_cosApprox(180 - a);      // Q2: cos(a) = -cos(180-a)
        return _cosApprox(a);                         // Q1
    }

    /// @dev Calculates sine for any angle using cosine. sin(a) = cos(90-a).
    function _sin(int256 angle) internal pure returns (int256) {
        return _cos(90 - angle);
    }
} 