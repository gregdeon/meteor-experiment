import React, { Component } from 'react';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

import './RewardForm.css'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#24780B',
      // main: '#00c853',
    },
    secondary: {
      main: '#710C0C',
      // main: '#d50000',
    },
  },
});


export class OneRewardDisplay extends Component {
    getRewardString() {
        if(this.props.percent <= 0) {
            return "";
        }

        if(this.props.percent < 7.5) {
            return "" + this.props.reward;
        }

        if(this.props.percent < 10) {
            return "P" + (this.props.player + 1) + ": " + this.props.reward;
        }

        return "P" + (this.props.player + 1) + ": " + this.props.reward + "c";
    }

    render() {
        let cls = "score-option-p" + (this.props.player + 1);
        let width = "" + this.props.percent + "%";
        return (
            <div 
                className={cls}
                style={{width: width}}
            >
                {this.getRewardString()}
            </div>
        );
    }
}

export class RewardDisplay extends Component {
    render() {
        let rewards = this.props.rewards;
        let total = 0;
        for(let i = 0; i < rewards.length; i++) {
            total += rewards[i];
        }

        let percents = rewards.map((reward) => (100*reward/total));
        if(total === 0) {
            percents = [33, 34, 33];
        }

        return (
            <div className="score-screen-reward">
            {rewards.map((reward, idx) => {
                return (
                    <OneRewardDisplay 
                        key={idx}
                        player={idx}
                        reward={rewards[idx]}
                        percent={percents[idx]}
                    />
                ); 
            })}
            </div>
        );
    }
}

export class RewardQuestions extends Component {
    handleClick(button_idx, event) {
        this.props.submit_callback({fairness: button_idx})
    }

    render() {
        let answer_buttons = [
            {text: 'Unfair', color: 'secondary', icon: <RemoveIcon/> },
            {text: 'Neutral', color: 'default', icon: <RadioButtonUncheckedIcon/>},
            {text: 'Fair', color: 'primary', icon: <AddIcon/>}
        ]

        return (
            <div>
                <MuiThemeProvider theme={theme}>
                    <p>Given you and your teamates' performance, how fair do you think your payments are?</p>
                    <div className="reward-buttons-container">
                        {answer_buttons.map((button, idx) => (
                            <div className="reward-button-wrapper" key={idx}>
                                <Button 
                                    variant="contained" 
                                    color={button.color}
                                    onClick={this.handleClick.bind(this, idx)}
                                >
                                    <div className="reward-button-contents">
                                        {button.icon}
                                        <p>{button.text}</p>
                                    </div>
                                </Button>   
                            </div>
                        ))}
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
}
