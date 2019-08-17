import { copyState } from '../../util/clone';

const GET = 'friends/GET';
const MESSAGE = 'socket/MESSAGE';
const GET_CHATROOM = 'friend/GET_CHATROOM';
const NEW_FRIEND = 'friend/NEW_FRIEND';



const initState = {
    friend_list: {}
};

const get = (friend_list)=>({type: GET});

const message = (msg)=>{
    return {
        type: MESSAGE,
        msg: msg
    }
}

const getChatRoom = (friend_id)=>{
    return {
        type: GET_CHATROOM,
        friend_id: friend_id
    }
}

const add_friend = (friend_id)=>{
    return {
        type: NEW_FRIEND,
        friend_id: friend_id
    }
}

const friendlist = (state = initState, action)=>{
    let new_state = copyState(state);
    console.log('new_state=>', new_state);
    switch(action.type){
        case GET:
            let new_friend_list = action.friend_list.slice();
            for(let friend_id of new_friend_list){
                if(new_state.friend_list.hasOwnProperty(friend_id) === false){
                    new_state.friend_list[friend_id] = 0;
                }
            }
            return new_state;
        case MESSAGE:
                //TODO: noti 카운트 처리를 구현해줘야함.
                //메시지의 수신은 소켓이벤트 수신에서 처리하고 여기는 현재 채팅방에 그릴 것인지 아닌지만 체크하면 될 듯.
                //fire ChatArea::redraw()
                console.log('redux-> socketEvent::message redraw() receive', new_state);
                console.log('redux-> socketEvent::message redraw() receive', action.msg);
                
                new_state.friend_list[action.msg.sender] = new_state.friend_list[action.msg.sender] + 1 ;
                
                return new_state;
        
        case GET_CHATROOM:
            new_state.friend_list[action.friend_id] = 0;
            return new_state;

        case NEW_FRIEND:
            //동일한데?
            new_state.friend_list[action.friend_id] = 0;
            return new_state;
            
        default:
            return state;
    }

}

export {friendlist as default, get, message, getChatRoom, add_friend};