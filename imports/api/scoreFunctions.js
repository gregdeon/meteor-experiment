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

export function getReward(points) {
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

// Floor every number in a list
export function roundDown(split) {
    return split.map((r) => Math.floor(r));
}

export function equalSplit(points_list) {
    let total_reward = getReward(points_list[0b111]);

    // Find number of players
    let players_found = 0;
    for(var i = 0; i < 3; i++) {
        let num_found = points_list[1 << i];
        if(num_found > 0) {
            players_found += 1;
        }
    }

    if(players_found === 0) {
        return [0, 0, 0];
    }

    let per_player = total_reward / players_found;
    let ret = [];
    for(let i = 0; i < 3; i++) {
        if(points_list[1 << i] > 0)
            ret.push(per_player);
        else
            ret.push(0);
    }
    return roundDown(ret);
}

export function proportionalSplit(points_list) {
    let total_reward = getReward(points_list[0b111]);

    let total_found = 0;
    let found_counts = [];

    for(var i = 0; i < 3; i++) {
        let num_found = points_list[1 << i];
        total_found += num_found;
        found_counts.push(num_found);
    }

    // If nobody found anything, split equally
    if(total_found === 0) {
        return [0, 0, 0]
    }

    // Split proportionally
    var ret = found_counts.map((found_count) => total_reward * found_count / total_found);
    return roundDown(ret);
}


// Weights for Shapley values
// TODO: could calculate these automatically
let shapley_weights = [
    [-2, 2, -1, 1, -1, 1, -2, 2], // P1
    [-2, -1, 2, 1, -1, -2, 1, 2], // P2
    [-2, -1, -1, -2, 2, 1, 1, 2], // P3
];

// Shapley values
export function shapleySplit(points_list) {
    // Get list of rewards for all coalitions
    let rewards = points_list.map((points) => getReward(points))

    // Calculate final rewards
    let ret = [];
    for(let i = 0; i < 3; i++) {
        let ret_i = 0;
        for(let j = 0; j < rewards.length; j++) {
            ret_i += rewards[j] * shapley_weights[i][j];
        }
        ret.push(ret_i / 6);
    }

    return roundDown(ret);
}


let unfair_lookup = [
    {worst: 1.0, others: 0.0},  // 0 players: doesn't matter... 
    {worst: 1.0, others: 0.0},  // 1 player: player takes all
    {worst: 0.6, others: 0.4},  // 2 players: split 60/40
    {worst: 0.5, others: 0.25}, // 3 players: split 50/25/25
];

export function unfairSplit(points_list) {
    let total_points = points_list[0b111];
    let total_reward = getReward(total_points);

    // Find how many words each player got and find which player was the worst
    var found = [];
    var players_found = 0;
    var worst_player = 0;
    for(let i = 0; i < 3; i++) {
        let num_found = points_list[1 << i]; 
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
    var ret = found.map((num_found, i) => {
        if(num_found === 0)
            return 0;

        let proportion = (i === worst_player ? payment_split.worst : payment_split.others);
        return total_reward * proportion;
    });
    return roundDown(ret);
}

export const RewardModes = {
    EQUAL: 0,
    PROPORTIONAL: 1,
    SHAPLEY: 2,
    UNFAIR: 3,

    DEBUG: -1,
};

// Returns a list of rewards like [10, 20, 30, 60]
// Last reward is total (helpful in case of rounding)
export function getRewards(points_list, reward_mode) {
    let reward_list = [0, 0, 0];
    switch(reward_mode) {
        case RewardModes.EQUAL:
            reward_list = equalSplit(points_list);
            break;

        case RewardModes.PROPORTIONAL:
            reward_list = proportionalSplit(points_list);
            break;

        case RewardModes.SHAPLEY:
            reward_list = shapleySplit(points_list);
            break;

        case RewardModes.UNFAIR:
            reward_list = unfairSplit(points_list);
            break;

        case RewardModes.DEBUG:
            reward_list = [10, 20, 30];
            break;
    }

    return reward_list;
}
