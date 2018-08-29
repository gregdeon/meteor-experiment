// Routing information 

import React from 'react'
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import { Meteor } from 'meteor/meteor';  

import App from '../imports/ui/App.jsx';
import AdminUI from '../imports/ui/AdminUI.jsx';
import Sandbox from '../imports/ui/Sandbox.jsx';

const browser_history = createBrowserHistory()

export const renderRoutes = (() => {
    return <Router history={browser_history}>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route exact path="/admin/" component={AdminUI}/>
            {Meteor.isDevelopment ? <Route exact path="/sandbox/" component={Sandbox}/> : null}
        </Switch>
    </Router>
});
