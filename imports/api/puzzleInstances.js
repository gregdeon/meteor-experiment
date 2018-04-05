// puzzleInstances.js
// Collection for storing a single play of a puzzle
// Contents:
// - puzzle: ID of a puzzle
// - found: list of true/false for each word
// - state: current state of the puzzle (waiting, in puzzle, in score screen, finished)
// - time_started: when the team began the puzzle
// - time_ended: when the team began the score screen
// - ratings: list of objects like {self: 4, others: 3, time_submitted: Date.now()}



import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';
import {Puzzles, getWord} from './puzzles.js'

export const PuzzleInstances = new Mongo.Collection('puzzleinstances');

if (Meteor.isServer) {
    Meteor.publish('puzzleinstances', function puzzleInstancePublication(){
        return PuzzleInstances.find({
            // TODO: really need to make sure we don't publish lots of these
        });
    });
}

export const PuzzleInstanceStates = {
    WAITING: 0,
    PUZZLE: 1,
    SCORE: 2,
    FINISHED: 3,
};

export function addPuzzleInstance(puzzle_id) {
    let puzzle = Puzzles.findOne({_id: puzzle_id});
    let num_words = puzzle.words.length;
    let found_list = Array(num_words).fill(false);

    let instance_id = PuzzleInstances.insert({
        puzzle: puzzle._id,
        found: found_list,
        state: PuzzleInstanceStates.PUZZLE,
        time_started: null,
        time_ended: null,
        // TODO: don't hard code 3 people
        ratings: [null, null, null],
    });

    return instance_id;
}

// Return an object like
// { 0: [ { word: "word", found: true },
//        { word: "word", found: false },
//      ],
//   1: [ ... ],
//   ...
// }
export function getWordList(puzzle, instance) {
    let found_list = instance.found;
    ret = {};

    for(let i = 0; i < puzzle.words.length; i++) {
        let player = puzzle.words[i].player;
        if (!ret.hasOwnProperty(player)) {
            ret[player] = [];
        }

        ret_obj = {
            word: getWord(puzzle, i),
            found: found_list[i],
        };

        ret[player].push(ret_obj);
    }

    return ret;
}

function checkIsMatch(word, start_pos, end_pos) {
    word_start = {
        x: word.x, 
        y: word.y,
    }
    word_end = {
        x: word.x + word.dx * (word.len - 1), 
        y: word.y + word.dy * (word.len - 1),
    };

    if(
        word.x == start_pos.x &&
        word.y == start_pos.y &&
        word_end.x == end_pos.x &&
        word_end.y == end_pos.y
    ) {
        return true;
    }

    if(
        word.x == end_pos.x &&
        word.y == end_pos.y &&
        word_end.x == start_pos.x &&
        word_end.y == start_pos.y
    ) {
        return true;
    }

    return false;
}

Meteor.methods({
    'puzzleinstances.findWord'(instance_id, player_id, start_pos, end_pos) {
        // TODO: calculate player ID on server side, not client
        let instance = PuzzleInstances.findOne({_id: instance_id})
        let puzzle = Puzzles.findOne({_id: instance.puzzle});

        let found_list = instance.found;
        let word_list = puzzle.words;

        for(let i = 0; i < word_list.length; i++) {
            let word = word_list[i]; 
            
            if(word.player !== player_id)
                continue;

            if(checkIsMatch(word, start_pos, end_pos)) {
                found_list[i] = true;
                let obj = {};
                obj["found." + i] = true;
                PuzzleInstances.update(instance_id, {
                    $set: obj
                });
                return true;
            }
        } 

        return false;
    },

    'puzzleinstances.startPuzzle'(instance_id) {
        // Update the start time only if it's null
        PuzzleInstances.update(
            {
                _id: instance_id,
                time_started: null,
            },
            {
                $set: {
                    time_started: new Date(),
                }
            }
        );
    },

    'puzzleinstances.finishPuzzle'(instance_id) {
        // Update the finish time only if it's null
        PuzzleInstances.update(
            {
                _id: instance_id,
                time_finished: null,
            },
            {
                $set: {
                    state: PuzzleInstanceStates.SCORE,
                    time_finished: new Date(),
                }
            }
        );
    },

    'puzzleinstances.submitRating'(instance_id, player_num, ratings) {
        // Save a timestamp in case we need it
        ratings.time_submitted = new Date();

        // Put it into the puzzle instance
        let upd = {};
        upd['ratings.' + player_num] = ratings;
        console.log(upd);
        PuzzleInstances.update(
            instance_id,
            {
                $set: upd
            }
        );
    },

    'puzzleinstances.finishAllSteps'(instance_id) {
        PuzzleInstances.update(
            {
                _id: instance_id,
            },
            {
                $set: {
                    state: PuzzleInstanceStates.FINISHED,
                }
            }
        );
    }
});