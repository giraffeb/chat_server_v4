import React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import Badge from '@material-ui/core/Badge';
import MailIcon from '@material-ui/icons/Mail';



const FriendList = ({friend_list, getChatroom, classes})=>{


    return (
        <List>
        {Object.keys(friend_list).map((text, index) => (
          
          //TODO: 클릭시 이벤트 정리하기.
          <ListItem button key={text}  onClick={(event)=>{getChatroom(text);}}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <Badge className={classes.padding} color="secondary" badgeContent={friend_list[text]}>
            <ListItemText primary={text}/>
            </Badge>
          </ListItem>
        
        ))}
      </List>
    )
}


export default FriendList;