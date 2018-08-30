// AdminUI.jsx
// Admin-only things
import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import {LoginForm} from './LoginForm.jsx';
import {AudioTaskView, AudioTaskScore} from './AudioTask.jsx';
import {AudioTaskScoreScreen} from './AudioTaskScoreScreen.jsx';
import {WorkflowProgressBar} from './Workflow.jsx';

import {Workflows, WorkflowStages} from '../api/workflows.js';
import {WorkflowInstances, getWorkflowProgress, getWorkflowEarnings} from '../api/workflowInstances.js';
import {AudioInstances} from '../api/audioInstances.js';
import {AudioTasks} from '../api/audioTasks.js';
import {centsToString} from '../api/utils.js';

export class WorkflowDetails extends Component {
    render() {
        return <List>
            {this.props.workflow.stages.map((stage, idx) => {
                // TODO: don't just render audio instances
                if(stage.type !== WorkflowStages.AUDIO_TASK) {
                    return null;
                }

                let output_id = this.props.workflow_instance.output[idx];
                let audio_instance = AudioInstances.findOne({_id: output_id});
                let num_correct_list = audio_instance.num_correct
                let num_correct = (num_correct_list ? num_correct_list[0b111] : 0)

                return <ListItem key={idx}>
                    <Paper style={{width: "100%"}}>
                        <p>Stage {idx+1}:</p>
                        <br/>
                        <AudioTaskScoreScreen
                            player_num={3}
                            word_lists={audio_instance.diffs}
                            total_pay={audio_instance.total_bonus}
                            total_correct={num_correct}
                            rewards={audio_instance.bonuses}
                            submitCallback={function(){console.log("Disabled on admin screen")}}
                        />
                    </Paper>
                </ListItem>
            })} 
        </List>
    }
}

export class WorkflowSummary extends Component {
    render() {
        let progress = getWorkflowProgress(
            this.props.workflow,
            this.props.workflow_instance,
        );
        let bonus = getWorkflowEarnings(
            this.props.workflow,
            this.props.workflow_instance,
        );

        return <div>
            <ExpansionPanel expanded={this.props.expanded} onChange={this.props.onChange}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}> 
                    <div className="admin-workflow-header">
                        <div className="workflow-user">
                            {this.props.workflow_instance.worker_id || 'unknown_id'}
                        </div>   
                        <div className="workflow-progress">
                            <WorkflowProgressBar 
                                num_stages={progress.total}
                                current_stage={progress.done}
                            />
                            {progress.done} / {progress.total}
                        </div>
                        <div className="workflow-earnings">
                            {"Bonus: " + centsToString(bonus)}
                        </div>
                    </div> 
                </ExpansionPanelSummary> 
                <ExpansionPanelDetails>
                    <WorkflowDetails
                        workflow={this.props.workflow}
                        workflow_instance={this.props.workflow_instance}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </div>
    }
}

class AdminUI extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded_instance: null,
        };
    }

    handleExpandWorkflow(instance_id, event, expanded) {
        this.setState({
            expanded_instance: expanded ? instance_id : null,
        })
    }

    renderWorkflows() {
        // TODO: sort?
        let workflow_instances = WorkflowInstances.find().fetch(); 
        return <div>
            <div className="admin-header">All workflows:</div>
            {workflow_instances.map((workflow_instance, idx) => {
                let instance_id = workflow_instance._id;
                let workflow = Workflows.findOne({_id: workflow_instance.workflow_id})
                return <WorkflowSummary
                    workflow={workflow}
                    workflow_instance={workflow_instance}
                    expanded={instance_id == this.state.expanded_instance}
                    onChange={this.handleExpandWorkflow.bind(this, instance_id)}
                    key={idx}
                />
            })}
        </div>
    }

    render() {
        if(!this.props.ready)
            return (<p>Connecting to database...</p>);

        // Log in if not already
        if(!this.props.user) {
            return <LoginForm
                use_password={true}
            />
        }

        if(this.props.user.username !== "greg") {
            return (
                <p>Error: only admins can see this page!</p>
            );
        }

        return this.renderWorkflows()
    }
}

export default withTracker(() => {
    const sub = [
        Meteor.subscribe('allusers'),
        Meteor.subscribe('workflows'),
        Meteor.subscribe('workflowinstances'),
        Meteor.subscribe('audiotasks'),
        Meteor.subscribe('audioinstances'),
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
        // coop_instances: CoopWorkflowInstances.find().fetch(),
//        puzzle_instances: PuzzleInstances.find().fetch(),

        // TODO: this is a total hack
        // Force re-renders whenever state updates
        workflow_instances: WorkflowInstances.find().fetch(),
        audio_instances: AudioInstances.find().fetch(),

    };
})(AdminUI);
