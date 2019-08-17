import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FriendList from '../components/FriendList';
import { chatList } from '../modules/socket_event';
import { getChatRoom } from '../modules/friendlist';

import * as dao from '../../db/dexie_dao';
import * as api from '../../api/api';

const FriendListContainer = ({classes}) => {
  const friend_list = useSelector(state => state.friendlist.friend_list);  
  const dispatch = useDispatch();

  useEffect(()=>{
        console.log('FriendListContainer Call it->', friend_list);
    },[friend_list]);


  const getChatroom = async (text)=>{
    let friend_id = text;
    console.log('getChatroom friend_id->', friend_id);
    let chat_list = await dao.loadMessageFromDB(friend_id);
    let current_chatroom = await api.init_get_chatroom_event(friend_id);
    
    sessionStorage.setItem('currentChatRoom', JSON.stringify(current_chatroom));
    
    //#1. 현재 채팅방으로 지정하기
    //#2. 현재 채팅방의 메시지 기록 가져오기
    //#3. 현재 채팅방 이름과 메시지기록을 dispatch() 해서 상태 변환하기
    //#4. 변화된 상태를 가지고 그려내기.
    dispatch(getChatRoom(friend_id));
    dispatch(chatList(friend_id, chat_list));
  }
  
  return (
    <FriendList classes={classes} friend_list={friend_list} getChatroom={getChatroom}/>
  );
};

export default FriendListContainer;