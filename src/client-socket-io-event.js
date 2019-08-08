import io from 'socket.io-client';
import * as api from './api';
import * as dao from './dexie_dao';
import * as debug from './debug';


let socket = io('http://localhost:8888');


/**
 * 
 * 1. 로그인한 사용자 정보 가져오기
 * 2. 사용자 정보에서 친구 목록 가져오기
 * 3. 친구 목록 중 가장 위에 있는 채팅방 가져오기
 */
// socket.on('hello', function(data){
//     //디버그 모드에서 콘솔로 값 확인.
//     debug.print('data receive->', data);
    

//     if( data === null || data === undefined ){
//         debug.print('hello 수신에서 문제가 발생했습니다.');
//         return;
//     }

//     sessionStorage.setItem("currentUser", JSON.stringify(data));

//     let current_user_id = data.user_id;
//     let friend_list = data.friend_list;
    
//     dao.initDatabase_config(current_user_id);
//     dao.initDatabase(friend_list);
// })

/**
 * 메시지 수신기능
 * 1. indexed db에 저장해야합니다.
 * 2. 디비 관련 로직은 여기에서 처리합니다.
 */
// socket.on('message', function(msg){
//     //어떤 유저에게 왔는지, 현재 채팅방에 저장해야합니다.
//     console.log('receive message');
    
//     let current_chatroom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
//     let current_user = JSON.parse(sessionStorage.getItem("currentUser"));

//     /**
//      * 클라이언트에 저장된 회원정보 중
//      * 친구목록에 없는 사용자로부터 메시지가 올 경우 <- 새로운 친구가 추가되었고 상대방이 메시지를 보냈다는 의미이므로.
//      */
//     let f = current_user.friend_list.filter((friend_id)=>{
//         if(friend_id === msg.sender){
//             return true;
//         }
//     });

//     if(f.length === 0){
//         // get_friend_list();
//     }
    
//     if(msg.chatroom_id === current_chatroom._id){
//         console.log("current chatroom");
//         // draw_message(msg);
//         dao.saveMessageToDB(msg);
//     }else{
//         console.log("not current chatroom ");
//         if(current_user.user_id === msg.receiver){
//             console.log("noti call ");
            
//         }
//         dao.saveMessageToDB(msg);
//     }
// })



export default socket;