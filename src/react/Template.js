import React, {useState, useEffect} from 'react';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

import FindFriend from './FindFriend';
import FriendListContainer from '../redux/containers/FriendListContainer';
import ChatListContainer from '../redux/containers/ChatListContainer';


import * as api from '../api/api';
import * as debug from '../util/debug';


import { useSelector, useDispatch } from 'react-redux';

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
  avatar: {
    margin: 10,
  },
  orangeAvatar: {
    margin: 10,
    color: '#fff',
    backgroundColor: deepOrange[500],
  },
  purpleAvatar: {
    margin: 10,
    color: '#fff',
    backgroundColor: deepPurple[500],
  },
}));

export default function Template(props) {
  const classes = useStyles();

  //로그인 로그아웃
  //TODO: 위치가 여기가 맞나?
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
        <FindFriend classes={classes}></FindFriend>
        <FriendListContainer classes={classes}></FriendListContainer>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <React.Fragment>
            <ChatArea classes={classes} />
        </React.Fragment>
      </main>
    </div>
  );
}

//채팅 영역을 나타냅니다.
function ChatArea(props){
  
  const chat_title = useSelector((state)=>{
    console.log('ChatArea ->', state);
    return state.socket_event.current_chatroom.chat_title;
  }, []);
  // const [chat_title, fn] = useState([]);

    return (
        <div>            
            <Typography variant="h5" component="h6">
              current user: {chat_title}
            </Typography>
            <ChatListContainer classes={props.classes}></ChatListContainer>
            <ChatInput ></ChatInput>
        </div>
    )
}



//채팅입력 영역을 나타냅니다.
function ChatInput(props){
    const dispatch = useDispatch();
    
    
    return(
        <div>
            <Input onKeyUp={api.send_message_event}></Input>
        </div>
    )
}
