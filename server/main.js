import { Meteor } from 'meteor/meteor';
import {Puzzles} from '../imports/api/puzzles.js';
import {PuzzleInstances, addPuzzleInstance} from '../imports/api/puzzleInstances.js'

Meteor.startup(() => {
    Puzzles.remove({});
    PuzzleInstances.remove({});

    let puzzle = {
        letters: [
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
        ],

        words: [
            {x: 0, y: 0, dx: 1, dy: 1, len: 4, player: 0},
            {x: 4, y: 1, dx: 1, dy: 1, len: 4, player: 0},
            {x: 0, y: 2, dx: 1, dy: 1, len: 4, player: 1},
            {x: 4, y: 3, dx: 1, dy: 1, len: 4, player: 1},
            {x: 0, y: 4, dx: 1, dy: 1, len: 4, player: 2},
            {x: 4, y: 5, dx: 1, dy: 1, len: 4, player: 2},
        ],
    };

    Puzzles.insert(puzzle);
    puzzle = Puzzles.findOne();
    addPuzzleInstance(puzzle._id);
});
