import { Meteor } from 'meteor/meteor';

// Need to import collections here so that the publish functions get run on the server side

// Workflows
import {Workflows, WorkflowStages} from '../imports/api/workflows.js';

// Other forms
import {Surveys, QuestionTypes} from '../imports/api/surveys.js';
import {ConsentForms} from '../imports/api/consentForms.js';
import {FeedbackLetters} from '../imports/api/feedbackLetters.js';
import {Tutorials} from '../imports/api/tutorials.js';

// Instances 
import {WorkflowInstances} from '../imports/api/workflowInstances.js';
import {SurveyInstances} from '../imports/api/surveyInstances.js';

// Puzzles and audio tasks
import {AudioTasks} from '../imports/api/audioTasks.js';
import {AudioInstances} from '../imports/api/audioInstances.js';
import {AudioRatingTasks} from '../imports/api/audioRatingTasks.js';
import {AudioRatingInstances} from '../imports/api/audioRatingInstances.js'
import {ScoreModes, RewardModes} from '../imports/api/scoreFunctions.js';

import {BlockedUsers} from '../imports/api/blockedUsers.js';
import {ErrorLog} from '../imports/api/errorLog.js';

// Development
import '../imports/api/sandbox.js';

Meteor.startup(() => {
    console.log("Starting server");
});
