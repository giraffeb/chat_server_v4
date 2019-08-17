module.exports = function(http, wrap){
    let User = require('../db/models/user');
    let ChatRoom = require('../db/models/chatroom');
    let jwt = require('../util/jwt');

    let io = require('socket.io')(http);
    io.serveClient('origins', '*:*');
    let cookieParser = require('socket.io-cookie-parser');

    io.use(cookieParser());

    io.on('connection', function(socket){

        socket.on('hi', wrap(async function(req, res, next){
            console.log('hi yo');
            socket.emit('hi server on');
        }));

        /**
         * 안녕하세요를 수행하면, ㄴㅇㄹ
         */
        socket.on('hello', wrap(async function(data, ack_fn){
            
            console.log('hello new world');
            console.log('data->', data);
            console.log('cookie->', socket.request.cookies.chatv2);
            let token = socket.request.cookies.chatv2;
            //쿠키토큰 인증 후에
            let result = jwt.verifyToken(token);
            if(result === null){
                socket.emit('token_expired');
                ack_fn('token_expired');
                return;
            }



            console.log(result);
            let current_user = await User.findOne({user_id: result.user_id});
            console.log('hello current user ->', current_user);
            socket.nickname = current_user.user_id;

            socket.emit('hello', current_user);

            //채팅방을 종료가 불가능하므로.
            //채팅방 기준으로 되어있는데, 채팅방을 만약 카톡처럼 지우고 생성할 수 있다면 다른 방식이 필요
            let chatroom_list = await ChatRoom.find({$or: [{sender: current_user.user_id}, {receiver: current_user.user_id}]}).distinct("_id");
            console.log('#chatroom_list->', chatroom_list);
            // chatroom_list.map((chatroom)=>{
            //     console.log('chatroom_id->', chatroom._id);
            //     socket.join(chatroom._id);
            // })
            
            ack_fn('ack');
        }));

        socket.on('find_friend', wrap(async function(data){
            let friend_id = data;

            let result = await User.findOne({user_id: friend_id});
            console.log('find_friend->', result);
            if(result === null){
                //어차피 널이지만 명시적으로
                socket.emit('find_friend', null);
            }else{
                socket.emit('find_friend', result);
            }
        }));

        socket.on('get_chatroom', wrap(async function(data){
            
            console.log('data->', data);
            let token = socket.request.cookies.chatv2;
            let result = jwt.verifyToken(token);
            let user_id = result.user_id;
            let friend_id = data;
            let result_chatroom = await ChatRoom.findOne({$or: [{sender:user_id, receiver: friend_id}, {sender:friend_id, receiver: user_id}]});
            console.log('result_chatroom->', result_chatroom);
            if(result_chatroom === null){
                //새로운 방 생성.
                result_chatroom = new ChatRoom();
                result_chatroom.sender = user_id;
                result_chatroom.receiver = friend_id;
                result_chatroom = await result_chatroom.save();
            }

            socket.emit('get_chatroom', result_chatroom);
        }));

        socket.on('message', wrap(async function(data){
            console.log('receive message->', data);

            let result = await ChatRoom.findOne({_id: data.chatroom_id});

            if(result !== null){
                result.chat_list.push(data);
                result = await result.save();
            }

            
            let temp_list = io.sockets.connected;

            // console.log(io.sockets.connected);
            let target = null;
            for(let t in io.sockets.connected){
                if(io.sockets.connected[t].nickname === data.receiver){
                    target = io.sockets.connected[t];
                    
                }

            }
            io.to(target.id).emit('message', data);
        }));

        socket.on('added_friend', wrap(async function(data){
            /**
             * let ChatRoom = new Schema({
                chatroom_title: String,
                sender: String,
                receiver: String,
                chat_list: Array,
                last_date: {type: Date, default: Date.now }
            })
             */
            let new_chatroom = new ChatRoom();
            new_chatroom.sender = data.sender;
            new_chatroom.receiver = data.receiver;

            await new_chatroom.save();

            for(let t in io.sockets.connected){
                if(io.sockets.connected[t].nickname === data.receiver){
                    io.sockets.connected[t].emit('added_friend', data);
                    break;
                }
            }
        }));

        socket.on('disconnecting', function(data){
            console.log("disconnecting call");
            console.log(data);
        })

    });
    

    return io;
}