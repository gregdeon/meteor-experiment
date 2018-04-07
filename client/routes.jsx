// Routing information 

import React from 'react'
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';

import App from '../imports/ui/App.jsx';

const browser_history = createBrowserHistory()

export const renderRoutes = () => (
  <Router history={browser_history}>
    <Switch>
      <Route exact path="/" component={App}/>
    </Switch>
  </Router>
);
