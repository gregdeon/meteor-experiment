import React, { Component } from 'react';

export class FeedbackLetter extends Component {
    render() {
        let lines = this.props.feedbackLetter.text;
        return (
            <div className="letter-container">
                <h1>Task Complete!</h1>
                <div className="letter-confirm-code">
                    <p key={-1}><b>Confirmation Code:</b> 
                        {' ' + this.props.confirmCode}
                    </p>
                </div>
                <hr/>
                {
                    lines.map((line, idx) => {
                        return <p key={idx}>{line}</p>
                    })
                }
            </div>
        );
    }
}