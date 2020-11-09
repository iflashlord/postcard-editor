import {
    combineReducers,
    createStore,
  } from 'redux';
  
  // actions 
  export const selectedItemType = selectedItemData => ({
    type: 'SELECTED_DATA',
    selectedItemData,
  });
  
 
  // reducers 
  export const selectedItemData = (state = {}, action) => {
    switch (action.type) {
      case 'SELECTED_DATA':
        return action.selectedItemData;
      default:
        return state;
    }
  };
  
  export const reducers = combineReducers({
    selectedItemData,
  });
  
  // store 
  export function configureStore(initialState = {}) {
    const store = createStore(reducers, initialState);
    return store;
  };
  
  export const store = configureStore();