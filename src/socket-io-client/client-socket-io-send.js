import socket from './client-socket-io-common';
import * as api from '../api/api';

function sendHello(){
    if(sessionStorage.getItem('jwt') !== null){
        socket.emit('hello', (data)=>{
            console.log('send hello->', data);
        }, (ack)=>{
            console.log('receive ack->', ack);
            if(ack === 'token_expired'){
                api.logout();
            };
        });
    }
}

function sendMessage(message){
    socket.emit('message', message);
}


export { sendHello, sendMessage}; 