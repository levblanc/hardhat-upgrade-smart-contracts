// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// https://solidity-by-example.org/delegatecall/
// `delegatecall` is a low level function similar to `call`.
// When contract DelegateCall executes `delegatecall` to contract LogicContract, LogicContract's code is executed
// With contract DelegateCall's storage, `msg.sender` and `msg.value`.

// NOTE: Deploy this contract first
contract LogicContract {
    // NOTE: storage layout must be the same as contract DelegateCall
    // If NOT, variable assignment inside `setVar` function will MISMATCH
    uint public num;
    address public sender;
    uint public value;

    function setVars(uint _num) public payable {
        // Assign `_num` (user input) to storage slot [0]
        // which is variable `num` in this contract
        num = _num;
        // Assign `msg.sender` to storage slot [1]
        sender = msg.sender;
        // Assign `msg.value` to storage slot [2]
        value = msg.value;
    }
}

contract DelegateCall {
    // NOTE: variable type must be the same as LogicContract
    // If NOT, it will be type casted to the new type set here

    // storage slot [0]
    uint public num;
    // storage slot [1]
    address public sender;
    // storage slot [2]
    uint public value;

    function setVars(address _contract, uint _num) public payable {
        // DelegateCall's storage is set, LogicContract is not modified.
        // Because delegate call is "borrowing" functions from another contract
        // to update storage slots in it's own scope
        (bool success, bytes memory data) = _contract.delegatecall(
            abi.encodeWithSignature("setVars(uint256)", _num)
            // Following line does the same
            // Pros: no need to use string selector
            // Cons: can not use the `_contract` variable, have to use `LogicContract` contract name
            // abi.encodeWithSelector(LogicContract.setVars.selector, _num)
        );
    }
}
