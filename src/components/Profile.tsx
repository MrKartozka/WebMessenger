import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Profile: React.FC = () => {
    const username = useSelector((state: RootState) => state.user.username);

    return (
        <div className="profile-container">
            <h1>My Profile</h1>
            <p>Nickname: {username}</p>
        </div>
    );
};

export default Profile;
