import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userId: number | null;
    username: string | null;
    token: string | null;
}

const initialState: UserState = {
    userId: null,
    username: null,
    token: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{
                username: string;
                token: string;
                userId: number;
            }>
        ) => {
            state.userId = action.payload.userId;
            state.username = action.payload.username;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.userId = null;
            state.username = null;
            state.token = null;
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
