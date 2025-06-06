// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string name;
        string cid;
        string description;
        uint8 EncryptedFile;
        uint8 PublicView;
        address owner;
        uint256 timestamp;
    }

    File[] private files;

    function addFile( string memory _name, string memory _cid, string memory _description, uint8 _EncryptedFile, uint8 _PublicView) public {
        files.push(File({ name: _name, cid: _cid, description: _description, EncryptedFile: _EncryptedFile, PublicView: _PublicView, owner: msg.sender, timestamp: block.timestamp }));
    }

    function getAllFiles() public view returns (File[] memory) {
        return files;
    }
}
