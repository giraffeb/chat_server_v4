import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';

import { add_friend } from '../redux/modules/friendlist';

import * as api from '../api/api';

const useStyles = makeStyles({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    margin: '0 auto',
    width: '220px', //
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
});

export default function FindFriend() {
  const classes = useStyles();
  const [input_value, setInputValue] = useState('');
  const dispatch = useDispatch();

  const onChageHandle = (event)=>{
    setInputValue(event.target.value);

  };

  const fireFindFriend = ()=>{
    api.add_friend_event(input_value).then((boolean)=>{
        if(boolean === true){
            dispatch(add_friend(input_value)); 
        }
    }).catch((err)=>{
      console.log('add friend err!->', err);
    })
    
  };

  const onKeyUpHandle = (event)=>{
    if(event.key === 'Enter'){
        fireFindFriend();
        
    }
  };
  

  return (
    <Paper className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="친구를 찾아보세요"
        inputProps={{ 'aria-label': '친구를 찾아보세요' }}
        onChange={onChageHandle}
        onKeyUp={onKeyUpHandle}
      />
      <IconButton className={classes.iconButton} aria-label="search" onClick={fireFindFriend}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
