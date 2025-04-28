// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CentralizedIdentityReputation {

    struct UserProfile {
        address userAddress;
        string username;
        uint reputation;
        bool allowPublicView;
    }

    mapping(string => UserProfile) private usernameToProfile;
    mapping(address => string) private addressToUsername;

    event ProfileUpdated(address indexed user, string username, uint reputation, bool allowPublicView);



    function createOrUpdateProfile(string memory _username, bool _allowPublicView) public {
        // If first time creating
        if (bytes(addressToUsername[msg.sender]).length == 0) {
            addressToUsername[msg.sender] = _username;
            usernameToProfile[_username] = UserProfile(msg.sender, _username, 1, _allowPublicView);
        } else {
            string memory oldUsername = addressToUsername[msg.sender];
            if (keccak256(bytes(oldUsername)) != keccak256(bytes(_username))) {
                revert("Username change not allowed");
            }
            UserProfile storage profile = usernameToProfile[_username];
            profile.allowPublicView = _allowPublicView;
        }

        emit ProfileUpdated(msg.sender, _username, usernameToProfile[_username].reputation, _allowPublicView);
    }

    function increaseReputation(string memory _username) public {
        require(usernameExists(_username), "Username does not exist");
        usernameToProfile[_username].reputation += 1;
        emit ProfileUpdated(
            usernameToProfile[_username].userAddress,
            _username,
            usernameToProfile[_username].reputation,
            usernameToProfile[_username].allowPublicView
        );
    }

    function getProfile(string memory _username) public view returns (string memory, uint, bool) {
        require(usernameExists(_username), "Username does not exist");
        
        UserProfile memory profile = usernameToProfile[_username];
        
        if (profile.allowPublicView || profile.userAddress == msg.sender) {
            return (profile.username, profile.reputation, profile.allowPublicView);
        } else {
            revert("Private profile");
        }
    }

    function usernameExists(string memory _username) internal view returns (bool) {
        return usernameToProfile[_username].userAddress != address(0);
    }
}
