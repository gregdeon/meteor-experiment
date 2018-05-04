import React, { Component } from 'react';
import {getWordList} from '../api/puzzleInstances.js';
import {getScores, ScoreModes} from '../api/scoreFunctions.js';

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
    renderHeader() {
        return (
            <div className='word-search-header'>
                <b>Score</b>
            </div>
        )
    }

    render() {
        return (
            <div className='word-search-sidebox'>
                {this.renderHeader()}
                <div>TODO</div>
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