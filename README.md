# 🏆 AI-Assisted Web3 Identity Reputation System

## 💡 Overview
This project demonstrates an innovative use of AI prompts to develop a centralized identity reputation system on the RSK blockchain. The system allows users to:
- Create/update profiles with usernames
- Manage reputation scores
- Control profile visibility
- All through an Express.js API interface
- Deployed Contract https://explorer.testnet.rootstock.io/address/0x835f882a9de2897b70b6b856049b68d54c53f3a7
## 🛠️ AI Prompt Engineering Highlights

### 📝 Generate Solidity Smart Contract
**Prompt:**  
"Create a Solidity smart contract for a centralized identity reputation system with:
1. User profiles containing username, reputation score, and visibility setting
2. Functions to create/update profiles
3. Ability to increment reputation
4. View controls for public/private profiles
5. Include proper event emissions
6. Use best practices for security and gas optimization"

**AI Model Used:** GPT-4  
**Use Case:** Generated the core smart contract logic for the reputation system  

**Best Practices/Insights:**  
- Specifying data structures (mappings) improved efficiency
- Explicit event requirements ensured proper blockchain transparency
- Security checks were automatically included in the generated code

**Example Output:**  
```solidity
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
```
