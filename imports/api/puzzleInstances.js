// puzzleInstances.js
// Collection for storing a single play of a puzzle
// Contents:
// - puzzle: ID of a puzzle
// - found: list of true/false for each word
// - state: current state of the puzzle (waiting, in puzzle, in score screen, finished)


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
    'puzzleinstances.findWord'(instance_id, start_pos, end_pos) {
        let instance = PuzzleInstances.findOne({_id: instance_id})
        let puzzle = Puzzles.findOne({_id: instance.puzzle});

        let found_list = instance.found;
        let word_list = puzzle.words;

        for(let i = 0; i < word_list.length; i++) {
            let word = word_list[i]; 
            if(checkIsMatch(word, start_pos, end_pos)) {
                found_list[i] = true;
                let obj = {};
                obj["found." + i] = true;
                PuzzleInstances.update(instance_id, {
                    $set: obj
//                        found: found_list
                    //}
                });
                return true;
            }
        } 

        return false;
    },
});