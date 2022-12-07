// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyTokenV2 is
    Initializable,
    ERC20Upgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    uint8 internal value;
    event ValueChanged(uint8 newValue);

    function initialize(uint8 initValue) public initializer {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, 1000 * 10 ** decimals());

        value = initValue;
        emit ValueChanged(value);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function increment() public {
        value = value + 1;
        emit ValueChanged(value);
    }

    function getValue() public view returns (uint8 tokenValue) {
        return value;
    }

    function version() public pure returns (uint8 tokenVersion) {
        return 2;
    }
}
