import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import authReducer from './reducer/auth';
import drawerReducer from './reducer/drawer';
import localDataReducer from './reducer/localData';

const localDataPersistConfig = {
  key: 'localData',
  storage,
};

const combinedReducer = combineReducers({
  auth: authReducer,
  drawer: drawerReducer,
  localData: persistReducer(localDataPersistConfig, localDataReducer),
});

const rootReducer = (state, action) => {
  if (action.type === 'drawer/logout') {
    const localData = state?.localData;
    state = { localData };
    // TODO: need to create a fine grained local storage manager for managing the long persistance of data
    localStorage.removeItem("node");
  }
  return combinedReducer(state, action);
};

export default rootReducer;
