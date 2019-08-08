import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import Template from './Template';
import Signin from './signin';
import socket from './client-socket-io-event';

import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";



function App() {

  useEffect(()=>{
    console.log('hello 보내기를 등록합니다.');
    console.log('hello를 보냅니다.');
    
    socket.emit('hello','hellopara', (data)=>{
        
        console.log('hello emit ack -> ', data);
    });
  });

  return (
    <Router>
        <Route exact path="/"  render={()=>{
          let jwt = sessionStorage.getItem("jwt");
          if(jwt === null){
            console.log('jwt is');
            return (<Redirect to='/signin' />);
          }else{
            return (<Template />);
          }
        }}/>
        <Route path="/signin" component={Signin} />
    </Router>
  )
}

export default App;
