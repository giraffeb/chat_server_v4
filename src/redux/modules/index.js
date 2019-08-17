import { combineReducers } from 'redux';
import friendlist from './friendlist';
import socket_event from './socket_event';
import userinfo from './userinfo';

const rootReducer = combineReducers({
    friendlist,
    socket_event,
    userinfo
});

export default rootReducer;