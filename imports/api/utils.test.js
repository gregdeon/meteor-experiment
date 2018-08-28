import chai from 'chai'
let expect = chai.expect

import {getSecondsSince, pad, centsToString, secondsToString} from './utils.js';

describe('utils', function() {
    describe('getSecondsSince', function() {
        xit('returns the seconds elapsed', function() {
            // This is difficult to test
        })
        it('handles null times', function() {
            expect(getSecondsSince(null)).to.equal(0);
        })
    })
    describe('pad', function() {
        it('left-pads numbers with zeros', function() {
            expect(pad(7, 1)).to.equal('7')
            expect(pad(7, 2)).to.equal('07')
            expect(pad(7, 3)).to.equal('007')
            expect(pad(23, 1)).to.equal('23')
            expect(pad(23, 2)).to.equal('23')
            expect(pad(23, 3)).to.equal('023')
        })
    })

    describe('centsToString', function() {
        it('converts cents to strings', function() {
            expect(centsToString(123)).to.equal("$1.23")
            expect(centsToString(101)).to.equal("$1.01")
            expect(centsToString(23)).to.equal("$0.23")
            expect(centsToString(0)).to.equal("$0.00")
        })
    })

    describe('secondsToString', function() {
        it('converts seconds to times', function() {
            expect(secondsToString(123)).to.equal('2:03')
            expect(secondsToString(61)).to.equal('1:01')
            expect(secondsToString(10)).to.equal('0:10')
            expect(secondsToString(0)).to.equal('0:00')
        })
    })
})