import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import store, {initStore} from './redux/store/mystore';

import { Provider } from 'react-redux';
import * as api from './api/api';
import socket, {setSocketListen, socketSendEvent} from './socket-io-client/client-socket-io-interface';


//socket.io 이벤트 수신 등록
setSocketListen(store);

//사용자 정보 요청 로그인jwt기반.
socketSendEvent.sendHello();


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
