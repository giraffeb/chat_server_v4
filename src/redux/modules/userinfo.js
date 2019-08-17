//현재 사용자아이디과 상대 채팅사용자 그리고 토큰 상태를 저장하는 리듀서입니다.
//리듀서란 상태 변화를 일으키는 함수.

//actions
import {copyState} from '../../util/clone';

const USER_INFO = 'userinfo/USER_INFO';


const CURRENT_USER = 'userinfo/CURRENT_USER';
const CURRENT_FRIEND = 'userinfo/CURRENT_FRIEND';
const TOKEN = 'userinfo/TOKEN';


const initState = {
        user_info: {
        user_id: '',
        friend_id: '',
        token: ''
    }};

//create Actions
export const set_user_info = (user_id, friend_id, token)=>{

    return {
        type: USER_INFO,
        user_info: {
            user_id: user_id,
            friend_id: friend_id,
            token: token
        }
    }
};

function userinfo(state = initState, action){

    switch(action.type){
        case USER_INFO:
            let new_state = copyState(action.user_info);
            return new_state;
        case CURRENT_USER:
            return;
        case CURRENT_FRIEND:
            return;
        case TOKEN:
            return;
        default:
            return state;
    }
}

export default userinfo;
