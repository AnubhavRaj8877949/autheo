import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: true,
};

export const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    toggleSidebar: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar } = drawerSlice.actions;

export default drawerSlice.reducer;
