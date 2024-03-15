import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
    id: string;
    user: string;
    content: string;
    createdAt: string;
}

interface MessageState {
    messages: Message[];
}

const initialState: MessageState = {
    messages: [],
};

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        addMessage: (state, action) => {
            console.log("Adding message:", action.payload);
            state.messages.push(action.payload);
            console.log("Updated state:", state.messages);
        },
        editMessage: (
            state,
            action: PayloadAction<{ id: string; content: string }>
        ) => {
            const index = state.messages.findIndex(
                (msg) => msg.id === action.payload.id
            );
            if (index !== -1) {
                state.messages[index].content = action.payload.content;
            }
        },
        deleteMessage: (state, action: PayloadAction<string>) => {
            const index = state.messages.findIndex(
                (msg) => msg.id === action.payload
            );
            if (index !== -1) {
                state.messages.splice(index, 1);
            }
        },
    },
});

export const { addMessage, editMessage, deleteMessage } = messageSlice.actions;
export default messageSlice.reducer;
