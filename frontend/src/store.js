import { configureStore } from '@reduxjs/toolkit';

// Assuming you have a file that combines all your individual reducers
import { productReducer } from './reducers/productReducers';
// import rootReducer from './reducers/index.js';

const initialState = {};
// const middleware = [thunk]; // <-- Not needed anymore

const store = configureStore({
    // configureStore handles combining reducers, adding thunk middleware, 
    // and setting up DevTools automatically.
    reducer: productReducer,
    preloadedState: initialState,
    // You can optionally omit preloadedState if it's an empty object
});

export default store;