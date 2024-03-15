import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const NewMessage: React.FC = () => {
    const [content, setContent] = useState("");
    const username = useSelector((state: RootState) => state.user.username);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (content && username) {
            const newMessage = {
                user: username,
                content,
                createdAt: new Date().toISOString(),
            };
            socket.emit("sendMessage", newMessage);
            setContent("");
        }
    };

    return (
        <form onSubmit={handleSend}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message here"
                required
            />
            <button type="submit">Send</button>
        </form>
    );
};

export default NewMessage;
