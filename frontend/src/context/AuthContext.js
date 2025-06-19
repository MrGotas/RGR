import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (accessToken) {
            setUser({ username: 'Authenticated User' });
        } else {
            setUser(null);
        }
    }, [accessToken]);

    const login = async (username, password) => {
        try {
            const data = await loginUser(username, password);
            setAccessToken(data.access_token);
            setUser({ username: username });
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (username, email, password, password2) => {
        try {
            const data = await registerUser({ username, email, password, password2 });
            setAccessToken(data.access_token);
            setUser({ username: username });
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMessage = error.errors ? JSON.stringify(error.errors) : error.message;
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            setAccessToken(null);
            setUser(null);
            return { success: true };
        } catch (error) {
            console.error('Logout failed:', error);
            setAccessToken(null);
            setUser(null);
            return { success: false, error: error.message };
        }
    };

    const authContextValue = {
        token: accessToken,
        user,
        isAuthenticated: !!accessToken,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};