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
}));

export default function Template() {
  const classes = useStyles();

  /**
   * 초기에 필요한 데이터를 가져오는 로직
   */

  const [friend_list, setFriendList] = useState([]);
  const [chat_list, setChatList] = useState([]);
  const [chat_title, setChatTitle] = useState([]);

  
  useEffect( ()=>{
    console.log('classes->', classes);
    
    //#1. 초기화정보를 서버에서 수신하는 이벤트
    socket.on('hello', async (data)=>{
      console.log('hello receive');
  
      if( data === null || data === undefined ){
          debug.print('hello 수신에서 문제가 발생했습니다.');
          return;
      }

      //#1. 현재 사용자 정보 저장.
      sessionStorage.setItem("currentUser", JSON.stringify(data));

      let current_user_id = data.user_id;
      let new_friend_list = data.friend_list;

      //현재 state 상태를 변경 해줍니다.
      setFriendList(new_friend_list);
      
      //#2. 데이터 베이스 정보 초기화
      dao.initDatabase_config(current_user_id);
      //#3, 데이터 베이스 초기화하기.
      await dao.initDatabase(new_friend_list);

      console.log('call the redraw()');
      await redraw();
      });

      //#2.메시지 수신시 작동하는 이벤트
      socket.on('message', async (msg)=>{

      //어떤 유저에게 왔는지, 현재 채팅방에 저장해야합니다.
      console.log('receive message');
      
      let current_chatroom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
      let current_user = JSON.parse(sessionStorage.getItem("currentUser"));

      /**
       * 클라이언트에 저장된 회원정보 중
       * 친구목록에 없는 사용자로부터 메시지가 올 경우 <- 새로운 친구가 추가되었고 상대방이 메시지를 보냈다는 의미이므로.
       */
      let f = current_user.friend_list.filter((friend_id)=>{
          if(friend_id === msg.sender){
              return true;
          }
      });

      if(f.length === 0){
          socket.emit('hello');
      }
      
      if(msg.chatroom_id === current_chatroom._id){
          console.log("current chatroom");
          
          dao.saveMessageToDB(msg);
          redraw();
      }else{
          console.log("not current chatroom ");
          if(current_user.user_id === msg.receiver){
              console.log("noti call ");
              
          }
          dao.saveMessageToDB(msg);
      }
      })


  });


  //채팅창에 데이터가 변경되면 호출됩니다.
  const redraw = async () =>{
    console.log('ChatArea redraw fire');

    let current_user = JSON.parse(sessionStorage.getItem('currentUser'));
    let current_chatroom = JSON.parse(sessionStorage.getItem('currentChatRoom'));

    let current_user_id = current_user.user_id;
    let friend_id;
    if(current_chatroom.sender === current_user_id){
      friend_id = current_chatroom.receiver;
    }else{
      friend_id = current_chatroom.sender;
    }

    console.log('loadMessageFromDb Test ->', friend_id);
    let message_list = await dao.loadMessageFromDB(friend_id);
    setChatList(message_list);
    setChatTitle(friend_id);
  }

  //친구목록 선택시 작동합니다.
  const selectChatRoom = async (event, friend_id)=>{
    console.log('select ChatRoom fire->', event);
    console.log(friend_id);
    //TODO: 채팅방 가져오기에 대해서 생각해보자.
    //서버에서 매번 가져오는게 맞나? 맞다면 로컬 데이터베이스의 의미는 뭘까?
    await api.init_get_chatroom_event(friend_id)
    redraw();
  }

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
          <FriendList friend_list={friend_list} clickHandler={selectChatRoom}></FriendList>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <React.Fragment>
            <ChatArea chat_title={chat_title} chat_list={chat_list} redraw={redraw} classes={classes}/>
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
              <ListItemText primary={text}/>
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
