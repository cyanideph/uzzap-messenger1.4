import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

if (process.env.REACT_APP_ENABLE_REMOTE_DEBUG === 'true') {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
    console.log('React DevTools not detected. Please install the browser extension.');
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);