import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import "../styles/LoginForm.css";

interface LoginFormProps {
    onLogin: (userId: number) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Attempting to log in with:", username);
        try {
            const response = await axios.post("http://localhost:5000/login", {
                username,
                password,
            });
            console.log("Login Response:", response.data);
            const userId = response.data.userId;
            const token = response.data.token;
            if (userId && token) {
                dispatch(setUser({ username, token, userId }));
                onLogin(userId);
                navigate("/users");
            } else {
                console.error("User ID or token not received");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error(
                    "Login Error:",
                    axiosError.response?.data || axiosError.message
                );
            } else {
                console.error("Login Error:", error);
            }
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <input
                    className="login-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    className="login-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button className="login-button" type="submit">
                    Login
                </button>
            </form>
            <div className="login-form-footer">
                <p>Don't have an account?</p>
                <button
                    className="register-button"
                    onClick={() => (window.location.href = "/register")}
                >
                    Register here
                </button>
            </div>
        </div>
    );
};

export default LoginForm;
