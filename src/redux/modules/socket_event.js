import {copyState} from '../../util/clone';


const HELLO = 'socket/HELLO';
const CHATLIST = 'socket/CHATLIST';

const initState = {hello: 0, message: 0, current_chatroom: {chat_title: '', chat_list: [] }};


const hello = ()=>{
    return {type: HELLO};
};

const chatList = (chat_title, chat_list)=>{
    return {type: CHATLIST, current_chatroom: {chat_title: chat_title, chat_list: chat_list}};
};

const socket_event = (state = initState, action)=>{
    let new_state = copyState(state);
    switch(action.type){
        case HELLO:
            console.log('redux-> socketEvent::hello receive');

            new_state.hello = 1;
            return new_state;

        case CHATLIST:
            
            console.log('redux-> socketEvent::chatList call it->', action.current_chatroom);
            if(action.current_chatroom === null){
                console.log('current chatroom not exist!');
                return;
            }
            new_state.current_chatroom.chat_title = action.current_chatroom.chat_title;
            new_state.current_chatroom.chat_list = action.current_chatroom.chat_list.slice();

            return new_state;
        default:
            console.log('SOCKET STATE -> RETURN DEFAULT->', new_state);
            return state;
    }
};

export { socket_event as default, hello, chatList };