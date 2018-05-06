// Routing information 

import React from 'react'
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';

import App from '../imports/ui/App.jsx';
import StartPage from '../imports/ui/StartPage.jsx';
import AdminUI from '../imports/ui/AdminUI.jsx';

const browser_history = createBrowserHistory()

export const renderRoutes = () => (
  <Router history={browser_history}>
    <Switch>
      <Route exact path="/" component={App}/>
      <Route exact path="/start/" component={StartPage}/>
      <Route exact path="/admin/" component={AdminUI}/>
    </Switch>
  </Router>
);
