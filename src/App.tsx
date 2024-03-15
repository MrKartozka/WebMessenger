import React, { useState } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";
import UserList from "./components/UserList";
import Chat from "./components/Chat";
import { useParams } from "react-router-dom";

function App() {
    const [currentUser, setCurrentUser] = useState<number | null>(null);

    console.log("Current User State:", currentUser);

    const handleLogin = (userId: number) => {
        console.log("Handling login with user ID:", userId);
        setCurrentUser(userId);
    };

    console.log("Current User State in App Component:", currentUser);

    const ChatWithParams = () => {
        let { userId } = useParams<{ userId: string }>();
        console.log("Chat With User ID:", userId);
        return userId ? (
            <Chat
                senderId={currentUser as number}
                userId={parseInt(userId, 10)}
            />
        ) : (
            <Navigate to="/users" replace />
        );
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={<LoginForm onLogin={handleLogin} />}
                />
                <Route
                    path="/register"
                    element={<RegistrationForm onRegister={handleLogin} />}
                />
                <Route
                    path="/users"
                    element={
                        currentUser ? (
                            <UserList currentUser={currentUser} />
                        ) : (
                            <Navigate replace to="/login" />
                        )
                    }
                />
                <Route
                    path="/chat/:userId"
                    element={
                        currentUser ? (
                            <ChatWithParams />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
