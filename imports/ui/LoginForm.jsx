import React, { Component } from 'react';
import {Accounts} from 'meteor/accounts-base'

export class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            status_message: '',
            error_message: '',
        };
    }

    loginOrRegister(username, password) {
        // Try to log in
        this.setState({status_message: 'Logging in...'})
        Meteor.loginWithPassword(username, password, (err) => {
            console.log(err);
            if(err) {
                if(err.reason === "User not found") {
                    // Try to create account
                    Accounts.createUser({
                        username: username,
                        password: password,
                    }, (err) => {
                        if(err) {
                            this.setState({error_message: 'Error while creating new user: ' + err.reason})
                        }
                    }); 
                }
                else {
                    this.setState({error_message: 'Login failed: ' + err.reason});
                }
            }
            this.setState({status_message: ''})
        });
    }

    handleUsernameChange(e) {
        this.setState({username: e.target.value});
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    handleSubmit(e) {
        e.preventDefault();

        let username = this.state.username.trim();
        let password = this.state.password;

        if(!this.props.use_password) {
            password = username;
        }

        if(username === '' || password === '') {
            this.setState({error_message: 'Username or password is empty'});
            return;
        }

        this.loginOrRegister(username, password)
    }

    render() {
        let password_div = null;
        if(this.props.use_password) {
            password_div = (
                <div className='login-field'>
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password" 
                        name="password"
                        value={this.state.password}
                        onChange={this.handlePasswordChange.bind(this)}
                    />
                </div>
            );
        }

        let submit_ready = 
            this.state.username && 
            (this.state.password || (!this.props.use_password));

        return (
            <div className="login-container">
            <form 
                name="login-form"
                onSubmit={this.handleSubmit.bind(this)}                
            >
                <h1>Landing Page</h1>
                <div className='login-field'>
                    <label htmlFor="username">Worker ID: </label>
                    <input 
                        type="text" 
                        name="username"
                        placeholder="MTurk ID (ex: A12345678)"
                        value={this.state.username}
                        onChange={this.handleUsernameChange.bind(this)}
                    />
                </div>
                {password_div}
                <div className='login-status'>
                    {this.state.status_message}
                </div>
                <div className='login-error'>
                    {this.state.error_message}
                </div>
                <button 
                    className='login-button'
                    type="submit"
                    disabled={!submit_ready}
                > 
                    Enter 
                </button>
            </form>
            </div>
        );
    }
}