import { Meteor } from 'meteor/meteor';  
import React from 'react';  
import { render } from 'react-dom';  
import {renderRoutes} from './routes.jsx';
//import App from '../imports/ui/App.jsx';

Meteor.startup(() => {  
  render(renderRoutes(), document.getElementById('root'));
//    render(<App />, document.getElementById('render-target'));
});