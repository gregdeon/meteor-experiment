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
// - seconds_puzzle: length of time to spend on the puzzle
// - seconds_score: length of time to spend on the score screen
// - score_mode: one of ScoreModes
// - reward_mode: one of RewardModes

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

import {ScoreModes, RewardModes} from './scoreFunctions.js';

export const Puzzles = new Mongo.Collection('puzzles');

if (Meteor.isServer) {
    Meteor.publish('puzzles', function puzzlePublication(){
        return Puzzles.find();
    });
}

export function getWord(puzzle, word_num) {
    let word = puzzle.words[word_num];
    let x  = word['x'];
    let y  = word['y'];
    let dx = word['dx'];
    let dy = word['dy'];
    let len = word['len'];
    let ret = "";
    
    for(var i = 0; i < len; i++)
    {
        ret += puzzle.letters[y][x];
        x += dx;
        y += dy;
    }
    return ret;
}