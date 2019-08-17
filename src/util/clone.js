//https://hyunseob.github.io/2016/02/08/copy-object-in-javascript/
//님의 코드를 사용했습니다.
//재귀적 코드
export const clone = (obj)=>{
    if(obj === null || typeof(obj) !== 'object'){
        return obj;
    }
    
    let copy = obj.constructor();

    for(let attr in obj){
        copy[attr] = clone(obj[attr]);
    }

    return copy;
}
    

export const copyState = (src_state)=>{
    let new_state = clone(src_state);

    return new_state;
}
