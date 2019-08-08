import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';


import Input from '@material-ui/core/Input';

import socket from './client-socket-io-event';
import * as api from './api';
import * as dao from './dexie_dao';
import * as debug from './debug';


const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  title:{
    flexGrow: 1
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  chatlist:{
    height: 400,
    overflow: 'scroll',
  },
  margin: {
    margin: theme.spacing(2),
  },
  padding: {
    padding: theme.spacing(0, 2),
  },
}));

export default function Template(props) {
  const classes = useStyles();

  useEffect(()=>{
    console.log('#props->', props);
  });

  //로그인 로그아웃
  const loginandout = (event)=>{
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentChatRoom');

    window.open('/logout', '_self');
  }

  return (
    <div className={classes.root} >
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap className={classes.title}>
            Chat v3
          </Typography>
          <Button color="inherit" onClick={loginandout}>Logout</Button>
        </Toolbar>
        
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.toolbar} />
        <Divider />
          <FriendList friend_list={props.friend_list} clickHandler={props.selectChatRoom} classes={classes}></FriendList>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <React.Fragment>
            <ChatArea chat_title={props.chat_title} chat_list={props.chat_list} redraw={props.redraw} classes={classes}/>
        </React.Fragment>
      </main>
    </div>
  );
}


//친구목록을 나타냅니다
function FriendList(props){
  return (
    <List>
          {props.friend_list.map((text, index) => (
            
            <ListItem button key={text}  onClick={(event)=>props.clickHandler(event, text)}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <Badge className={props.classes.padding} color="secondary" badgeContent={sessionStorage.getItem(text)}>
              <ListItemText primary={text}/>
              </Badge>
            </ListItem>
          
          ))}
        </List>
  )  
}

//채팅 영역을 나타냅니다.
function ChatArea(props){

    return (
        <div>            
            <Typography variant="h5" component="h6">
              current user: {props.chat_title}
            </Typography>
            <ChatList chat_list={props.chat_list} classes={props.classes}></ChatList>
            <ChatInput  redraw={props.redraw} ></ChatInput>
        </div>
    )
}

//채팅 영역 중 메시지 리스트를 출력합니다.
function ChatList(props){
    useEffect(()=>{
      
      let chat_list_element = document.getElementById('chat_list');
      chat_list_element.scrollTop = chat_list_element.scrollHeight;
      console.log('chat_list use effect->',chat_list_element.scrollTop, chat_list_element.scrollHeight);
      

    },[props.chat_list]);

    return(
        <List id="chat_list" className={props.classes.chatlist}>
            {
                props.chat_list.map((msg)=>
                    <ListItem key={msg.reg_date}>
                        <ListItemText>{msg.message}</ListItemText>
                    </ListItem>
                )
            }
        </List>
    )
}

//채팅입력 영역을 나타냅니다.
function ChatInput(props){
    const inputMessge = async (event)=>{

        //채팅 전송을 처리하는 이벤트입니다.
        if(event.key === 'Enter'){
            let text_area = event.target;
            let message_text = text_area.value;
            message_text = message_text.trim().replace('\n', '');


            text_area.value = '';

            let new_message = api.create_message(message_text);
            console.log('send message->', new_message);
            socket.emit('message', new_message);
            await dao.saveMessageToDB(new_message);
            await dao.loadMessageFromDB(new_message.receiver);

            //fire redraw()
            props.redraw();

        }
        
    };

    return(
        <div>
            <Input onKeyUp={inputMessge}></Input>
        </div>
    )
}
