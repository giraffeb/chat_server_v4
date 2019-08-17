import {createStore} from 'redux';
import rootReducer from '../modules/';

import { composeWithDevTools } from 'redux-devtools-extension';

function initStore(){
    let new_store = createStore(rootReducer, composeWithDevTools());
    return new_store;
}

let store = initStore();

export {store as default, initStore};