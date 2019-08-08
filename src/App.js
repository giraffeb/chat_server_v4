import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import Template from './Template';
import Signin from './signin';

import socket from './client-socket-io-event';
import * as debug from './debug';
import * as api from './api';
import * as dao from './dexie_dao';

import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";



function App() {

  const [hello, setHello] = useState(0);
  const [socketEvent, setSocketEvent] = useState(0);
  const [friend_list, setFriendList] = useState([]);
  const [chat_list, setChatList] = useState([]);
  const [chat_title, setChatTitle] = useState([]);

  
  useEffect( ()=>{
    console.log("#APP USE EFFECT() call");
    let count = Number(sessionStorage.getItem("app"));
    if(count === null){
      count = 0;
    }
    sessionStorage.setItem("app", count+1);

    console.log('hello 보내기를 등록합니다.');
    console.log('hello를 보냅니다.');
    
    if(hello === 0){
      socket.emit('hello','hellopara', (data)=>{
        
        console.log('hello emit ack -> ', data);
      });
      setHello(1);
    }
    
    if(socketEvent === 0){
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
      // let f = current_user.friend_list.filter((friend_id)=>{
      //     if(friend_id === msg.sender){
      //         return true;
      //     }
      // });

      // if(f.length === 0){
      //     //
      // }
      
      if(msg.chatroom_id === current_chatroom._id){
          console.log("current chatroom");
          
          await dao.saveMessageToDB(msg);
          redraw();
      }else{
          console.log("not current chatroom ");
          if(current_user.user_id === msg.receiver){
              console.log("noti call ");
              messageNoti(msg.sender);
              
          }

          await dao.saveMessageToDB(msg);

          let current_friend_list = JSON.parse(sessionStorage.getItem('currentUser')).friend_list;
          setFriendList(current_friend_list);
          
      }
      })

      setSocketEvent(1);
    }
    

  });

  const messageNotiList = ()=>{
    let friend_list = JSON.parse(sessionStorage.getItem('currentUser'));
    friend_list.map((friend_id)=>{
      messageNoti(friend_id);
    })
  }

  const messageNoti = (friend_id)=>{
    let count = Number(sessionStorage.getItem(friend_id));
    sessionStorage.setItem(friend_id, count + 1);
  }


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
    sessionStorage.setItem(friend_id, 0);
    redraw();
  }

  return (
    <Router>
        <Route exact path="/"  render={()=>{
          let jwt = sessionStorage.getItem("jwt");
          if(jwt === null){
            console.log('jwt is');
            return (<Redirect to='/signin' />);
          }else{
            return (<Template chat_list={chat_list} friend_list={friend_list} chat_title={chat_title} redraw={redraw} selectChatRoom={selectChatRoom}/>);
          }
        }}/>
        <Route path="/signin" component={Signin} />
    </Router>
  )
}

export default App;
