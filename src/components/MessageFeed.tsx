import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import Message from "./Message";
import { io } from "socket.io-client";
import { addMessage } from "../redux/messageSlice";

const socket = io("http://localhost:5000");

const MessageFeed: React.FC = () => {
    const messages = useSelector((state: RootState) => state.message.messages);
    const currentUserUsername = useSelector(
        (state: RootState) => state.user.username
    );
    const dispatch = useDispatch();

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            console.log("Message received:", message);
            dispatch(addMessage(message));
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [dispatch]);

    return (
        <div>
            {messages.map((message) => (
                <Message
                    key={message.id}
                    id={message.id}
                    user={message.user}
                    content={message.content}
                    createdAt={message.createdAt}
                    canEdit={message.user === currentUserUsername}
                />
            ))}
        </div>
    );
};

export default MessageFeed;
