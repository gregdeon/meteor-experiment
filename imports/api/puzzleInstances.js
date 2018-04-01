// puzzleInstances.js
// Collection for storing a single play of a puzzle
// Contents:
// - puzzle: ID of a puzzle
// - found: list of 


import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';
import {Puzzles} from './puzzles.js'

export const PuzzleInstances = new Mongo.Collection('puzzleinstances');

if (Meteor.isServer) {
    Meteor.publish('puzzleinstances', function puzzleInstancePublication(){
        return PuzzleInstances.find();
    });
}

export function addPuzzleInstance(puzzle_id) {
    let puzzle = Puzzles.findOne({_id: puzzle_id});
    let num_words = puzzle.words.length;
    let found_list = Array(num_words).fill(false);
    PuzzleInstances.insert({
        puzzle: puzzle._id,
        found: found_list,
    });
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
                PuzzleInstances.update(instance_id, {
                    $set: {found: found_list}
                });
                return true;
            }
        } 

        return false;
    },
});