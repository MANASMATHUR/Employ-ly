// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EmploylyJobRegistry
 * @dev Registry for verifying job postings on-chain
 */
contract EmploylyJobRegistry {
    
    struct JobDef {
        address poster;
        string contentHash; // IPFS hash or metadata hash
        uint256 timestamp;
        bool isActive;
    }

    // Mapping from Transaction Hash (or Job ID) to Job Definition
    mapping(bytes32 => JobDef) public jobs;
    
    // Fee to post a job
    uint256 public postFee = 0.00001 ether;
    
    // Admin address
    address public owner;

    event JobPosted(bytes32 indexed jobId, address indexed poster, string contentHash);
    event FeeUpdated(uint256 newFee);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Post a job by paying the fee
     * @param jobId Unique ID for the job (generated off-chain or hash)
     * @param contentHash IPFS hash of job details
     */
    function postJob(bytes32 jobId, string calldata contentHash) external payable {
        require(msg.value >= postFee, "Insufficient fee");
        require(jobs[jobId].poster == address(0), "Job ID already exists");

        jobs[jobId] = JobDef({
            poster: msg.sender,
            contentHash: contentHash,
            timestamp: block.timestamp,
            isActive: true
        });

        // Forward fee to owner
        payable(owner).transfer(msg.value);

        emit JobPosted(jobId, msg.sender, contentHash);
    }

    /**
     * @dev Update the posting fee
     */
    function setPostFee(uint256 _newFee) external {
        require(msg.sender == owner, "Only owner");
        postFee = _newFee;
        emit FeeUpdated(_newFee);
    }
}
