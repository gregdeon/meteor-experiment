import React, { Component } from 'react';
import {getWordList} from '../api/puzzleInstances.js';
import {getRewardTiers, getCurrentStatus, getScores, ScoreModes} from '../api/scoreFunctions.js';
import {centsToString} from '../api/utils.js';

export class WordSearchTime extends Component {
    render() {
        return (
            <div className='word-search-sidebox'>
                <b>Time Remaining: </b>
                {this.props.time_left + " seconds"}
            </div>
        );
    }
}

export class WordSearchScoreBox extends Component {
    renderTiers(tier) {
        let tier_table = [];
        let tiers = getRewardTiers();

        for(let i = 0; i < tiers.length; i++) {
            let point_range = (i > 0 ?
                tiers[i].points.toString() + " - " + (tiers[i-1].points - 1).toString() :
                tiers[i].points.toString() + "+"
            );
            let reward_cents = tiers[i].reward;
            let reward = centsToString(reward_cents);

            if(i === tier) {
                point_range = <b>{point_range}</b>;
                reward = <b>{reward}</b>;
            }

            tier_table.push(
                <tr key={i}>
                    <td>{point_range}</td>
                    <td>{reward}</td>
                </tr>
            );
        }

        return (
            <table><tbody>
                <tr key={-1}>
                    <th>Points</th>
                    <th>Bonus</th>
                </tr>

                {tier_table}
            </tbody></table>
        )
    }

    renderHeader(points) {
        return (
            <div className='word-search-header'>
                <b>Current Score: </b> {points} Points
            </div>
        )
    }

    render() {
        let current_reward = getCurrentStatus(
            this.props.puzzle_instance,
            this.props.puzzle.score_mode
        );

        return (
            <div className='word-search-sidebox'>
                {this.renderHeader(current_reward.points)}
                {this.renderTiers(current_reward.tier)}
            </div>
        );
    }
}

export class WordSearchStatus extends Component {
    renderHeaderItem(title, text, idx) {
        return (
            <div key={idx}>
                <b> 
                    {title + ': '} 
                </b>
                {text}
            </div>
        );
    }

    renderHeader() {
        return (
            <div className='word-search-header'>
                <b>Word List</b>
            </div>
        )
    }

    renderOneWord(word_item, is_own_word) {
        let own_word_class = 'word-own-p' + (this.props.player_num + 1) + ' '
        let cls = 'word-search-word ' 
            + (word_item.found ? 'word-found ' : '')
            + (is_own_word ? own_word_class : '');

        return (
            <div className={cls}>
                {word_item.word}
            </div>
        );
    }

    renderWordList() {
        let word_list = getWordList(this.props.puzzle, this.props.puzzleinstance);
        let player_list = Object.keys(word_list).sort();
        
        let players = player_list.map((player_num) => {
            let player_int = parseInt(player_num);
            let player_text = "Player " + (player_int + 1);
            if(player_int === this.props.player_num)
                player_text += " (you)";
            return <th key={player_num}>{player_text}</th>;
        });

        // Note: assuming equal length word lists
        let word_table = [];
        let words_per_player = word_list[player_list[0]].length;
        for(let i = 0; i < words_per_player; i++) {
            let words_line = [];
            for(let j = 0; j < player_list.length; j++) {
                words_line.push(
                    <td key={j}>
                        {this.renderOneWord(
                            word_list[player_list[j]][i],
                            j === this.props.player_num,
                        )}
                    </td>
                );
            }
            
            word_table.push(
                <tr key={i}>
                    {words_line}
                </tr>
            );
        }

        return (
            <table><tbody>
                <tr key={-1}>
                    {players}
                </tr>

                {word_table}
            </tbody></table>
        )
    }

    render() {
        return (
            <div className='word-search-sidebox'>
                {this.renderHeader()}
                {this.renderWordList()}
            </div>
        );
    }
}