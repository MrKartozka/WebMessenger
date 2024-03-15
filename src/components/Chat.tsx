import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { v4 as uuidv4 } from "uuid";
import "../styles/Chat.css";
import Message from "./Message";

interface ChatProps {
    userId: number | null;
    senderId: number | null;
}

interface Message {
    id: string;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
    isOwnMessage?: boolean;
    senderUsername?: string;
}

const Chat: React.FC<ChatProps> = ({ userId, senderId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const token = useSelector((state: RootState) => state.user.token);
    const currentUserId = useSelector((state: RootState) => state.user.userId);
    const chatSocket = io("http://localhost:5000");
    const [usernames, setUsernames] = useState<{ [key: number]: string }>({});

    // const [currentUsername, setCurrentUsername] = useState("");
    // const [chatPartnerUsername, setChatPartnerUsername] = useState("");

    const fetchUsername = async (userId: number) => {
        if (!usernames[userId]) {
            try {
                const response = await axios.get(
                    `http://localhost:5000/users/${userId}`
                );
                setUsernames((prevUsernames) => ({
                    ...prevUsernames,
                    [userId]: response.data.username,
                }));
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        }
    };

    useEffect(() => {
        messages.forEach((msg) => {
            fetchUsername(msg.senderId);
        });
    }, [messages]);

    useEffect(() => {
        if (currentUserId) {
            chatSocket.emit("joinRoom", { userId: currentUserId });
        }
    }, [currentUserId]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!token) {
                console.log("Token is not available in the Redux state.");
                return;
            }

            try {
                const response = await axios.get(
                    `http://localhost:5000/chat/${userId}/${senderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setMessages(
                    response.data.map((msg: any) => ({
                        ...msg,
                        senderId: msg.user_id,
                        isOwnMessage: msg.user_id === currentUserId,
                    }))
                );
            } catch (error) {
                console.error("Error fetching chat history:", error);
            }
        };

        fetchChatHistory();
    }, [userId, senderId, token, currentUserId]);

    useEffect(() => {
        const chatSocket = io("http://localhost:5000");

        chatSocket.on("connect", () => {
            chatSocket.emit("joinRoom", { userId: currentUserId });
        });

        chatSocket.on("receiveMessage", (incomingMessage) => {
            setMessages((currentMessages) => {
                const index = currentMessages.findIndex(
                    (message) => message.id === incomingMessage.tempId
                );
                if (index !== -1) {
                    const updatedMessages = [...currentMessages];
                    updatedMessages[index] = {
                        ...incomingMessage,
                        id: incomingMessage.tempId,
                        isOwnMessage:
                            incomingMessage.senderId === currentUserId,
                    };
                    return updatedMessages;
                } else {
                    const isOwn = incomingMessage.senderId === currentUserId;
                    return [
                        ...currentMessages,
                        {
                            ...incomingMessage,
                            isOwnMessage: isOwn,
                        },
                    ];
                }
            });
        });

        chatSocket.on("messageEdited", (editedMessage) => {
            setMessages((currentMessages) =>
                currentMessages.map((msg) =>
                    msg.id === editedMessage.id ? editedMessage : msg
                )
            );
        });

        chatSocket.on("messageDeleted", (deletedMessageId) => {
            setMessages((currentMessages) =>
                currentMessages.filter((msg) => msg.id !== deletedMessageId)
            );
        });

        return () => {
            chatSocket.off("connect");
            chatSocket.off("receiveMessage");
            chatSocket.disconnect();
        };
    }, [currentUserId]);

    const sendMessage = () => {
        if (newMessage.trim() && currentUserId) {
            const tempId = uuidv4();
            const messageToSend = {
                tempId,
                senderId: currentUserId as number,
                receiverId: userId as number,
                content: newMessage,
                createdAt: new Date().toISOString(),
            };
            chatSocket.emit("sendMessage", messageToSend);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    ...messageToSend,
                    id: tempId,
                    receiverId: messageToSend.receiverId as number,
                },
            ]);
            setNewMessage("");
        }
    };

    return (
        <div className="chat-container">
            <h2>Chat</h2>
            <div className="messages">
                {messages.map((msg, index) => (
                    <p
                        key={index}
                        className={
                            msg.isOwnMessage ? "own-message" : "other-message"
                        }
                    >
                        {msg.isOwnMessage
                            ? "You"
                            : usernames[msg.senderId] || "Loading..."}
                        : {msg.content}
                    </p>
                ))}
            </div>
            <input
                className="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
            />
            <button className="send-button" onClick={sendMessage}>
                Send
            </button>
        </div>
    );
};

export default Chat;
