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
            scrollTo: "tooltip",
        }).start();
    }

    render() {
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