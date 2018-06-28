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
    /* This is per-word bonus
    let cents_per_point = 0.5;
    return points * cents_per_point;
    */

    // This is tiered reward
    let n_words = 10
    let cents_per_group = 5
    let groups = Math.floor(points / n_words);
    return groups * cents_per_group;
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
    let players_found = 0;
    let found_counts = [];

    for(var i = 0; i < 3; i++) {
        let num_found = getPointsPlayers(found_list, 1 << i).found;
        found_counts.push(num_found);
        if(num_found > 0) {
            players_found += 1;
        }
    }

    if(players_found === 0) {
        return [0, 0, 0, total_reward];
    }

    let per_player = total_reward / players_found;
    let ret = [];
    for(let i = 0; i < 3; i++) {
        if(found_counts[i] > 0)
            ret.push(per_player);
        else
            ret.push(0);
    }
    ret.push(total_reward);
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
    ret.push(total_reward);

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
    ret.push(rewards[0b111]);

    return ret;
}

let unfair_lookup = [
    // 0 players: doesn't matter... 
    {worst: 1.0, others: 0.0},
    // 1 player: player takes all
    {worst: 1.0, others: 0.0},
    // 2 players: split 60/40
    {worst: 0.6, others: 0.4},
    // 3 players: split 50/25/25
    {worst: 0.5, others: 0.25},
];

function unfairSplit(found_list, score_mode) {
    let total_points = getPointsPlayers(found_list, 0b111);
    let total_reward = getReward(total_points.points);

    // Find how many words each player got
    // and find which player was the worst
    var found = [];
    var players_found = 0;
    var worst_player = 0;
    for(let i = 0; i < 3; i++) {
        let num_found = getPointsPlayers(found_list, 1 << i).found; 
        found.push(num_found);
        if(num_found > 0) {
            players_found += 1;
            if(found[worst_player] === 0 || found[i] < found[worst_player]) {
                worst_player = i;
            }
        }
    }

    // Pick which way to pay people
    let payment_split = unfair_lookup[players_found];

    console.log(payment_split);
    var ret = [];
    for(var i = 0; i < 3; i++) {
        if(found[i] > 0) {
            var proportion = (i === worst_player ? payment_split.worst : payment_split.others);
            ret.push(total_reward * proportion);
        }
        else {
            ret.push(0);
        }
    }
    ret.push(total_reward);
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
// Returns a list of rewards like [10, 20, 30, 60]
// Last reward is total (helpful in case of rounding)
export function getRewards(found_list, reward_mode, score_mode) {
    let reward_list = [0, 0, 0];
    switch(reward_mode) {
        case RewardModes.EQUAL:
            reward_list = roundDown(equalSplit(found_list, score_mode));
            break;

        case RewardModes.PROPORTIONAL:
            reward_list = roundDown(proportionalSplit(found_list, score_mode));
            break;

        case RewardModes.SHAPLEY:
            reward_list = roundDown(shapleySplit(found_list, score_mode));
            break;

        case RewardModes.UNFAIR:
            reward_list = roundDown(unfairSplit(found_list, score_mode));
            break;

        case RewardModes.DEBUG:
            reward_list = [10, 20, 30];
            break;
    }

    return reward_list;
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