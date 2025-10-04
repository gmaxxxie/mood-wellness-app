import { configureStore } from '@reduxjs/toolkit';

// 简单的初始状态
const initialState = {
  user: null,
  emotions: [],
  recommendations: []
};

// 简单的reducer
const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_EMOTIONS':
      return { ...state, emotions: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    app: appReducer
  }
});