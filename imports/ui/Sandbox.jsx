import React, { Component } from 'react';
import {withTracker} from 'meteor/react-meteor-data';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Paper from '@material-ui/core/Paper';

import {AudioTask, AudioTaskView, AudioTaskInput, PlaybackBar, ScrollingTranscript} from './AudioTask.jsx'
import {AudioTranscript, AudioTranscriptStatusBar, AudioTranscriptText, AudioTranscriptLegend, AudioTaskScoreScreen} from './AudioTaskScoreScreen.jsx'
import {DIFF_STATES} from '../api/audioInstances.js'
import {RewardDisplay, RewardQuestions} from './RewardForm.jsx'
import {ConsentForm} from './ConsentForm.jsx'
import {TutorialTextNextButton, TutorialTextNumberQuestion, TutorialTextChoiceQuestion} from './TutorialUtils.jsx';
import {TutorialScreen} from './Tutorial.jsx';
import {SurveyQuestion, Survey} from './Survey.jsx'
import {QuestionTypes} from '../api/surveys.js';
import {FeedbackLetter} from './FeedbackLetter'
import {WorkflowProgressBar, WorkflowHeader} from './Workflow'
import {Counters, getCounter} from '../api/utils.js'

import {getSandboxAudio, getSandboxTutorial} from '../api/sandbox.js';

import './Sandbox.css'

function SandboxCategory(props) {
    return <ExpansionPanel style={{width:"100%"}}>
        <ExpansionPanelSummary>
            {props.title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <Paper style={{width:"100%"}}>
                {props.children}
            </Paper>
        </ExpansionPanelDetails>
    </ExpansionPanel>
}

class SandboxItem extends Component {
    render() {
        return <ExpansionPanel style={{width:"100%"}} expanded={true}>
            <ExpansionPanelSummary>
                {this.props.title}
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div className="sandbox-item">
                    {this.props.children}
                </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    }
}

// Separate class for the reactive audio task and other db-reliant components
class DynamicSandbox extends Component {
    render() {
        console.log(this.props);
        if(!this.props.ready) {
            return <div>Subscribing to collections...</div>
        }

        return <div className='sandbox-container'>
            <SandboxCategory title="Audio Task">
                <SandboxItem>
                    <button onClick={function(){Meteor.call('sandbox.resetAudio')}}>
                        Reset sandbox audio task
                    </button>
                </SandboxItem>
                <SandboxItem title="Full Task">
                    <AudioTask
                        audio_task={this.props.sandbox_audio.task}
                        audio_instance={this.props.sandbox_audio.instance}
                        finishedTaskCallback={(() => console.log("Finished task"))}
                        finishedCallback={(() => console.log("Finished rating"))}
                    />
                </SandboxItem>
            </SandboxCategory>
            <SandboxCategory title="Tutorial">
                <SandboxItem>
                    <button onClick={function(){Meteor.call('sandbox.resetTutorial')}}>
                        Reset sandbox tutorial
                    </button>
                </SandboxItem>
                <SandboxItem title="Tutorial">
                    <TutorialScreen
                        audio_task={this.props.sandbox_tutorial.task}
                        audio_instance={this.props.sandbox_tutorial.instance}
                        finishedCallback={function(){console.log("Finished tutorial")}}
                    />
                </SandboxItem>
            </SandboxCategory>
            <SandboxCategory title="Utils">
                <SandboxItem title="Workflow Counter">
                    <p>Next workflow: {this.props.workflow_counter}</p>
                    <button onClick={(function(){
                        console.log(Meteor.call('utils.incrementCounter', 'workflow_instances'));
                    })}>
                        Update workflow number 
                    </button>
                </SandboxItem>
            </SandboxCategory>
        </div>
    }
}

DynamicSandboxWithProps = withTracker(() => {
    const sub = [
        Meteor.subscribe('audiotasks'),
        Meteor.subscribe('audioinstances'),
        Meteor.subscribe('counters')
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
        sandbox_audio: getSandboxAudio(),
        sandbox_tutorial: getSandboxTutorial(),
        workflow_counter: getCounter('workflow_instances'),
    };
})(DynamicSandbox);

export default class Sandbox extends Component {
    render() {
        // Word lists for score screen
        let word_lists = [
            // P1
            [
                {text: 'these', state: DIFF_STATES.CORRECT},
                {text: 'are', state: DIFF_STATES.INCORRECT},
                {text: 'some', state: DIFF_STATES.NOT_TYPED},
                {text: 'words', state: DIFF_STATES.CORRECT}
            ],
            // P2
            [
                {text: 'this', state: DIFF_STATES.CORRECT},
                {text: 'is', state: DIFF_STATES.CORRECT},
                {text: 'a', state: DIFF_STATES.CORRECT},
                {text: 'slightly', state: DIFF_STATES.CORRECT},
                {text: 'longer', state: DIFF_STATES.CORRECT},
                {text: 'list', state: DIFF_STATES.CORRECT},
                {text: 'of', state: DIFF_STATES.CORRECT},
                {text: 'words', state: DIFF_STATES.CORRECT},
                {text: 'which', state: DIFF_STATES.CORRECT},
                {text: 'is', state: DIFF_STATES.CORRECT},
                {text: 'mostly', state: DIFF_STATES.CORRECT},
                {text: 'correct', state: DIFF_STATES.NOT_TYPED},
            ],
            // P3
            [
                {text: 'this', state: DIFF_STATES.CORRECT},
                {text: 'list', state: DIFF_STATES.CORRECT},
                {text: 'of', state: DIFF_STATES.CORRECT},
                {text: 'words', state: DIFF_STATES.CORRECT},
                {text: 'is', state: DIFF_STATES.CORRECT},
                {text: 'not', state: DIFF_STATES.CORRECT},
                {text: 'as', state: DIFF_STATES.CORRECT},
                {text: 'long', state: DIFF_STATES.CORRECT},
            ]
        ]

        // Props for all audio tasks
        let audio_task_callbacks = {
            onTypedWord: console.log,
            restartAudio: (() => console.log("Clicked on Restart Audio")),
            startCountdown: (() => console.log("Clicked on Start Countdown")),
        }

        return <div className='sandbox-container'>
            <SandboxCategory title="Workflow">
                <SandboxItem title="Progress bar">
                    <WorkflowProgressBar num_stages={10} current_stage={2} />
                </SandboxItem>
                <SandboxItem title="Header">
                    <WorkflowHeader
                        username={"A0123456789ABCDEF"}
                        num_stages={10} 
                        current_stage={2}
                        bonus_cents={123}
                    />
                </SandboxItem>
            </SandboxCategory>

            <SandboxCategory title="Audio Task Components">
                <SandboxCategory title="Individual Task Screens">
                    <SandboxItem title="Not Started">
                        <AudioTaskView
                            started_countdown={false}
                            countdown_time={3}
                            audio_clip_elapsed={0}
                            audio_clip_length={119}
                            words={[]}
                            {...audio_task_callbacks}
                        />
                    </SandboxItem>
                    <SandboxItem title="Counting Down">
                        <AudioTaskView
                            started_countdown={true}
                            countdown_time={3}
                            audio_clip_elapsed={0}
                            audio_clip_length={119}
                            words={[]}
                            {...audio_task_callbacks}
                        />
                    </SandboxItem>
                    <SandboxItem title="Playing">
                        <AudioTaskView
                            started_countdown={true}
                            countdown_time={0}
                            audio_clip_elapsed={61}
                            audio_clip_length={119}
                            words={["these", "are", "a", "few", "words", "that", "have", "been", "typed"]}
                            {...audio_task_callbacks}
                        />
                    </SandboxItem>
                </SandboxCategory>
                <SandboxItem title="Text Input">
                    <AudioTaskInput
                        onTypedWord={console.log}
                    />
                </SandboxItem>
                <SandboxItem title="Playback Bar">
                    <PlaybackBar
                        time_elapsed={61}
                        total_time={119}
                    />
                </SandboxItem>
                <SandboxItem title="Transcript">
                    <ScrollingTranscript 
                        words={["these", "are", "a", "few", "words", "that", "have", "been", "typed"]}
                    />
                </SandboxItem>
            </SandboxCategory>

            <SandboxCategory title="Audio Results">
                <SandboxItem title="Results Screen">
                    <AudioTaskScoreScreen
                        player_num={3}
                        word_lists={word_lists}
                        total_pay={30}
                        total_correct={61}
                        rewards={[5, 10, 15]}
                        submitCallback={console.log}
                    />
                </SandboxItem>
                <SandboxItem title="Unloaded Results Screen">
                    <AudioTaskScoreScreen
                        player_num={3}
                    />
                </SandboxItem>
                <SandboxCategory title="Transcript">
                    <SandboxItem title="Own Transcript">
                        <AudioTranscript
                            player_num={1}
                            is_user={true}
                            words={word_lists[2]}
                        />
                    </SandboxItem>
                    <SandboxItem title="Others' Transcript">
                        <AudioTranscript
                            player_num={1}
                            is_user={false}
                            words={word_lists[2]}
                        />
                    </SandboxItem>
                </SandboxCategory>
                <SandboxItem title="Status Bar">
                    <AudioTranscriptStatusBar 
                        num_words={30}
                        num_typed={25}
                        num_correct={19}
                    />
                </SandboxItem>
                <SandboxItem title="Transcript Text">
                    <AudioTranscriptText
                        words={word_lists[2]}
                    />
                </SandboxItem>
                <SandboxItem title="Legend">
                    <AudioTranscriptLegend
                    />
                </SandboxItem>
            </SandboxCategory>

            <SandboxCategory title="Reward Screen">
                <SandboxItem title="Reward Questions">
                    <RewardQuestions 
                        submit_callback={console.log}
                    />
                </SandboxItem>
                <SandboxCategory title="Reward Display">
                    <SandboxItem title="Reward display">
                        <RewardDisplay player_number={3} rewards={[20, 30, 50]} />
                    </SandboxItem>
                    <SandboxItem title="Reward display with 0">
                        <RewardDisplay player_number={3} rewards={[5, 0, 22]} />
                    </SandboxItem>
                    <SandboxItem title="Reward display with small percentages">
                        <RewardDisplay player_number={3} rewards={[50, 2, 5]} />
                    </SandboxItem>
                </SandboxCategory>
            </SandboxCategory>

            <SandboxCategory title="Consent Form">
                <ConsentForm 
                    consentform={{
                        text: ["This is an example of a paragraph.", "This is another paragraph."]
                    }}
                    finishedCallback={function(){console.log("Finished consent form")}}
                />
            </SandboxCategory>

            <SandboxCategory title="Tutorial">
                <SandboxCategory title="Tutorial Components">
                    <SandboxItem title="Text with Next Button">
                        <TutorialTextNextButton
                            text={"This is an example of a tutorial message."}
                            button_text={"Next"}
                            finishedCallback={function(){console.log("Clicked Next")}}
                        />
                    </SandboxItem>
                    <SandboxItem title="Text with Number Question">
                        <TutorialTextNumberQuestion
                            text={"This is an example of a tutorial message."}
                            question_text={"What number is 123?"}
                            question_answer={123}
                            finishedCallback={console.log}
                        />
                    </SandboxItem>
                    <SandboxItem title="Text with Multiple Choice Question">
                        <TutorialTextChoiceQuestion
                            text={"This is an example of a tutorial message."}
                            question_text={"What number is 1?"}
                            question_options={["1", "2", "3"]}
                            question_answer={0}
                            finishedCallback={console.log}
                        />
                    </SandboxItem>
                </SandboxCategory>
            </SandboxCategory>

            <SandboxCategory title="Survey">
                <SandboxItem title="Full survey">
                    <Survey
                        survey={{
                            title: "Survey Example with a Long Title",
                            questions: [
                                {text: "Question 1", type: QuestionTypes.TEXT_SHORT, required: true},
                                {text: "Question 2", type: QuestionTypes.TEXT_LONG, required: true},
                                {text: "Question 3", type: QuestionTypes.MULTIPLE_CHOICE, options:["Option 1", "Option 2"], required: true},
                            ]
                        }}
                        finishedCallback={console.log}
                    />
                </SandboxItem>
                <SandboxCategory title="Question Types">
                    <SandboxItem title="Short text question">
                        <SurveyQuestion 
                            text="Sample question"
                            type={QuestionTypes.TEXT_SHORT}
                            updateCallback={console.log}
                        />
                    </SandboxItem>                     
                    <SandboxItem title="Long text question">
                        <SurveyQuestion 
                            text="Sample question with long text"
                            type={QuestionTypes.TEXT_LONG}
                            updateCallback={console.log}
                        />
                    </SandboxItem>     
                    <SandboxItem title="Multiple choice question">
                        <SurveyQuestion 
                            text="Sample question with multiple options"
                            type={QuestionTypes.MULTIPLE_CHOICE}
                            options={["First option", "Another option"]}
                            updateCallback={console.log}
                        />
                    </SandboxItem>                
                    <SandboxItem title="Required question">
                        <SurveyQuestion 
                            text="Sample question"
                            type={QuestionTypes.TEXT_SHORT}
                            required={true}
                        />
                    </SandboxItem>
                </SandboxCategory>
            </SandboxCategory>

            <SandboxCategory title="Feedback Letter">
                <FeedbackLetter 
                    feedbackLetter={{
                        text: ["This is an example of a paragraph.", "This is another paragraph."]
                    }}
                    confirmCode={"ABC123"}
                />
            </SandboxCategory>

            <SandboxCategory title="Nested Example">
                <SandboxCategory title="Nested Menu">
                    <div style={{width:"100%"}}>Child</div>
                </SandboxCategory>
            </SandboxCategory>

            <DynamicSandboxWithProps/>
        </div>
    }
}