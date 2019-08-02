import React, {useState} from 'react';
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

import Input from '@material-ui/core/Input';


const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
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
}));

export default function Template() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Permanent drawer
          </Typography>
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
        <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <React.Fragment>
            <ChatArea />
        </React.Fragment>
      </main>
    </div>
  );
}

function ChatArea(props){
    const [chat_list, fn] = useState([{reg_date: 1 ,message: "hello"}, {reg_date: 2 ,message: "how are you"}]);

    return (
        <div>
            <ChatList chat_list={chat_list}></ChatList>
            <ChatInput></ChatInput>
        </div>
    )
}

function ChatList(props){
    return(
        <List>
            {
                props.chat_list.map((msg)=>
                    <ListItem key={msg.reg_date}>
                        <ListItemText>hello</ListItemText>
                    </ListItem>
                )
            }
        </List>
    )
}

function ChatInput(props){
    const inputMessge = (event)=>{

        if(event.key === 'Enter'){
            let text_area = event.target;
            let message_text = text_area.value;
            message_text = message_text.trim().replace('\n', '');

            alert(message_text);
            text_area.value = '';
        }
        
    };

    return(
        <div>
            <Input onKeyUp={inputMessge}></Input>
        </div>
    )
}
