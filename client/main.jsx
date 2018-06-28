import { Meteor } from 'meteor/meteor';  
import React from 'react';  
import { render } from 'react-dom';  
import {renderRoutes} from './routes.jsx';
//import App from '../imports/ui/App.jsx';

import {ErrorLog, submitError} from '../imports/api/errorLog.js';

// Catch errors
window.onerror = (msg, url, line, col, error) => {
    console.log(error);
    submitError(msg, url, line, col, error.stack);
  // log.error(msg, {file: url, onLine: line});
  // if (_GlobalErrorHandler) {
  //   _GlobalErrorHandler.apply(this, arguments);
  // }
};


Meteor.startup(() => {  
  render(renderRoutes(), document.getElementById('root'));
//    render(<App />, document.getElementById('render-target'));
});