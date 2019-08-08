import Dexie from 'dexie';
import Message from './vo';
import * as api from './api';

import * as debug from './debug';


var dexie_db;
var db_config;



export function initDatabase_config(current_user_id){
    /**
     * 1. 데이터베이스 스키마 정의하기
     * 2. 데이터베이스 이름 생성하기.
     */
    // let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
    let db_name_prefix = "chatv2";
    let message_schema = new Message();
    
    let schme_string="";
    for(let key in message_schema){
        // debug.print('key->', key);
        if(key === "reg_date"){
            schme_string = key+","+schme_string    
        }
        schme_string += key+","
    }
    // debug.print(schme_string);
    schme_string = schme_string.substr(0, schme_string.length-1);

    db_config = {
        db_name: db_name_prefix+current_user_id,
        message_schema: schme_string
    }
    // debug.print(db_config.message_schema);
}

/**
 * 기존에 테이블이 정의 되어 있다면 테이블 정의는 제외하는 기능.
 * @param {} friend_id_list 
 */
export async function dbAndTableCheck(friend_id_list){
    console.log(friend_id_list);
    let result_friend_id_list=[];
    let dexie_db = await new Dexie(db_config.db_name).open();   
    let table_name_list = dexie_db.tables.map((table)=>{
        return table.name;
    });

    let len = friend_id_list.length;
    if(len === 0){
        
        return result_friend_id_list;       
    }else{
        let flag = true;
        for(let friend_id of friend_id_list){
            console.log('friend_id->', friend_id);
            for(let table_name of table_name_list){
                console.log('table_name->', table_name);
                if(friend_id === table_name){
                    flag = false;
                    break;
                }
            }
            if(flag === true){
                result_friend_id_list.push(friend_id);
            }
        }
    }
    return result_friend_id_list;
}


/**
 * 데이터 베이스가 존재하는지 확인
 * initDatabase()에서 호출됨.
 */
export async function isDatabase(){
    console.log('check this time');
    let database_exist_flag = false;
    
    try{
        
        let db = new Dexie(db_config.db_name);
        db.open();
        database_exist_flag = true;
        db.close();
    }catch(e){
        console.log(e);
    }
    return database_exist_flag;
}

export async function checkNewTable(friend_id_list){
    let new_table_list = [];

    try{
        let db = await new Dexie(db_config.db_name).open();
        let flag = true;
        let table_list = db.tables;

        for(let friend_id of friend_id_list){
            for(let table of table_list){
                if(friend_id === table.name){
                    flag = false;
                    break;
                }
            }
            if(flag === true){
                new_table_list.push(friend_id);
            }
        }
        db.close();
    }catch(e){
        console.log(e);
    }
    console.log("new_table_list->", new_table_list);
    return new_table_list;
}

export async function getDatabaseVersion(){
    let db = await new Dexie(db_config.db_name).open();
    let db_version = db.verno;
    db.close();

    return db_version;
}


/**
 * 테이블 스키마 문자열을 생성해서 반환합니다.
 * 메시지 인스턴스를 받아서, 객체 변수들을 이용해서 테이블 스키마 문자열을 생성합니다.
 */
export function setMessageSchema(message_obj){
    let dexie_schema = "";

    for(let key in message_obj){
        if(key === "reg_date"){
            dexie_schema = key+","+dexie_schema
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
    let db = new Dexie(db_config.db_name);

    let new_table_list = friend_id_list;
    let db_version = db.verno;
    
    let store_ob = createUserTableSchemaDict(new_table_list, new Message());
    db.version(db_version+1).stores(store_ob);
    db.open();

    //TODO: 메시지 넣는 과정. 서버에서 메시지 가져오는 기능이 구현되어 해야함.
    //로컬데이터 베이스와 동기화하는 과정인데, 아마도 키값이 유니크라서 크게 문제가 없지 않을까 싶긴합니다.
    for(let friend_id of friend_id_list){

        let chatroom = await api.init_get_chatroom_event(friend_id);
        console.log("chatroom->", chatroom);

        if(chatroom !== null && chatroom !== undefined){
            await db.table(friend_id).bulkPut(chatroom.chat_list);
        }
    }

    if(friend_id_list.length > 0){
        await api.init_get_chatroom_event(friend_id_list[0]);
    }
    

    db.close();
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


export async function loadMessageFromDB(friend_id){
    console.log("load message from db process...->",friend_id);
    dexie_db = await new Dexie(db_config.db_name).open();
    let result = await dexie_db.table(friend_id).toArray();    
    dexie_db.close();
    return result;
}


//test 
export async function syncTest(friend_id){
    let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    let result;
    if(response.ok){
        result = await response.json();
        console.log('sync test get result->', result);
        sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
    }else{
        console.log('채팅방을 가져오지 못했습니다.');
        alert('채팅방을 가져오지 못했습니다.');
        return;
    }


    dexie_db = await new Dexie(db_config.db_name).open();
    let res = await dexie_db.table(friend_id).bulkPut(result.chat_list);

    dexie_db.close();
}