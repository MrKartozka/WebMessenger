import React from "react";
import { io } from "socket.io-client";

// const SERVER_URL = "http://localhost:5000";
const socket = io("http://localhost:5000");

interface MessageProps {
    id: string;
    user: string;
    content: string;
    createdAt: string;
    canEdit: boolean;
}

const Message: React.FC<MessageProps> = ({
    id,
    user,
    content,
    createdAt,
    canEdit,
}) => {
    const handleEdit = () => {
        const newContent = prompt("Edit your message:", content);
        if (newContent && newContent !== content) {
            socket.emit("editMessage", { id, content: newContent });
        }
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            socket.emit("deleteMessage", id);
        }
    };

    return (
        <div>
            <p>{content}</p>
            <small>
                From: {user} at {new Date(createdAt).toLocaleString()}
            </small>
            {canEdit && (
                <div>
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
        </div>
    );
};

export default Message;
