import React from "react";
import MessageFeed from "./MessageFeed";
import NewMessage from "./NewMessage";

const MainPage: React.FC = () => {
    return (
        <div>
            <h1>Main Page</h1>
            <NewMessage />
            <MessageFeed />
        </div>
    );
};

export default MainPage;
