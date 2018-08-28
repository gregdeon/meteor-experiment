import chai from 'chai'
let expect = chai.expect

import {normalizeWord, DIFF_STATES, diffWords, listTypedCorrect, listGroundTruthTyped, getNumCorrectByPlayers, processResults} from './audioInstances'

describe('audioInstances', function() {
    describe('normalizeWord', function() {
        it('converts to lowercase', function() {
            expect(normalizeWord('abcDEF')).to.deep.equal(['abcdef'])
        })

        it('leaves numbers', function() {
            expect(normalizeWord('UW2018')).to.deep.equal(['uw2018'])
        })

        it('splits on spaces', function() {
            expect(normalizeWord('Multiple Words')).to.deep.equal(['multiple', 'words'])
        })

        it('turns dashes into spaces', function() {
            expect(normalizeWord('Hyphenated-Word')).to.deep.equal(['hyphenated', 'word'])
        })

        it('removes punctuation', function() {
            expect(normalizeWord('Remove these, right?')).to.deep.equal(['remove', 'these', 'right'])
        })
    })

    describe('diffWords', function() {
        it('computes diffs', function() {
            let diff_output = diffWords(['this', 'is', 'a', 'test'], ['this', 'is', 'my', 'test']) 
            expect(diff_output).to.deep.equal([
                {text: 'this', state: DIFF_STATES.CORRECT},
                {text: 'is', state: DIFF_STATES.CORRECT},
                {text: 'a', state: DIFF_STATES.NOT_TYPED},
                {text: 'my', state: DIFF_STATES.INCORRECT},
                {text: 'test', state: DIFF_STATES.CORRECT},
            ])
        })
    })

    describe('listTypedCorrect', function() {
        it('lists whether typed words were correct', function() {
            let diff_output = diffWords(
                ['this', 'is', 'the', 'ground', 'truth', 'with', 'many', 'words'],
                ['this', 'is', 'the', 'wrong', 'set', 'of', 'words']
            )
            typed_correct = listTypedCorrect(diff_output);
            expect(typed_correct).to.deep.equal([true, true, true, false, false, false, true])
        })
    })

    describe('listGroundTruthTyped', function() {
        it('lists whether ground truth words were typed', function() {
            let diff_output = diffWords(
                ['this', 'is', 'the', 'ground', 'truth', 'with', 'many', 'words'],
                ['this', 'is', 'the', 'wrong', 'set', 'of', 'words']
            )
            ground_truth_typed = listGroundTruthTyped(diff_output);
            expect(ground_truth_typed).to.deep.equal([true, true, true, false, false, false, false, true])
        })
    })

    describe('getNumCorrectByPlayers', function() {
        it('counts number of words for each coalition', function() {
            let num_correct = getNumCorrectByPlayers(
                [true, true, false, false, true],
                [true, false, true, false, false],
                [true, false, false, true, true],
            )
            expect(num_correct).to.deep.equal([0, 3, 2, 4, 3, 4, 4, 5])
        })
    })

    // Helper function for generating test data
    function addDates(word_list) {
        return word_list.map(word => ({word: word, date: null}));
    }

    describe('processResults', function() {
        it('computes diffs and results for a finished task', function() {
            // Reduced audio task and instance - just the essentials
            let words_truth = normalizeWord("So you were, for many years, obsessed with the idea of bringing the Olympics, the Summer Olympics, to New York City. And you toiled first in obscurity for a while, spending a lot of your own money, recruiting a lot of people to your cause. You got some leverage over time, you got in the Bloomberg administration. You were first reluctant to take that job, because you thought it would curtail your Olympic activity, but Mike Bloomberg persuaded you that it actually would give you leverage to help. You got delayed, you wanted it to be 2008, it got pushed to 2012 Olympics. You pursued, you pursued, you pursued. You traveled the world, did everything you could. Finally, New York was voted the U.S. city in the bid, and then ultimately lost out in the I.O.C., in the International Olympic Committee vote.");
            let words_p1 = normalizeWord('So you were, for many years, obsessed with the idea of bringing the Olympics, the Summer Olympics, to New York City');
            let words_p2 = normalizeWord('So you were obcessed with briging the Olympics, the Summer Olympics, to New York City. And you toiled for a while, spending money, recruiting people to your cause. You got levrage over time, you got in the administration');
            let words_p3 = normalizeWord('you, for many years, obsessed with the idea of bringing the Summer Olympics to New York. And you toiled for a while, spending a lot, recruiting a lot to your cause. You got leverage over time. You were reluctant to take that job,');

            let audio_task = {
                words_truth: words_truth,
                words_p1: words_p1,
                words_p2: words_p2,
                reward_mode: 1,
            }

            let audio_instance = {
                words_typed: addDates(words_p3),
            }

            let results = processResults(audio_task, audio_instance)

            // Check diffs
            expect(results.diffs[0]).to.deep.equal(diffWords(words_truth, words_p1))
            expect(results.diffs[1]).to.deep.equal(diffWords(words_truth, words_p2))
            expect(results.diffs[2]).to.deep.equal(diffWords(words_truth, words_p3))

            // Check how many were correct
            expect(results.num_correct).to.deep.equal([0, 21, 35, 43, 43, 48, 54, 54]);

            // Check rewards
            expect(results.total_bonus).to.equal(25);
            expect(results.bonuses).to.deep.equal([5, 8, 10]);
        })
    })
})