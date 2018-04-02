import React, { Component } from 'react';
import {Accounts} from 'meteor/accounts-base'

export class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            error_message: '',
        };
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

        if(username === '' || password === '') {
            this.setState({error_message: 'Username or password is empty'});
            return;
        }

        // Try to log in
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
        });

    }

    render() {
        return (
            <div className="login-container">
            <form 
                name="login-form"
                onSubmit={this.handleSubmit.bind(this)}                
            >
                <h1>Login or Register</h1>
                <div className='login-field'>
                    <label htmlFor="username">Username: </label>
                    <input 
                        type="text" 
                        name="username"
                        placeholder="MTurk ID (ex: A12345678)"
                        value={this.state.username}
                        onChange={this.handleUsernameChange.bind(this)}
                    />
                </div>
                <div className='login-field'>
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password" 
                        name="password"
                        value={this.state.password}
                        onChange={this.handlePasswordChange.bind(this)}
                    />
                </div>
                <div className='login-error'>
                    {this.state.error_message}
                </div>
                <button 
                    className='login-button'
                    type="submit"
                    disabled={!(this.state.username && this.state.password)}
                > 
                    Login/Register 
                </button>
            </form>
            </div>
        );
    }
}