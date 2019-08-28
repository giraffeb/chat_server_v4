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

function heartbeat(){
    let current_user_info = api.getCurrentUserInfo();
    socket.emit('heartbeat', current_user_info.user_id, (ack)=>{
        console.log('receive hearbeat->', ack);
    });
}


export { sendHello, sendMessage}; 