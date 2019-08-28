import io from 'socket.io-client';

import * as api from '../api/api';
import * as dao from '../db/dexie_dao';
import * as debug from '../util/debug';

import socket from './client-socket-io-common';
import * as sendSocketEvent from './client-socket-io-send';


import friendlist, {get, message, add_friend } from '../redux/modules/friendlist';
import userinfo, { set_user_info } from '../redux/modules/userinfo';
import socketEvent, {hello, chatList} from '../redux/modules/socket_event';
//socket.io 클라이언트 이벤트를 수신하고 처리합니다.
/**
 * 
 * @param {store: redux} store 
 */
function setSocketListen(store){
    
    //#1. 소켓 생성
    // let socket = io('http://localhost:8888');

    /**
     * 
     * 1. 로그인한 사용자 정보 가져오기
     * 2. 사용자 정보에서 친구 목록 가져오기
     * 3. 친구 목록 중 가장 위에 있는 채팅방 가져오기
     */
    socket.on('hello', async function(current_user){
        //디버그 모드에서 콘솔로 값 확인.
        debug.print('hello data receive->', current_user);
        
        if( current_user === null || current_user === undefined ){
            debug.print('hello 수신에서 문제가 발생했습니다.');
            return;
        }

        //사용자 정보 저장.
        api.setCurrentUserInfo(current_user);
        
        let current_user_id = current_user.user_id;
        let friend_id;

        let friend_list = current_user.friend_list;
        let token = api.getJWT();
        
        await dao.initDatabase_config(current_user_id);
        let last_chatroom = await dao.initDatabase(friend_list);

        if(current_user_id === last_chatroom.sender){
            friend_id = last_chatroom.receiver;
        }else{
            friend_id = last_chatroom.sender;
        }

        //스토어에서 상태를 관리할 로그인 사용자, 친구, 토큰
        //TODO: 사실 사용되지 않음. 사용법
        store.dispatch(set_user_info(current_user_id, friend_id, token));
        
        //TODO: 의미가 없다. 테스트 후 삭제하자.
        store.dispatch(hello());
        
        //스토어에 친구목록을 업데이트 하자.
        store.dispatch({type: 'friends/GET', friend_list: friend_list});
        //스토어에 현재 채팅방의 사용자와 채팅목록을 관리한다
        store.dispatch(chatList(friend_id ,last_chatroom.chat_list));
    })

    /**
     * 메시지 수신기능
     * 1. indexed db에 저장해야합니다.
     * 2. 디비 관련 로직은 여기에서 처리합니다.
     */
    socket.on('message', async function(msg){
        //어떤 유저에게 왔는지, 현재 채팅방에 저장해야합니다.
        debug.print('receive message');
        
        let current_chatroom = api.getCurrentChatRoomInfo();
        //현재 채팅방이면 저장처리하고 상태변경을 해준다.
        
        if(current_chatroom !== undefined){
            if(msg.chatroom_id === current_chatroom._id){
                debug.print("current chatroom");
    
                //메시지 저장하기
                await dao.saveMessageToDB(msg);
                
                //저장 후 채팅 리스트 가져오기
                let new_chat_list = await dao.loadMessageFromDB(msg.sender);
                
                //채팅리스트 상태 변경해주기.
                store.dispatch(chatList(msg.sender, new_chat_list));
            }
        }
        else{
            debug.print("not current chatroom ");
            //메시지가 왔음을 상태로 알림
            store.dispatch(message(msg));
            //데이터베이스에 저장함.
            await dao.saveMessageToDB(msg);
        }
        
    })

    //상대방이 친구추가를 했음을 알리는 이벤트
    socket.on('added_friend', (data)=>{
        debug.print('add_friend_recieve', data);
        
        //TODO: 이 api는 반드시 내부를 리팩토링해야합니다,
        dao.addFriendDB(data.sender);
        //상태를 친구 리스트 상태를 변화시킵니다.
        store.dispatch(add_friend(data.sender));
    })
    
return socket;
}

export {setSocketListen as default};