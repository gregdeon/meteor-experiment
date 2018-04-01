// These functions generally assume that word ordering is
// 0, 1, 2, ..., N-1: player 1
// N, N+1, N+2, ..., 2N-1: player 2
// etc


// Find per-line and total scores
// Assume 3 players with equal number of words
// Also assume word order is all P1 words, then P2, then P3
function getAllScores(found_list, per_line_scores)
{
    let words_per_player = found_list.length / 3;
    let score_per_line = [];
    let found_per_line = [];
    let score_total = 0;
    for(let i = 0; i < words_per_player; i++)
    {
        let found_line = 0;
        found_line += found_list[i + 0*words_per_player];
        found_line += found_list[i + 1*words_per_player];
        found_line += found_list[i + 2*words_per_player];
        
        let score_line = per_line_scores[found_line];
        
        found_per_line.push(found_line);
        score_per_line.push(score_line);
        score_total += score_line;
    }
    
    let ret = {
        scores: score_per_line,
        found: found_per_line,
        total: score_total
    };
    return ret;
}


export const ScoreModes = {
    FLAT: 0,
    SUPERADDITIVE: 1,
    SUBADDITIVE: 2,
};

// Return the per-line and 
// Returned object looks like
// { scores: [1, 2, 0, 4, ...],
//   found:  [1, 2, 0, 3, ...],
//   total:  <sum of scores> }
export function getScores(instance, score_mode) {
    let per_line_scores = [0, 0, 0, 0];

    switch(score_mode) {
        case ScoreModes.FLAT:
            per_line_scores = [0, 2, 4, 6];
            break;

        case ScoreModes.SUPERADDITIVE:
            per_line_scores = [0, 1, 3, 6];
            break;

        case ScoreModes.SUBADDITIVE:
            per_line_scores = [0, 3, 5, 6];
            break;
    }

    return getAllScores(instance.found, per_line_scores);
}

export const RewardModes = {
    EQUAL: 0,
    PROPORTIONAL: 1,
    SHAPLEY: 2,
};

export function getRewards(instance, reward_mode) {
    // TODO
    return [10, 20, 30];
}