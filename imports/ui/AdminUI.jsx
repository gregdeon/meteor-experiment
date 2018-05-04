// AdminUI.jsx
// Admin-only things

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {CoopWorkflowInstances} from '../api/coopWorkflowInstances.js';
import {CoopWorkflows} from '../api/coopWorkflows.js';

import {PuzzleView} from './WordSearchPuzzle.jsx';
import {WordSearchScoreScreen} from './WordSearchScoreScreen.jsx';

class AdminUI extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected_puzzle: 0,
            selected_coop: 0,
            selected_view: 'puzzle', // 'puzzle' or 'score'
        };
    }

    handleSelectedGroup(event) {
        this.setState({
            selected_coop: event.target.value,
            selected_puzzle: 0,
        });
    }

    handleSelectedPuzzle(event) {
        this.setState({
            selected_puzzle: event.target.value,
        });
    }

    handleSelectedView(view) {
        this.setState({
            selected_view: view,
        });
    }

    renderOneOption(text, idx) {
        return (
            <option
                key={idx}
                value={idx}
            >
                {text}
            </option>
        );
    }

    renderGroupSelector() {
        return (
            <div>
                <p>Group:</p>
                <select
                    onChange={this.handleSelectedGroup.bind(this)}
                    value={this.state.selected_coop}
                >
                    {this.props.coop_instances.map(
                        (instance, idx) => this.renderOneOption(instance._id._str, idx)
                    )}
                </select>
            </div>
        );
    }

    renderPuzzleSelector() {
        let coop_instance = this.props.coop_instances[this.state.selected_coop];
        let stage_ids = coop_instance.output;
        return (
            <div>
                <p>Puzzle Instance:</p>
                <select
                    onChange={this.handleSelectedPuzzle.bind(this)}
                    value={this.state.selected_puzzle}
                >
                    {stage_ids.map((stage_id, idx) => {
                        if(stage_id !== null) {
                            return this.renderOneOption(stage_id._str, idx);
                        }
                        else {
                            return this.renderOneOption("null", idx);
                        }
                    })}
                </select>
            </div>
        )
    }

    renderViewSelector() {
        return (
            <div>
                <div className="admin-radio-view" key="puzzle">
                    <label htmlFor="puzzle">Puzzle</label>
                    <br/>
                    <input
                        type="radio"
                        id="puzzle"
                        checked={this.state.selected_view === "puzzle"}
                        onChange={this.handleSelectedView.bind(this, "puzzle")}
                    />
                </div>
                <div className="admin-radio-view" key="score">                    
                    <label htmlFor="score">Score</label>
                    <br/>
                    <input
                        type="radio"
                        id="score"
                        checked={this.state.selected_view === "score"}
                        onChange={this.handleSelectedView.bind(this, "score")}
                    />
                </div>
            </div>
        );
    }
    renderSelectionBox() {
        return (
            <div className="admin-select-puzzle">
                {this.renderGroupSelector()}
                {this.renderPuzzleSelector()}
                {this.renderViewSelector()}
            </div>
        );
    }

    renderPuzzleView() {
        //let puzzle_instance = this.props.puzzle_instances[this.state.selected_puzzle];
        //console.log(puzzle_instance);
        let coop_instance = this.props.coop_instances[this.state.selected_coop];
        let puzzle_view = null;
        console.log(coop_instance);
        if(coop_instance) {
            let stage_num = this.state.selected_puzzle;
            let puzzle_instance_id = coop_instance.output[stage_num];
            console.log(puzzle_instance_id);
            if(puzzle_instance_id !== null) {
                let puzzle_instance = PuzzleInstances.findOne({_id: puzzle_instance_id});
                console.log(puzzle_instance);
                let puzzle = Puzzles.findOne({_id: puzzle_instance.puzzle});

                if(this.state.selected_view === "puzzle") {
                    puzzle_view = (
                        <PuzzleView
                            puzzle={puzzle}
                            puzzleinstance={puzzle_instance}
                            player_num={0}
                            puzzle_num={-1}
                            time_left={180}
                        />
                    );
                } 
                else if(this.state.selected_view === "score") {
                    puzzle_view = (
                        <WordSearchScoreScreen 
                            puzzle={puzzle}
                            puzzleinstance={puzzle_instance}
                            player_num={0}
                            puzzle_num={-1}
                            time_left={60}
                        />
                    );
                }
            }
        }
        
        return (
            <div>
                <div className="workflow-header">
                    <div className="workflow-user">
                        Username: {Meteor.user().username + ' '}
                    </div>
                    <div className="workflow-admin">
                        Admin Dashboard
                    </div>
                    <div className="workflow-earnings"/>
                </div>
                {this.renderSelectionBox()}
                {puzzle_view}
            </div>
        );
    }

    render() {
        if(!this.props.ready)
            return (<p>Loading...</p>);

        let user_id = Meteor.userId();
        console.log(user_id);
        let is_admin = Roles.userIsInRole(user_id, 'admin', Roles.GLOBAL_GROUP);
        console.log(is_admin);
        if(!is_admin) {
            return (
                <p>Error: only admins can see this page!</p>
            );
        }

        return this.renderPuzzleView();
    }
}

export default withTracker(() => {
    // TODO: make this actually work
    const sub = [
//        Meteor.subscribe('workflows'),
//        Meteor.subscribe('workflowinstances'),
//        Meteor.subscribe('consentforms'),
//        Meteor.subscribe('surveys'),
//        Meteor.subscribe('surveyinstances'),
//        Meteor.subscribe('feedbackletters'),
        Meteor.subscribe('puzzles'),
        Meteor.subscribe('puzzleinstances'),
        Meteor.subscribe('coopworkflowinstances'),
        Meteor.subscribe('coopworkflows'),
        Roles.subscription
    ];

    // Check if ready by putting together subscriptions
    let all_ready = true;
    sub.map((sub_item, idx) => {
        if(!sub_item.ready())
        {
            all_ready = false;
        }
    });

    return {
        ready: all_ready,
        coop_instances: CoopWorkflowInstances.find().fetch(),
//        puzzle_instances: PuzzleInstances.find().fetch(),
        //user: Meteor.user(),

        // TODO: handle cases where user has joined more than one workflow
        // For now, assume there's only one

        // Note that these may be undefined - it's up to the app to
        // deal with these cases
        //workflowInstance: WorkflowInstances.findOne(),
        //coopInstance: CoopWorkflowInstances.findOne(),

        // TODO: this is a total hack
        // Force re-renders whenever a word gets found

        // TODO: remove these when done debugging
        //puzzle: Puzzles.findOne(),
        //puzzleInstance: PuzzleInstances.findOne(),
    };
})(AdminUI);
