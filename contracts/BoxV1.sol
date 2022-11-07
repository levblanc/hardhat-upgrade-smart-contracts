// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

contract BoxV1 {
    uint256 internal value;
    event ValueChanged(uint256 newValue);

    function store(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }

    function retrieve() public view returns (uint256 box1Value) {
        return value;
    }

    function version() public pure returns (uint256 box1Version) {
        return 1;
    }
}
