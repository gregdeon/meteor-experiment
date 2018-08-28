import chai from 'chai'
let expect = chai.expect

import {getTieredReward, getReward, roundDown, equalSplit, proportionalSplit, shapleySplit, unfairSplit, RewardModes, getRewards} from './scoreFunctions'

describe('scoreFunctions', function() {
    // Unused
    describe('getTieredReward', function() {
        it('handles the top tier', function() {
            expect(getTieredReward(35).reward).to.equal(120)
        })
        it('handles other tiers', function() {
            expect(getTieredReward(27).reward).to.equal(90)
            expect(getTieredReward(5).reward).to.equal(10)

        })
        it('handles 0 points', function() {
            expect(getTieredReward(0).reward).to.equal(0)
        })
    })

    describe('getReward', function() {
        it('gives 5 cents per 10 words', function() {
            expect(getReward(30)).to.equal(15)
        })
        it('gives 0 cents for no work', function() {
            expect(getReward(0)).to.equal(0)
        })
        it('rounds down partial rewards', function() {
            expect(getReward(29)).to.equal(10)
        })
    })

    describe('roundDown', function() {
        it('rounds down fractions', function() {
            expect(roundDown([1.2, 3.4, 5.6])).to.deep.equal([1, 3, 5])
        })
        it('has no effect on integers', function() {
            expect(roundDown([10, 11, 12])).to.deep.equal([10, 11, 12])
        })
    })

    describe('equalSplit', function() {
        it('divides rewards equally', function() {
            expect(equalSplit([0, 10, 20, 0, 30, 0, 0, 60])).to.deep.equal([10, 10, 10])
        })
        it('handles 2 players', function() {
            expect(equalSplit([0, 20, 40, 0, 0, 0, 0, 60])).to.deep.equal([15, 15, 0])
        })
    })

    describe('proportionalSplit', function() {
        it('divides rewards proportionally', function() {
            expect(proportionalSplit([0, 10, 20, 0, 30, 0, 0, 60])).to.deep.equal([5, 10, 15])
        })
        it('handles players doing 0 work', function() {
            expect(proportionalSplit([0, 0, 20, 0, 30, 0, 0, 50])).to.deep.equal([0, 10, 15])
        })
        it('rounds down partial rewards', function() {
            expect(proportionalSplit([0, 9, 20, 0, 31, 0, 0, 60])).to.deep.equal([4, 10, 15])
        })
    })

    describe('shapleySplit', function() {
        it('divides rewards roughly proportionally', function() {
            expect(shapleySplit([0, 10, 20, 30, 30, 40, 50, 60])).to.deep.equal([5, 10, 15])
        })
        it('handles players doing 0 work', function() {
            expect(shapleySplit([0, 0, 20, 20, 30, 30, 50, 50])).to.deep.equal([0, 10, 15])
        })
        it('rewards pivotal players', function() {
            expect(shapleySplit([0, 9, 20, 29, 31, 40, 51, 60])).to.deep.equal([2, 10, 17])
        })
        it('rewards players doing different work', function() {
            expect(shapleySplit([0, 20, 20, 20, 20, 40, 40, 40])).to.deep.equal([5, 5, 10])
        })
    })

    describe('unfairSplit', function() {
        it('divides rewards unfairly', function() {
            expect(unfairSplit([0, 10, 20, 0, 30, 0, 0, 60])).to.deep.equal([15, 7, 7])
        })
        it('handles 2 players', function() {
            expect(unfairSplit([0, 10, 20, 0, 0, 0, 0, 30])).to.deep.equal([9, 6, 0])
        })
    })

    describe('getRewards', function() {
        let points_list;
        beforeEach(function(){
            points_list = [0, 9, 20, 29, 31, 40, 51, 60];
        })
        it('handles equal splits', function() {
            expect(getRewards(points_list, RewardModes.EQUAL)).to.deep.equal([10, 10, 10])
        })
        it('handles proportional splits', function() {
            expect(getRewards(points_list, RewardModes.PROPORTIONAL)).to.deep.equal([4, 10, 15])
        })
        it('handles Shapley splits', function() {
            expect(getRewards(points_list, RewardModes.SHAPLEY)).to.deep.equal([2, 10, 17])
        })
        it('handles Unfair splits', function() {
            expect(getRewards(points_list, RewardModes.UNFAIR)).to.deep.equal([15, 7, 7])
        })
    })
})