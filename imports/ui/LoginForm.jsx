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

    setMessage(msg, is_error) {
        if(is_error) {
            this.setState({
                status_message: '',
                error_message: msg,
            });
        }
        else {
            this.setState({
                status_message: msg,
                error_message: '',
            });
        }
    }

    handleUsernameChange(e) {
        this.setState({username: e.target.value});
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    checkIfUserExists(username) {
        return Meteor.users.find({username: username}).count() > 0;
    }

    loginOrRegister(username, password) {
        if(this.checkIfUserExists(username)) {
            // Try to log in
            this.setMessage('User is registered. Logging in...', false)
            Meteor.loginWithPassword(username, password, (err) => {
                if(err) {
                    this.setMessage('Login failed: ' + err.reason, true)
                }
                else {
                    this.setMessage('Success. Loading page...', false)
                }
            });
        }
        else {
            // Register new account
            this.setMessage('Registering...', false)
            Accounts.createUser({
                username: username,
                password: password,
            }, (err) => {
                if(err) {
                    this.setMessage('Error while creating new user: ' + err.reason, true)
                }
                else {
                    this.setMessage('Success. Loading page...', false)
                }
            }); 
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        let username = this.state.username.trim();
        let password = this.state.password;

        if(!this.props.use_password) {
            password = username;
        }

        if(username === '' || password === '') {
            this.setMessage('Username or password is empty', true);
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
                    <label htmlFor="username">Username: </label>
                    <input 
                        type="text" 
                        name="username"
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