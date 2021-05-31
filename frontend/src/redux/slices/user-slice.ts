import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/users";

type UserState = User | null;

export const userSlice = createSlice({
  name: "user",
  initialState: null as UserState,
  reducers: {
    updateUser: (_, { payload }: PayloadAction<User | null>) => payload,
  },
});

export const { updateUser } = userSlice.actions;

export default userSlice.reducer;
