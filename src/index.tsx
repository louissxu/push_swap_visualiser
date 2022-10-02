import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import Visualiser from "./Visualiser";
import { Move } from "./Utilities";
import reportWebVitals from './reportWebVitals';

const startingValues = [7, 2, 6, 1, 8, 0, 9, 4, 5, 3];
const startingMoves = [Move.Start, Move.Ra, Move.Pb, Move.Ra, Move.Pb, Move.Pb, Move.Pb, Move.Pb, Move.Ra, Move.Ra, Move.Pb, Move.Sa, Move.Ra, Move.Ra, Move.Pa, Move.Rb, Move.Rb, Move.Rb, Move.Rb, Move.Pa, Move.Pa, Move.Pa, Move.Pa, Move.Ra, Move.Pb, Move.Ra, Move.Pa, Move.Pa, Move.Sa]

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Visualiser values={startingValues} moves={startingMoves}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
