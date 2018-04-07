import React, { Component } from 'react';
import {getWordList} from '../api/puzzleInstances.js';
import {getScores, ScoreModes} from '../api/scoreFunctions.js';

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

    renderHeaderItems() {
        let header_items = [
            {title: "Puzzle", text: this.props.puzzle_num + 1},
            {title: "Player", text: this.props.player_num + 1},
            {title: "Time", text: this.props.time_left},
        ]

        let header_jsx = header_items.map((item, idx) => (
            this.renderHeaderItem(item.title, item.text, idx)
        ));
        return (
            <div className='word-search-header'>
                {header_jsx}
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

        // Calculate scores here
        // TODO: read score mode from puzzleInstance
        let score_obj = getScores(
            this.props.puzzleinstance, 
            this.props.puzzle.score_mode
        );
        
        let players = player_list.map((player_num) => (
            <th key={player_num}>Player {parseInt(player_num) + 1}</th>
        ));

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
                    <td key={-1}>
                        {score_obj.scores[i]}
                    </td>
                </tr>
            );
        }

        // Total scores
        let score_line = player_list.map((_, idx) => (<td key={idx} />));
        score_line.push((
            <td key={-1}>
                {score_obj.total}
            </td>
        ));

        return (
            <table><tbody>
                <tr key={-1}>
                    {players}
                    <th key={-1}>Score</th>
                </tr>

                {word_table}

                <tr key={-2}>
                    {score_line}
                </tr>
            </tbody></table>
        )
    }

    render() {
        return (
            <div className='word-search-sidebox'>
                {this.renderHeaderItems()}
                {this.renderWordList()}
            </div>
        );
    }
}