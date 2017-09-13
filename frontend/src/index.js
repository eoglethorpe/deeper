import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';
import registerServiceWorker from './common/utils/registerServiceWorker';


ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
