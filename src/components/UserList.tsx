import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/UserList.css";

interface User {
    id: number;
    username: string;
}

interface UserListProps {
    currentUser: number;
}

const UserList: React.FC<UserListProps> = ({ currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:5000/users");
                const otherUsers = response.data.filter(
                    (user: User) => user.id !== currentUser
                );
                setUsers(otherUsers);
            } catch (error) {
                console.error("Error fetching users", error);
            }
        };

        fetchUsers();
    }, [currentUser]);

    return (
        <div className="user-list">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="user-item"
                    onClick={() => navigate(`/chat/${user.id}`)}
                >
                    {user.username}
                </div>
            ))}
        </div>
    );
};

export default UserList;
