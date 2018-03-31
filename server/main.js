import { Meteor } from 'meteor/meteor';
import {Puzzles} from '../imports/api/puzzles.js';

Meteor.startup(() => {
    Puzzles.remove({});

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
            {x: 0, y: 0, dx: 1, dy: 1, len: 4, player: 0, found: false},
            {x: 0, y: 2, dx: 1, dy: 1, len: 4, player: 1, found: false},
            {x: 0, y: 4, dx: 1, dy: 1, len: 4, player: 2, found: false},
        ],
    };

    Puzzles.insert(puzzle);
});
