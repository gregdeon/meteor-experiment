// puzzles.js
// Collection for storing the contents of a puzzle, but not its state
// Contents:
// - letters: list of strings
// - words: list of objects with
//   - x: first letter position
//   - y: first letter position
//   - dx: word direction
//   - dy: word direction
//   - len: word length
//   - player: whose job it is to find this word

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Puzzles = new Mongo.Collection('puzzles');

if (Meteor.isServer) {
    Meteor.publish('puzzles', function puzzlePublication(){
        return Puzzles.find();
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
    'puzzles.findWord'(puzzle_id, start_pos, end_pos) {
        let puzzle = Puzzles.findOne({_id: puzzle_id});
        let word_list = puzzle.words;

        for(let i = 0; i < word_list.length; i++) {
            let word = puzzle.words[i]; 
            if(checkIsMatch(word, start_pos, end_pos)) {
                word_list[i].found = true;
                Puzzles.update(puzzle_id, {
                    $set: {words: word_list}
                });
                return true;
            }
        } 

        return false;
    },
});