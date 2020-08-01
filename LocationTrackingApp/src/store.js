import {createStore} from 'redux';
import runnerReducer from './reducers/runner'

const store = createStore(runnerReducer);

export default store;