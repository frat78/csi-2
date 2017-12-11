import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from "react-router-dom";
import './index.css';
import App from './App';
import Overview from './components/Overview';
import Meetings from './components/Meetings';
import HourlyPeakConcurrency from './components/HourlyPeakConcurrency';
// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<BrowserRouter>
  <div>
   <Route exact path='/' component={App} />
   <Route exact path='/Overview' component={Overview} />
   <Route exact path='/Meetings' component={Meetings} />
   <Route exact path='/HourlyPeakConcurrency' component={HourlyPeakConcurrency} />
   </div>
 </BrowserRouter>,
 document.getElementById('root')
);

//registerServiceWorker();
