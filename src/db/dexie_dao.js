import Dexie from 'dexie';
import Message from '../util/vo';
import * as api from '../api/api';

import * as debug from '../util/debug';

import socketEvent, {get, message, chatList} from '../redux/modules/socket_event';

Dexie.debug = true;

var dexie_db;
var db_config;

//#1. 어플리케이션 시작시
// 데이터 베이스 정보 초기화하기
export function initDatabase_config(current_user_id){
    //#1. 데이터베이스 이름 생성 
    let db_name_prefix = "chatv2";//기본프리픽스
    let db_name = db_name_prefix + current_user_id;

    //#2. 데이터 베이스 테이블 스키마용 메시지 오브젝트 생성
    let message_obj = new Message();

    //#3. 테이블 스키마 만들기.
    let message_to_table_schme = setMessageSchema(message_obj);
    
    //#4. dexie-schme은 데이터 베이스 스키마를 정의합니다 = table의 합.

    db_config = {
        db_name: db_name, //데이터 베이스 이름.
        message_obj: message_obj, //테이블 스키마에 사용되는 메시지 스키마
        table_schema: message_to_table_schme, //테이블 고정 스키마
        dexie_db_schema: {} //데이터베이스 전체 테이블 스키마
    }

    debug.print(db_config.message_schema);
    return ;
}

/**
 * #2. 어플리케이션이 처음 불려졌을때 데이터베이스 초기화하는 과정
 * initDatabase_config() 후에 실행됩니다.
 */
export async function initDatabase(friend_id_list){
    debug.print('init Database call it');

    //dexie 객체 생성
    dexie_db = new Dexie(db_config.db_name);
    
    let new_table_list = friend_id_list;
    let db_version = 0;//기본적으로는 0
    
    //인덱스이비가 존재하는지 확인.
    let flag = await Dexie.exists(db_config.db_name);
    if(flag === true){
        //존재한다면 버전을 가져온다.
        db_version = getIdxDBVersion(db_config.db_name);
    }
    
    //친구리스트를 이용해서 데이터베이스의 스키마를 생성한다.
    let db_table_schema = createUserTableSchemaDict(new_table_list, new Message());
    
    //디비 정보에 저장한다.
    db_config.dexie_db_schema = db_table_schema;

    //데이터 베이스가 존재하지 않는다면,
    //해당 테이블을 생성을 설정한다.
    if(flag === false){
        dexie_db.version(db_version+1).stores(db_table_schema);    
    }
    
    //데이터베이스를 연결하면서 스키마를 구성한다.
    await dexie_db.open();

    //로컬데이터 베이스와 동기화하는 과정인데, 아마도 키값이 유니크라서 크게 문제가 없지 않을까 싶긴합니다.
    let last_chatroom = [];
    //친구목록에 1개이상이라면
    if(friend_id_list.length > 0){
        //해당 친구만큼 채팅방을 가져와서 저장한다.
        for(let friend_id of friend_id_list){
            let chatroom = await api.init_get_chatroom_event(friend_id);
    
            //채팅방이 존재하지 않는다면, 채팅내용을 넣지 않는다.
            //TODO: 친구등록시 채팅방이 생성되므로 문제가 사실상 작동하지 않을 것.
            if(chatroom !== null && chatroom !== undefined){
                await dexie_db.table(friend_id).bulkPut(chatroom.chat_list);
            }
        }

        //가장 첫번째 채팅방의 정보를 화면에 출력하기 위해서 반환합니다.
        if(friend_id_list.length > 0){
            console.log('i will fire chatlist');
            //TODO: 매번 서버에서 가져오는게 맞나, 그럼 인덱스드 디비에는 왜 저장할까? 생각해봐야합니다.
            last_chatroom = await api.init_get_chatroom_event(friend_id_list[0]);
            
        }
    }
    return last_chatroom;
}

//#3. 데이터 베이스에 친구추가된 테이블 스키마를 추가합니다.
export function appendNewTable(friend_id){
    db_config.dexie_db_schema[friend_id] = db_config.table_schema;
}

/**
 * #4. 메시지 인스턴스를 받아서, 객체 변수들을 이용해서 덱시 테이블 스키마 문자열을 생성합니다.
 */
export function setMessageSchema(message_obj){
    let table_schema = "";

    for(let key in message_obj){
        if(key === "reg_date"){
            //reg_date를 인덱스로 처리합니다.
            //++: auto increment, primarykey
            table_schema = "++"+key+","+table_schema
        }
        table_schema += key+","
    }
    //맨뒤의 ','문자열 제거
    table_schema = table_schema.substr(0, table_schema.length-1); 
    return table_schema;
}

/**
 * #5. 친구목록의 유저별로 테이블 스키마를 생성합니다.
 * 사용자 아이디 : 테이블 스키마의 딕셔너리 형태로 반환합니다.
 */
export function createUserTableSchemaDict(new_table_list, message_obj){
    let result = {};

    //각각 테이블에 스키마입력
    for(let table_name of new_table_list){
        result[table_name] = setMessageSchema(message_obj);
    }

    return result;
}


//#6. 친구추가시 처리함.
export async function addFriendDB(friend_id){
    //#1. 해당 유저가 존재하는지 부터 확인하자. 호출하기 전에 확인됨.
    //해당 채팅방이존재하는지 확인하는 것.
    //*

    appendNewTable(friend_id);
    let current_idxdb_version = await getIdxDBVersion(db_config.db_name);
    
    //데이터 베이스가 열려있는지 확인: 일반적이라면 무조건 열려있읍미다만,
    if(dexie_db.isOpen() === true){
        dexie_db.close();
    }
    
    dexie_db.version(current_idxdb_version+1).stores(db_config.dexie_db_schema);
    try{
        await dexie_db.open();
    }catch(err){
        debug.print('add Friend err->', err);
        return false;
    }
    

    debug.print('add friend over->');
    return true;
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
