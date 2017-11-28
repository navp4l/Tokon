pragma solidity ^0.4.17;

/* This contract is a Parent contract which encapsulates
   functionality related to ownership
*/   

// Demonstrates Inheritence

contract Owned {
    address public owner; //public member to hold to address of the contract owner

    //initialize contract with sender as the owner
    function Owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner); //requires that the executer be the owner of the contract
        _;
    }

    //Transfer ownership can only be executed by the contract owner
    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}