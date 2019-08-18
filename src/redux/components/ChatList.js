import React, { useState, useEffect, useRef } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';


const ChatList = (props)=>{
    let list_element = useRef(null);


    useEffect(()=>{
        list_element.current.scrollTop = list_element.current.scrollHeight;
    })
    
    return (
        <List id="chat_list" className={props.classes.chatlist} ref={list_element}>
            {
                props.chat_list.map((msg)=>{
                    let me = JSON.parse(sessionStorage.getItem('currentUser')).user_id;
                    let msg_class = props.classes.avator;
                    let messenger = msg.sender;

                    if(msg.sender === me){
                        msg_class = props.classes.orangeAvatar;
                        messenger = 'me';
                    }else{
                        msg_class = props.classes.purpleAvatar;
                    }
                    
                    return (<ListItem key={msg.reg_date}>
                        <ListItemAvatar>
                            <Avatar className={msg_class}>{messenger}</Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={msg.message} secondary={new Date(msg.reg_date).toISOString().slice(0,10)}></ListItemText>
                    </ListItem>
                    )}
                )
            }
        </List>
    )
}


export default ChatList;