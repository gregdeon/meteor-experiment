import chai from 'chai'
let expect = chai.expect

import {DIFF_STATES, diffWords, listTypedCorrect, listGroundTruthTyped, getNumCorrectByPlayers} from './audioInstances'

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