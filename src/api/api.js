import * as debug from '../util/debug';
import Message from '../util/vo';


import * as dao from '../db/dexie_dao';
import socket, {setSocketListen, socketSendEvent} from '../socket-io-client/client-socket-io-interface';
import store from '../redux/store/mystore';
import {chatList} from '../redux/modules/socket_event';


//기본적으로 REST API를 사용합니다.
//다음엔 graphql로 가즈아

let currentUserInfo = null;
let currentChatRoom = null;
let jwt = null;

function getJWT(){
    if(jwt === null){
        jwt = sessionStorage.getItem('jwt');
    }
    return jwt;
}

function setJWT(token){
    sessionStorage.setItem(token);
}

function getCurrentChatRoomInfo(){
    if(currentChatRoom === null){
        currentChatRoom = JSON.parse(sessionStorage.getItem('currentChatRoom'));
    }
    return currentChatRoom;
}

function setCurrentChatRoomInfo(chatroom_info){
    currentChatRoom = chatroom_info;
}

function getCurrentUserInfo(){
    if(currentUserInfo === null){
        let currentUser =  JSON.parse(sessionStorage.getItem('currentUser'));
        currentUserInfo = currentUser;
    }
    
    return currentUserInfo;
}

function setCurrentUserInfo(user_info){
    currentUserInfo = user_info;
    sessionStorage.setItem('currentUser', JSON.stringify(user_info));
}


// //#0 로그아웃 기능.
function logout(){
    sessionStorage.removeItem('jwt');
    window.open('/logout', '_self');
}

// //#1. 친구아이디 입력후 엔터시 이벤트
export async function add_friend_event(friend_id){
    let result;
    let friend_exist = await getFriendExist(friend_id);
    
    if(friend_exist === false){
        alert('해당 유저가 존재하지 않습니다.');
        return ;
    }

    let response = await fetch('/friend'
                    , {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                          },
                        method: "POST"
                        , body: JSON.stringify({friend_id: friend_id})
                        }
                    );
    
    if(response.ok){ //status: 200
        result = await response.json();//user info
        
        
        //상대방에게 친구추가가 되었음을 알리고, 상대방도 등록하게함.
        let current_user = getCurrentUserInfo();
        

        await dao.addFriendDB(friend_id);
        socket.emit('added_friend', {sender: current_user.user_id, receiver: friend_id});

        debug.print('친구 추가 정상적완료->', result);
        return true;
    }else{
        //해당 사용자가 없는 등 정상적인 응답이 아니라면
        result = await response.json();
        debug.print('not found user->', result);
        alert('해당 유저가 존재하지 않습니다.');
        return false;
    }
}


//#2. 친구 목록 가져오기
async function get_friend_list(){
    //hello에서 가져온 현재 유저 정보의 친구목록에서 친구 아이디값을 가져옴
    let current_user = getCurrentUserInfo();
    //친구 아이디값으로 다시 서버에서 정보를 가져옴.
    let response = await fetch('/friend/'+current_user.user_id, {method: "GET"});
    
    //서버에서 친구 목록을 가져왔다면
    let friend_id_list = null;
    if(response.ok){
        friend_id_list = await response.json();
    }
    return friend_id_list;
}

//#3. hello시 친구에 해당하는 채팅방을 가져옴. 클라이언트 디비에 저장하는데 사용됨.
async function init_get_chatroom_event(friend_id){
    let chatroom;
    
    //해당 유저에 해당하는 채팅방을 찾습니다.
    //TODO: 더 나은 방법이...?
    let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    
    if(response.ok){
        chatroom = await response.json();
        setCurrentChatRoomInfo(chatroom);
    }else{
        //TODO: 친구 등록시 채팅방이 생성되는 구조라서, 원래대로라면 없을 수 없다.
        debug.print('채팅방을 가져오지 못했습니다.->', friend_id);
        return ;
    }
    return chatroom;
}


//#4. chatting messgae 보내기
//보내는 내용을 현재 클라이언트의 indexeddb에 저장합니다.
async function send_message_event(event){

    //keyUp 이벤트를 처리합니다.
    if(event.key === 'Enter'){
        let text_area = event.target;
        let message_text = text_area.value;

        //메시지의 앞뒤의 공백과 개행문자를 제거합니다.
        message_text = message_text.trim()
        message_text = message_text.replace('\n', '');

        //입력받은 내용으로 메시지 객체를 생성합니다.
        let new_message = create_message(message_text);

        let friend_id = new_message.receiver;
        //새로운 메시지를 현재 디비에 저장하고, 가져와서 새로운 채팅리스트 생성.
        await dao.saveMessageToDB(new_message);
        let new_chat_list = await dao.loadMessageFromDB(friend_id);
        
        //채팅리스트 상태변경 
        store.dispatch(chatList(friend_id, new_chat_list));
        //socket.io로 message이벤트에 메시지를 보냅니다.
        socketSendEvent.sendMessage(new_message);
        //입력창을 클리어합니다.
        text_area.value = '';
    }
}

//#5. 사용지 정보를 이용해서 메시지 형식을 완성 후 리턴합니다.
function create_message(msg){
    let current_user = getCurrentUserInfo();
    let current_chatroom = getCurrentChatRoomInfo();

    let message = new Message();

    message.chatroom_id = current_chatroom._id; //TODO: chatroom._id가 필요한지 모르겠습니다.
    message.sender = current_user.user_id;
    message.message = msg;

    //받는 사람의 정보를 현재 채팅방에서 가져옵니다. 
    //TODO: 이렇게 하는게 맞나
    if(current_chatroom.sender === current_user.user_id){
        message.receiver = current_chatroom.receiver;
    }else{
        message.receiver = current_chatroom.sender;
    }
    
    return message;
}

//#6. 해당사용자가 존재하는지 확인합니다.
async function getFriendExist(friend_id){
    let friend_exist;
    let response = await fetch('/user/exist/'+friend_id);

    if(response.ok){
        friend_exist = response.json();
    }else{
        debug.print('친구 정보를 가져오는데 실패했습니다.');
        return false;
    }
    return friend_exist.exist;
}


export {logout, get_friend_list, init_get_chatroom_event, send_message_event, create_message,
     getCurrentChatRoomInfo, setCurrentChatRoomInfo, getCurrentUserInfo, setCurrentUserInfo,
    getJWT, setJWT, getFriendExist};