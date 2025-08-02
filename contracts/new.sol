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

    function getAllFiles() public view returns (File[] memory) {
        return files;
    }

    event FileAdded(
        uint256 indexed fileId,
        string name,
        string cid,
        address indexed owner,
        uint256 timestamp
    );

    function addFile(
        string memory _name,
        string memory _cid,
        string memory _description,
        uint8 _EncryptedFile,
        uint8 _PublicView
    ) public {
        files.push(
            File({
                name: _name,
                cid: _cid,
                description: _description,
                EncryptedFile: _EncryptedFile,
                PublicView: _PublicView,
                owner: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit FileAdded(
            files.length - 1,
            _name,
            _cid,
            msg.sender,
            block.timestamp
        );
    }
}
