import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';


import socketio from 'socket.io-client'

window.isLogin=true;


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// let socket = socketio.connect('http://localhost:8888');

// function hi(){    
//     socket.emit('hi');
// }

// hi();

// socket.on('hi', (data)=>{
//     console.log('hi');
//     console.log(data);
// });

console.log('isLogin -> ',window.isLogin);