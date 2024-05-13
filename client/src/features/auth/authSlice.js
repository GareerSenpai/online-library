import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authType: "register",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthType: (state, action) => {
      state.authType = action.payload;
    },
  },
});

export const { setAuthType } = authSlice.actions;
export default authSlice.reducer;
