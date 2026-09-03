import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isGenesisAboutVisible: true,
};

export const localDataSlice = createSlice({
  name: 'localData',
  initialState,
  reducers: {
    hideGenesisAbout: (state) => {
      state.isGenesisAboutVisible = false;
    },
    // Future localStorage-based preferences can be added here
  },
});

export const { hideGenesisAbout } = localDataSlice.actions;

export default localDataSlice.reducer;
