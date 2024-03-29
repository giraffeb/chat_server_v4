import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import Template from './react/Template';
import SignIn from './react/SignIn';
import SignUp from './react/SignUp';


import * as debug from './util/debug';
import * as api from './api/api';
import * as dao from './db/dexie_dao';


import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";

function App() {

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
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
    </Router>
  )
}

export default App;
