import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ChatList from '../components/ChatList';

import * as dao from '../../db/dexie_dao';

const ChatListContainer = ({classes}) => {
    const chat_list = useSelector(state => state.socket_event.current_chatroom.chat_list, []);
    // const [chat_list, fn] = useState([]);
  
  return (
    <ChatList classes={classes} chat_list={chat_list} />
  );
};

export default ChatListContainer;