
export function setDebugFlag(flag){
    sessionStorage.setItem('debug', flag);
}

export function getDebugFlag(flag){
    return sessionStorage.getItem('debug');
}

export function print(msg, ...optioanl){
    if(getDebugFlag() === 'true'){
        console.log(msg, optioanl);
    }
}
//기본 설정값
setDebugFlag('true');