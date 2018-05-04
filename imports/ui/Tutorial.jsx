// Component for viewing tutorials

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import introJs from 'intro.js';


class TutorialItem extends Component {
    render() {
        let box_style = {
            // Box position
            left: this.props.tutorial_item.x,
            top: this.props.tutorial_item.y,
            width: this.props.tutorial_item.w,
            height: this.props.tutorial_item.h,

            // Text
        }
        return (
            <div className="tutorial-box" 
                id={"tutorial-item-" + this.props.order}
                style={box_style}
                data-intro={this.props.tutorial_item.text}
            >
            </div>
        )
    }
}

export class TutorialScreen extends Component {
    startTutorial() {
        introJs().setOptions({
            exitOnOverlayClick: false,
            exitOnEsc: false,
        }).start();
    }

    render() {
        /*
        let tutorial_items = [
            {
                x: 5,
                y: 20,
                w: 1000,
                h: 720,
                text: "In this experiment, you will solve 5 word search puzzles in a team with 2 other crowd workers. The first puzzle will serve as a practice round.",
            },   
            {
                x: 5,
                y: 77,
                w: 414,
                h: 375,
                text: "During each puzzle, your team will be given a list of words to find. The words assigned to you are highlighted.",
            },            
            {
                x: 420,
                y: 60,
                w: 720,
                h: 720,
                text: "When you find a word in the puzzle, click the first letter to start selecting it, then click the last letter to mark it as found.",
            },
        ];
        */

        let tutorial_items = this.props.tutorial.steps;
        return (
            <div className="tutorial-container">
            <button
                onClick={this.startTutorial.bind(this)}
            >
                Start Tutorial
            </button>
            <br />
            <div className="tutorial-inner">
                <img src={this.props.tutorial.image} />
                {tutorial_items.map((item, idx) => (
                    <TutorialItem 
                        order={idx+1}
                        key={idx+1}
                        tutorial_item={item}
                    />
                ))}
            </div>
            </div>
        );
    }
}