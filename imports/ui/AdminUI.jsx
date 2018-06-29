// AdminUI.jsx
// Admin-only things

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {CoopWorkflowInstances} from '../api/coopWorkflowInstances.js';
import {CoopWorkflows, CoopWorkflowStages} from '../api/coopWorkflows.js';
import {Tutorials} from '../api/tutorials.js';

import {PuzzleView} from './WordSearchPuzzle.jsx';
import {WordSearchScoreScreen} from './WordSearchScoreScreen.jsx';

import {TutorialScreen} from './Tutorial.jsx';

import {LoginForm} from './LoginForm.jsx';

import {AudioTaskView, AudioTaskScore} from './AudioTask.jsx';
import {AudioInstances} from '../api/audioInstances.js';
import {AudioTasks} from '../api/audioTasks.js';

class AdminUI extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected_stage: 0,
            selected_coop: 0,
            selected_player: 0,
            selected_view: 'task', // 'task' or 'score'
        };
    }

    handleSelectedGroup(event) {
        this.setState({
            selected_coop: event.target.value,
            selected_stage: 0,
            selected_player: 0,
        });
    }

    handleSelectedPuzzle(event) {
        this.setState({
            selected_stage: event.target.value,
        });
    }

    handleSelectedPlayer(event) {
        this.setState({
            selected_player: parseInt(event.target.value),
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
        console.log(this.props);
        let coop_instance = this.props.coop_instances[this.state.selected_coop];
        let stage_ids = coop_instance.output;
        return (
            <div>
                <p>Stage:</p>
                <select
                    onChange={this.handleSelectedPuzzle.bind(this)}
                    value={this.state.selected_stage}
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

    renderPlayerSelector() {
        let coop_instance = this.props.coop_instances[this.state.selected_coop];
        let num_players = coop_instance.user_ids.length;

        let player_options = []
        for(let i = 0; i < num_players; i++) {
            player_options.push(this.renderOneOption(i+1, i));
        }

        return (
            <div>
                <p>Player:</p>
                <select
                    onChange={this.handleSelectedPlayer.bind(this)}
                    value={this.state.selected_player}
                >
                    {player_options}
                </select>
            </div>
        )
    }

    renderViewSelector() {
        return (
            <div>
                <div className="admin-radio-view" key="task">
                    <label htmlFor="task">Task</label>
                    <br/>
                    <input
                        type="radio"
                        id="task"
                        checked={this.state.selected_view === "task"}
                        onChange={this.handleSelectedView.bind(this, "task")}
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
                {this.renderPlayerSelector()}
            </div>
        );
    }

    renderPuzzleView(instance_id) {
        if(instance_id == null) {
            return null;
        }

        let puzzle_instance = PuzzleInstances.findOne({_id: instance_id});
        console.log(puzzle_instance);
        let puzzle = Puzzles.findOne({_id: puzzle_instance.puzzle});

        if(this.state.selected_view === "task") {
            return (
                <PuzzleView
                    puzzle={puzzle}
                    puzzleinstance={puzzle_instance}
                    player_num={this.state.selected_player}
                    puzzle_num={-1}
                    time_left={180}
                />
            );
        } 
        else if(this.state.selected_view === "score") {
            (
                <WordSearchScoreScreen 
                    puzzle={puzzle}
                    puzzleinstance={puzzle_instance}
                    player_num={this.state.selected_player}
                    puzzle_num={-1}
                    time_left={60}
                />
            );
        }
    }

    renderAudioView(instance_id) {
        if(instance_id == null) {
            return null;
        }
        console.log(instance_id);
        let audio_instance = AudioInstances.findOne({_id: instance_id});
        console.log(audio_instance);
        let audio_task = AudioTasks.findOne({_id: audio_instance.audio_task});

        let task_component = null;

        if(this.state.selected_view === "task") {
            task_component = <AudioTaskView
                audio_task={audio_task}
                audio_instance={audio_instance}
                player_num={this.state.selected_player}
                time_left={audio_task.time_s[1] - 10}
                show_countdown={false}
            />
        } 
        else if(this.state.selected_view === "score") {
            task_component = <AudioTaskScore 
                audio_task={audio_task}
                audio_instance={audio_instance}
                player_num={this.state.selected_player}
                time_left={60}
            />;
        }

        let ratings_divs = audio_instance.ratings.map((rating, idx) => {
            let ratings = "Not submitted";
            if(rating !== null) {
                ratings = 'Self Fairness: ' + rating.self + ', Team Fairness: ' + rating.others + ', Satisfaction: ' + rating.satisfied;
            }
            return <div key={idx}><b>Player {idx+1}:</b> {ratings}</div>;
        });

        return (
            <div>
                <div style={{textAlign: 'center'}}>
                    Ratings:
                    {ratings_divs}
                </div>
                {task_component}
            </div>
        );
    }

    renderTaskView() {
        //let puzzle_instance = this.props.puzzle_instances[this.state.selected_stage];
        //console.log(puzzle_instance);
        let coop_instance = this.props.coop_instances[this.state.selected_coop];
        let task_view = null;
        console.log(coop_instance);
        if(coop_instance) {
            let coop_workflow = CoopWorkflows.findOne({_id: coop_instance.coop_id})
            let stage_num = this.state.selected_stage;
            let instance_id = coop_instance.output[stage_num];
            let instance_type = coop_workflow.stages[stage_num].type;

            if(instance_type == CoopWorkflowStages.PUZZLE) {
                task_view = this.renderPuzzleView(instance_id);
            }
            else if(instance_type == CoopWorkflowStages.AUDIO) {
                task_view = this.renderAudioView(instance_id);
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
                {task_view}
            </div>
        );
    }

    render() {
        if(!this.props.ready)
            return (<p>Loading...</p>);

        let user_id = Meteor.userId();

        if(user_id === null) {
            return <LoginForm
                use_password={true}
            />
        }

        let is_admin = Roles.userIsInRole(user_id, 'admin', Roles.GLOBAL_GROUP);
        console.log(is_admin);
        
        /* TODO: add this when not debugging 
        if(!is_admin) {
            return (
                <p>Error: only admins can see this page!</p>
            );
        }
        */  

        let tutorial = Tutorials.findOne();
        return (
            <div>
                {this.renderTaskView()}
                {/*
                <TutorialScreen 
                    tutorial={tutorial}
                />
                */}
            </div>
        );
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
        Meteor.subscribe('audiotasks'),
        Meteor.subscribe('audioinstances'),
        Meteor.subscribe('coopworkflowinstances'),
        Meteor.subscribe('coopworkflows'),
        Meteor.subscribe('tutorials'),
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
        user: Meteor.user(),
        coop_instances: CoopWorkflowInstances.find().fetch(),
//        puzzle_instances: PuzzleInstances.find().fetch(),

        // TODO: handle cases where user has joined more than one workflow
        // For now, assume there's only one

        // TODO: this is a total hack
        // Force re-renders whenever state updates
        audio_instances: AudioInstances.find().fetch(),

        // TODO: remove these when done debugging
        //puzzle: Puzzles.findOne(),
        //puzzleInstance: PuzzleInstances.findOne(),
    };
})(AdminUI);
