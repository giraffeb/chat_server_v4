import Dexie from 'dexie';
import Message from '../util/vo';
import * as api from '../api/api';

import * as debug from '../util/debug';

import socketEvent, {get, message, chatList} from '../redux/modules/socket_event';

Dexie.debug = true;

var dexie_db;
var db_config;

export function initDatabase_config(current_user_id){
    //#1. 데이터베이스 이름 생성하기.
    let db_name_prefix = "chatv2";
    let db_name = db_name_prefix + current_user_id;

    //#2. 데이터 베이스 테이블 스키마용 메시지 오브젝트 생성
    let message_obj = new Message();

    //#3. 테이블 스키마 만들기.
    let message_to_table_schme = setMessageSchema(message_obj);
    
    //#4. dexie-schme은 데이터 베이스 스키마를 정의합니다 = table의 합.

    db_config = {
        db_name: db_name,
        message_obj: message_obj,
        table_schema: message_to_table_schme,
        dexie_db_schema: {}
    }

    debug.print(db_config.message_schema);
    return ;
}

export function appendNewTable(friend_id){
    db_config.dexie_db_schema[friend_id] = db_config.table_schema;
}

/**
 * 테이블 스키마 문자열을 생성해서 반환합니다.
 * 메시지 인스턴스를 받아서, 객체 변수들을 이용해서 테이블 스키마 문자열을 생성합니다.
 */
export function setMessageSchema(message_obj){
    let dexie_schema = "";

    for(let key in message_obj){
        if(key === "reg_date"){
            dexie_schema = "++"+key+","+dexie_schema
        }
        dexie_schema += key+","
    }
    dexie_schema = dexie_schema.substr(0, dexie_schema.length-1);
    return dexie_schema;
}

/**
 * 친구목록의 유저별로 테이블 스키마를 생성합니다.
 * 사용자 아이디 : 테이블 스키마의 딕셔너리 형태로 반환합니다.
 */
export function createUserTableSchemaDict(new_table_list, message_obj){
    let result = {};

    for(let table_name of new_table_list){
        result[table_name] = setMessageSchema(message_obj);
    }

    return result;
}


/**
 * 어플리케이션이 처음 불려졌을때 데이터베이스 초기화하는 과정
 */
export async function initDatabase(friend_id_list){
    console.log('init Database call it');

    /**
     * 1. 데이터 베이스가 존재하는지 확인-> 없으면 생성
     * 2. 데이터베이스 테이블들을 생성한다. -> 이미 생성된 테이블은 제외한다.
     * 3. 
     */
    dexie_db = new Dexie(db_config.db_name);
    
    let new_table_list = friend_id_list;
    let db_version = 0;
    
    let flag = await Dexie.exists(db_config.db_name);
    if(flag === true){
        db_version = getIdxDBVersion(db_config.db_name);
    }
    
    let db_table_schema = createUserTableSchemaDict(new_table_list, new Message());
    db_config.dexie_db_schema = db_table_schema;

    if(flag === false){
        dexie_db.version(db_version+1).stores(db_table_schema);    
    }
    await dexie_db.open();

    //TODO: 메시지 넣는 과정. 서버에서 메시지 가져오는 기능이 구현되어 해야함.
    //로컬데이터 베이스와 동기화하는 과정인데, 아마도 키값이 유니크라서 크게 문제가 없지 않을까 싶긴합니다.
    for(let friend_id of friend_id_list){

        let chatroom = await api.init_get_chatroom_event(friend_id);
        // console.log("chatroom->", chatroom);

        if(chatroom !== null && chatroom !== undefined){
            await dexie_db.table(friend_id).bulkPut(chatroom.chat_list);
        }
    }

    let last_chatroom = [];
    if(friend_id_list.length > 0){
        console.log('i will fire chatlist');
        last_chatroom = await api.init_get_chatroom_event(friend_id_list[0]);
        
    }
    
    return last_chatroom;
}

//이녀석 때문에 몇일을 고생한겁니까 휴먼.
export async function addFriendDB(friend_id){
    //#1. 해당 유저가 존재하는지 부터 확인하자.
    let chatroom = await api.init_get_chatroom_event(friend_id);
    
    if(chatroom === null){
        console.log('해당 유저가 존재하지 않습니다.');
        return ;
    }
    
    //데이터 베이스가 열려있는지 확인: 일반적이라면 무조건 열려있읍미다만,
    
    appendNewTable(friend_id);
    console.log('db_config->',db_config);

    let current_idxdb_version = await getIdxDBVersion(db_config.db_name);
    
    if(dexie_db.isOpen() === true){
        dexie_db.close();
    }
    
    let state = {isOpen: dexie_db.isOpen(), version: current_idxdb_version, schme: db_config.dexie_db_schema}
    console.log('db_state check ->', state);
    let target = current_idxdb_version+1;
    console.log('target->', target);
    dexie_db.version(target).stores(db_config.dexie_db_schema);
    await dexie_db.open();

    let last_key = await dexie_db.table(friend_id).bulkPut(chatroom.chat_list);

    console.log('add friend over->', chatroom.chat_list);
    return last_key;
}

export function getIdxDBVersion(table_name){
    //dexieDB가 열려있는 상태에서도 접근이 가능한지 확인할 것.
    if(dexie_db.isOpen() === true){
        dexie_db.close();
    }

    let request = indexedDB.open(table_name);
    let current_db_version;

    return new Promise((resolve, reject)=>{
        request.onsuccess = (event)=>{
            let idxDb = event.target.result;
            let version = idxDb.version;
            idxDb.close();
            resolve(version);
        }
        request.onerror = (event)=>{
            reject(event);
        }
    }).then((version)=>{
        current_db_version = version;

        return current_db_version;
    }).catch((err)=>{
        console.log('indexedDb open Failed->', err);
    });
}

/**
 * 메시지를 저장하는 기능입니다.
 */
export async function saveMessageToDB(message_obj){
    let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
    
    console.log("current_user_id->", current_user_id);
    console.log("message->", message_obj);
    let table_name;
    if(current_user_id === message_obj.sender){
        table_name = message_obj.receiver;
    }else{
        table_name = message_obj.sender;
    }
    
    console.log(dexie_db);
    console.log('table_name->', table_name);
    dexie_db = await new Dexie(db_config.db_name).open();
    
    await dexie_db.table(table_name).put(message_obj);
    dexie_db.close();
}



//채팅방의 메시지 리스트를 읽어옵니다.
export async function loadMessageFromDB(friend_id){
    console.log("load message from db process...->",friend_id);
    dexie_db = await new Dexie(db_config.db_name).open();
    let result = await dexie_db.table(friend_id).toArray();    
    dexie_db.close();
    return result;
}
