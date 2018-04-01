import React, { Component } from 'react';
import {getWord} from '../api/puzzles.js';

export class WordSearchStatus extends Component {
    // Return an object like
    // { 0: [ { word: "word", found: true },
    //        { word: "word", found: false },
    //      ],
    //   1: [ ... ],
    //   ...
    // }
    getWordList() {
        let puzzle = this.props.puzzle;
        let found_list = this.props.puzzleinstance.found;
        ret = {};

        for(let i = 0; i < puzzle.words.length; i++) {
            let player = puzzle.words[i].player;
            if (Object.keys(ret).indexOf(player) < 0) {
                ret[player] = [];
            }

            ret_obj = {
                word: getWord(puzzle, i),
                found: found_list[i],
            };

            ret[player].push(ret_obj);
        }

        return ret;
    }

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
        // TODO: update header
        let header_items = [
            {title: "Puzzle", text: '0/0'},
            {title: "Player", text: '0'},
            {title: "Time", text: '0'},
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

    renderOneWord(word_item) {
        let cls = 'word-search-word ' + (word_item.found ? 'word-found' : '');
        return (
            <div className={cls}>
                {word_item.word}
            </div>
        );
    }

    renderWordList() {
        let word_list = this.getWordList();
        let player_list = Object.keys(word_list).sort();

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
                        {this.renderOneWord(word_list[player_list[j]][i])}
                    </td>
                );
            }
            
            word_table.push(
                <tr key={i}>
                    {words_line}
                    {/* TODO: update scores */}
                    <td key={-1}>0</td>
                </tr>
            );
        }

        // Total scores
        let score_line = player_list.map((_, idx) => (<td key={idx} />));
        score_line.push((<td key={-1}>0</td>));

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