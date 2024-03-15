import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/LoginForm.css";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

interface RegistrationFormProps {
    onRegister: (userId: number) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5000/register",
                { username, password }
            );
            console.log("Registration Response:", response.data);
            onRegister(response.data.userId);
            dispatch(
                setUser({
                    username,
                    token: response.data.token,
                    userId: response.data.userId,
                })
            );
            navigate("/users");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error(
                    "Registration Error:",
                    axiosError.response?.data || axiosError.message
                );
            } else {
                console.error("Registration Error:", error);
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
                    placeholder="Choose a username"
                />
                <input
                    className="login-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                />
                <button className="login-button" type="submit">
                    Register
                </button>
            </form>
            <div className="login-form-footer">
                <p>Already have an account?</p>
                <button
                    className="register-button"
                    onClick={() => (window.location.href = "/login")}
                >
                    Login here
                </button>
            </div>
        </div>
    );
};

export default RegistrationForm;
