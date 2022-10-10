//SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;


interface IERC20Votes {
    function getPastVotes(address, uint256) external view returns(uint256);
}


//For this ballot we no longer need to specifiy voters or have a chairperson give them the right to vote. This is because
//the number of tokens an address has is what authorizes them to vote
contract tokenizedBallot{
    
    uint public referenceBlock;
    IERC20Votes public tokenContract;

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    Proposal[] public proposals;
    //for each address we keep track of voting power spent. It begins with 0 for everyone and changes when they vote
    mapping(address => uint256) public votingPowerSpent;

    //we first deploy the token contract and then pass its address to the ballot
    constructor(bytes32[] memory proposalNames, address _tokenContract, uint256 _referenceBlock){
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({voteCount: 0, name: proposalNames[i]}));
        }
        referenceBlock = _referenceBlock;
        tokenContract = IERC20Votes(_tokenContract);
    }

    //vote takes a proposal and also an amount of tokens aka votes you wish to allocate
    function vote(uint256 proposal, uint256 amount) public {
        uint256 _votingPower = votingPower(msg.sender);
        //make sure the msg.sender has enough votes to allocate
         require(_votingPower >= amount, "TokenizedBallot: trying to vote more than voting power available");
        votingPowerSpent[msg.sender] += amount;
        // //increase vote count for the particular proposal
        proposals[proposal].voteCount += amount;
    }

    function votingPower(address account) public view returns(uint256 votingPower_) {
        votingPower_ = tokenContract.getPastVotes(account, referenceBlock) - votingPowerSpent[account];
    }


    //the functions to get the winning proposal are the same.

      /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() external view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}