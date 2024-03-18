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
import "./styles/MessengerLayout.css";
import Profile from "./components/Profile";

function App() {
    const [currentUser, setCurrentUser] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    console.log("Current User State:", currentUser);

    const handleLogin = (userId: number) => {
        console.log("Handling login with user ID:", userId);
        setCurrentUser(userId);
    };

    const handleUserSelection = (userId: number) => {
        setSelectedUserId(userId);
    };

    console.log("Current User State in App Component:", currentUser);

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
                            <div className="messenger-layout">
                                <aside className="sidebar">
                                    <Profile />
                                    <UserList
                                        currentUser={currentUser}
                                        onSelectUser={handleUserSelection}
                                    />
                                </aside>
                                <div className="main-content">
                                    {selectedUserId && (
                                        <Chat
                                            senderId={currentUser}
                                            userId={selectedUserId}
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Navigate replace to="/login" />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
