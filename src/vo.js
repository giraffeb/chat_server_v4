//메시지 형식 정의
export default function Message(){
    this.chatroom_id=null;
    this.sender=null;
    this.receiver=null;
    this.reg_date = Date.now();
    this.message=null;
};

