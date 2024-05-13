import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authType: "register",
  showAuthPage: true, // change this to false when page is done
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthType: (state, action) => {
      state.authType = action.payload;
    },
    setShowAuthPage: (state, action) => {
      state.showAuthPage = action.payload;
    },
  },
});

export const { setAuthType, setShowAuthPage } = authSlice.actions;
export default authSlice.reducer;
