import * as debug from '../util/debug';
import Message from '../util/vo';


import * as dao from '../db/dexie_dao';
import socket, {setSocketListen, socketSendEvent} from '../socket-io-client/client-socket-io-interface';
import store from '../redux/store/mystore';
import {chatList} from '../redux/modules/socket_event';


// //#0 로그아웃 기능.
function logout(){
    sessionStorage.removeItem('jwt');
    window.open('/logout', '_self');
    
}



// //#1. 친구추가기능 이벤트 추가하는 역할
// export async function add_friend(){
    
//     let result;
//     let input_ele = document.getElementById("find_friend");
    
//     input_ele.onkeyup = (event)=>{
//         let friend_id;
//         if(event.key === "Enter"){
//             friend_id = event.srcElement.value;
//             friend_id = friend_id.trim().replace('\n', '');
//             //event 
//             add_friend_event(friend_id);
//             input_ele.value = "";
//         }
//     } 
// }

// //#1-1. 친구아이디 입력후 엔터시 이벤트
export async function add_friend_event(friend_id){
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
    let result;
    
    if(response.ok){
        //서버ㅔ서 해당 사용자 정보 가져옴.
        result = await response.json();
        console.log('친구 추가 정상적완료');
        //상대방에게 친구추가가 되었음을 알리고, 상대방도 등록하게함.
        // let db_ver = await dao.getCurrentDBVersion();
        // dao.testdb(friend_id, db_ver+1);
        dao.addFriendDB(friend_id);
        socket.emit('added_friend', friend_id);
        return true;
    }else{
        //해당 사용자가 없는 등 정상적인 응답이 아니라면
        result = await response.json();
        console.log('not found user->', result);
        alert('해당 유저가 존재하지 않습니다.');
        return false;
    }
}

// //#1-2 친구추가 html그릴 엘리먼트 생성
// export function create_friend_element(friend_id){
//     let friend_li_element = document.createElement('li');
//     let friend_id_span = document.createElement('span');
//     let message_noti_span = document.createElement('span');

//     message_noti_span.setAttribute('class', 'badge badge-danger');
//     message_noti_span.innerHTML = 0;
//     friend_id_span.innerHTML = friend_id;

//     friend_li_element.append(friend_id_span);
//     friend_li_element.append(message_noti_span);

//     friend_li_element.setAttribute('id', friend_id);
//     friend_li_element.onclick = get_chatroom_event;
//     return friend_li_element;
// }


//#2. 친구 목록 가져오기
async function get_friend_list(){
    //hello에서 가져온 현재 유저 정보의 친구목록에서 친구 아이디값을 가져옴
    let current_user = JSON.parse(sessionStorage.getItem("currentUser"));
    //친구 아이디값으로 다시 서버에서 정보를 가져옴.
    let response = await fetch('/friend/'+current_user.user_id, {method: "GET"});
    let friend_id_list = null;

    //서버에서 친구 목록을 가져왔다면
    if(response.ok){
        friend_id_list = await response.json();
    }

    return friend_id_list;
}

//#3. hello시 친구에 해당하는 채팅방을 가져옴. 클라이언트 디비에 저장하는데 사용됨.
async function init_get_chatroom_event(friend_id){
    console.log('넘어온 friend_id->', friend_id);
    // let friend_id = event.srcElement.innerHTML;

    let result;

    // let friend_id = event.srcElement.innerHTML;
    let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    
    if(response.ok){
        result = await response.json();
        sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
    }else{
        //TODO: 채팅을 한번도 하지 않은 경우 채팅방이 생성되지 않았을 수 있습니다
        //
        debug.print('채팅방을 가져오지 못했습니다.->', friend_id);
        return ;
    }
    
    return result;
}

// //#4. 친구 목록에 추가된 친구 클릭시 발생하는 이벤트
// export async function get_chatroom_event(event){
//     console.log('get_chatroom_event call it');
//     let friend_id = event.srcElement.innerHTML;
//     let message_list;

//     let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    
//     if(response.ok){
//         let result = await response.json();
//         sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
//     }else{
//         console.log('채팅방을 가져오지 못했습니다.');
//         alert('채팅방을 가져오지 못했습니다.');
//         return ;
//     }

//     try{
//         //indexedDB에서 가져오십시오.
//         message_list = await dao.loadMessageFromDB(friend_id);    
//     }catch(e){
//         console.log('get_chatroom_event catch');
//         return;
//     }

//     // console.log('exist_result->', exist_result);
//     // // let message_list = await load_chat_message_from_indexeddb(friend_id);
//     // console.log(message_list);

//     draw_chatroom(message_list);
//     let friend_ele = document.getElementById(friend_id);
//     let noti_ele = friend_ele.querySelector(".badge.badge-danger");

//     noti_ele.innerHTML = 0;
// }

// //#4. 유틸리티로 친구아이드로 채팅방 가져오기 init과 차이점은 indexeddb에서 가져온다는 것.
// export async function get_chatroom_event_by_friend_id(friend_id){
//     console.log('get_chatroom_event call it');
//     let exist_result;
//     let message_list;

//     let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    
//     if(response.ok){
//         let result = await response.json();
//         sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
//     }else{
//         console.log('채팅방을 가져오지 못했습니다.');
//         alert('채팅방을 가져오지 못했습니다.');
//         return ;
//     }

//     try{
//         //indexedDB에서 가져오십시오.
//         message_list = await dao.loadMessageFromDB(friend_id);    
//     }catch(e){
//         console.log('get_chatroom_event catch');
//         return;
//     }

//     // console.log('exist_result->', exist_result);
//     // // let message_list = await load_chat_message_from_indexeddb(friend_id);
//     // console.log(message_list);

//     draw_chatroom(message_list);
// }


// //#5. 화면에 표시할 메시지를 그립니다.
// export function create_message_element(message){
//     let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
//     let message_li = document.createElement('li');

//     let sender_span = document.createElement('span');
//     if(message.sender === current_user_id){
//         sender_span.innerHTML = "나";
//     }else{
//         sender_span.innerHTML = message.sender;
//     }
    
//     let reg_date_span = document.createElement('span');
//     let formatted_date = new Date(message.reg_date).toLocaleString('ko-KR').substr(13);
//     reg_date_span.innerHTML = "("+formatted_date+"): "
//     let message_span = document.createElement('span');
//     message_span.innerHTML = message.message;
    
//     message_li.append(sender_span);
//     message_li.append(reg_date_span);
//     message_li.append(message_span);

//     return message_li;
// };

// //#6. 메시지 리스트를 받아서 화면에 그립니다. 채팅방을 가져올때 호출됩니다.
// export function draw_chatroom(message_list){
//     let chatroom_title = document.getElementById("chatroom_title");
//     let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
//     let currentChatRoom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
//     let title = "";
//     if(currentUser.user_id === currentChatRoom.sender){
//         title = currentChatRoom.receiver;
//     }else{
//         title = currentChatRoom.sender;
//     }
    
//     chatroom_title.innerHTML = title;
//     console.log('draw chatroom call it');
    
//     let chat_area = document.getElementById('chat_area');
//     let chat_list = document.getElementById('chat_list');
//     chat_list.innerHTML = "";

//     for(let message of message_list){
//         console.log(message);
//         let message_li = create_message_element(message);
//         chat_list.append(message_li);
//     }

//     chat_list.scrollTop = chat_list.scrollHeight;
// }

// //#7. 단일 메시지를 채팅방에 표시합니다.
// export function draw_message(message){
//     let chat_area = document.getElementById('chat_area');
//     let chat_list = document.getElementById('chat_list');
//     let message_li = create_message_element(message);
    
//     chat_list.append(message_li);
//     chat_list.scrollTop = chat_list.scrollHeight;
//     console.log("chat_list.scrollTop->", chat_list.scrollTop);
//     console.log("chat_list.scrollHeight->", chat_list.scrollHeight);
// }

// //TODO: 이벤트 타이밍을 명확하게 다시 처리해줘야합니다.
// //이벤트 등록
// logout();
// add_friend();
// send_message_event();


// //#8. chatting messgae 보내기
// //보내는 내용을 현재 클라이언트의 indexeddb에 저장합니다.
async function send_message_event(event){

    if(event.key === 'Enter'){
        let text_area = event.target;
        let message_text = text_area.value;

        message_text = message_text.trim()
        message_text = message_text.replace('\n', '');

        if(message_text.length === 0){
            return;
        }
        
        let new_message = create_message(message_text);

        socketSendEvent.sendMessage(new_message);
        text_area.value = '';

        let current_chatroom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
        let current_user = JSON.parse(sessionStorage.getItem("currentUser"));
        let friend_id;
        if(current_chatroom.sender === current_user.user_id){
          friend_id = current_chatroom.receiver;
        }else{
          friend_id = current_chatroom.sender;
        }
        
        await dao.saveMessageToDB(new_message);
        let new_chat_list = await dao.loadMessageFromDB(friend_id);
        store.dispatch(chatList(friend_id, new_chat_list));
    }
}

// //#9. 사용지 정보를 이용해서 메시지 형식을 완성 후 리턴합니다.
function create_message(msg){
    let current_user = JSON.parse(sessionStorage.getItem("currentUser"));
    let current_chatroom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
    let message = new Message();
    message.chatroom_id = current_chatroom._id;
    message.sender = current_user.user_id;
    message.message = msg;
    if(current_chatroom.sender === current_user.user_id){
        message.receiver = current_chatroom.receiver;
    }else{
        message.receiver = current_chatroom.sender;
    }
    
    return message;
}


export {logout, get_friend_list, init_get_chatroom_event, send_message_event, create_message};