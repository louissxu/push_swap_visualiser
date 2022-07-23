import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import Visualiser, { Move } from "./Visualiser";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Visualiser values={[7, 0, 1, 2, 3]} moves={[Move.Pa, Move.Pb]}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();