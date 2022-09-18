// SPDX-License-Identifier: BSD-3-CLAUSE
pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { IERC20 } from "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import { KeeperRewardBase } from "./KeeperRewardBase.sol";
import { Chainlink } from "../Chainlink.sol";

contract KeeperRewardL1 is KeeperRewardBase {
    function initialize(IERC20 _perpToken) external initializer {
        __BaseKeeperReward_init(_perpToken);
    }

    /**
     * @notice call this function to update price feed and get token reward
     */
    function updatePriceFeed(bytes32 _priceFeedKey) external {
        bytes4 selector = Chainlink.updateLatestRoundData.selector;
        TaskInfo memory task = getTaskInfo(selector);

        Chainlink(task.contractAddr).updateLatestRoundData(_priceFeedKey);
        postTaskAction(selector);
    }
}
