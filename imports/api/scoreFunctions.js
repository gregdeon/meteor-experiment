// These functions generally assume that word ordering is
// 0, 1, 2, ..., N-1: player 1
// N, N+1, N+2, ..., 2N-1: player 2
// etc

export function getRewardTiers() {
    // List of (number of points required, team reward in cents)
    // Must be in descending order
    let tiers = [
        {points: 30, reward: 120},
        {points: 25, reward:  90},
        {points: 20, reward:  60},
        {points: 15, reward:  40},
        {points: 10, reward:  20},
        {points:  5, reward:  10},
        {points:  0, reward:   0},
    ];

    return tiers;
}

// Convert number of points into tiered reward
export function getTieredReward(points) 
{
    let tiers = getRewardTiers();
    for(let i = 0; i < tiers.length; i++) {
        if(points >= tiers[i].points) {
            return {
                tier: i,
                reward: tiers[i].reward,
            };
        }
    }

    // Default when not enough 
    return 0;
}

function getReward(points) {
    // TODO: handle tiered vs non-tiered reward?
    let cents_per_point = 0.5;
    return points * cents_per_point;
}

// Get number of points from found list
// For now, 1 word = 1 point
// Returns number of words found and number of points (these are equal for now)
function getPoints(found_list, idxs) 
{
    let num_found = 0;
    for(let i = 0; i < idxs.length; i++)
    {
        let idx = idxs[i];
        if(found_list[idx])
            num_found += 1;
    }

    return {
        found: num_found,
        points: num_found
    };
}

// Get number of points for some number of players
// player_mask is a number in [0, 7]; the 3 bits mark whether to include
// players 1 (LSB), 2, and 3 (MSB)
function getPointsPlayers(found, player_mask) 
{
    /* TODO: support both puzzles and audio tasks 
    This is the puzzle code 
    note: argument 1 was "instance" and contained a puzzleInstance

    let found_list = instance.found;
    let words_per_player = found_list.length / 3;
    let idx_list = [];

    for(let i = 0; i < 3; i++) {
        let include_player = !!(player_mask >> i & 1);
        if(include_player) {
            for(let j = 0; j < words_per_player; j++) {
                idx_list.push(i * words_per_player + j);
            }
        }
    }

    return getPoints(found_list, idx_list);
    */

    let num_found = 0;
    for(let i = 0; i < found.length; i++) {
        let found_this_word = false;
        for(let j = 0; j < 3; j++) {
            let include_player = !!(player_mask >> j & 1);
            if(include_player && found[i][j]) {
                found_this_word = true;
                break;
            }
        }
        if(found_this_word)
            num_found += 1;
    }

    return {
        found: num_found,
        points: num_found,
    };

}

function equalSplit(found_list, score_mode) {
    let points_obj = getPointsPlayers(found_list, 0b111);
    let total_reward = getReward(points_obj.points);

    // Split: just divide equally
    let per_player = total_reward / 3;
    let ret = [per_player, per_player, per_player];
    return ret;
}

function proportionalSplit(found_list, score_mode) {
    let total_points = getPointsPlayers(found_list, 0b111);
    let total_reward = getReward(total_points.points);

    //let total_found = total_points.found;
    let total_found = 0;
    let found_counts = [];

    for(var i = 0; i < 3; i++) {
        let num_found = getPointsPlayers(found_list, 1 << i).found;
        total_found += num_found;
        found_counts.push(num_found);
    }

    // If nobody found anything, split equally
    if(total_found === 0) {
        return equalSplit(found_list, score_mode);
    }

    // Split proportionally
    var ret = [];
    for(var i = 0; i < 3; i++) {
        ret.push(total_reward * found_counts[i] / total_found);
    }

    return ret;
}

// Shapley values
function shapleySplit(found_list, score_mode) {
    // Get list of rewards for all coalitions
    let rewards = []
    for(let i = 0; i < 2**3; i++) {
        let points = getPointsPlayers(found_list, i);
        let reward = getReward(points.points);
        rewards.push(reward);
    }

    // Weights for Shapley values
    // TODO: could calculate these automatically
    let shapley_weights = [
        // P1
        [-2, 2, -1, 1, -1, 1, -2, 2],
        // P2
        [-2, -1, 2, 1, -1, -2, 1, 2],
        // P3
        [-2, -1, -1, -2, 2, 1, 1, 2],
    ];

    // Calculate final rewards
    let ret = [];
    for(let i = 0; i < 3; i++) {
        let ret_i = 0;
        for(let j = 0; j < rewards.length; j++) {
            ret_i += rewards[j] * shapley_weights[i][j];
        }
        ret.push(ret_i / 6);
    }

    return ret;
}

function unfairSplit(found_list, score_mode) {
    let total_points = getPointsPlayers(found_list, 0b111);
    let total_reward = getReward(total_points.points);

    // Find how many words each player got
    let found = [];
    for(let i = 0; i < 3; i++) {
        found.push(getPointsPlayers(found_list, 1 << i).found);
    }

    // Find which player was the worst
    var worst_player = 0;
    for(var i = 1; i < 3; i++) {
        if(found[i] < found[worst_player]) {
            worst_player = i;
        }
    }



    // Split 50/25/25 with 50 for the worst
    var ret = [];
    for(var i = 0; i < 3; i++) {
        var proportion = (i === worst_player ? 0.5 : 0.25);
        ret.push(total_reward * proportion);
    }
    return ret;
}

function roundDown(split) {
    console.log(split);
    return split.map((r) => Math.floor(r));
}

export const RewardModes = {
    EQUAL: 0,
    PROPORTIONAL: 1,
    SHAPLEY: 2,
    UNFAIR: 3,

    DEBUG: -1,
};

// TODO: remove score_mode, maybe?
export function getRewards(found_list, reward_mode, score_mode) {
    //let found_list = instance.found;
    switch(reward_mode) {
        case RewardModes.EQUAL:
            return roundDown(equalSplit(found_list, score_mode));

        case RewardModes.PROPORTIONAL:
            return roundDown(proportionalSplit(found_list, score_mode));

        case RewardModes.SHAPLEY:
            return roundDown(shapleySplit(found_list, score_mode));

        case RewardModes.UNFAIR:
            return roundDown(unfairSplit(found_list, score_mode));

        case RewardModes.DEBUG:
            return [10, 20, 30];
    }
}

// Helper function for score box
export function getCurrentStatus(instance, reward_mode) {
    let total_points = getPointsPlayers(instance, 0b111);
    let reward = getTieredReward(total_points.points);
    return {
        points: total_points.points,
        tier: reward.tier,
    };
}