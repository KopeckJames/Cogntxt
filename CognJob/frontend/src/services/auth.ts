import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api'; // Adjust the URL as necessary

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState<string | null>(null);

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            setUser(data.user);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const logout = () => {
        setUser(null);
    };

    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/status`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Not authenticated');
            }

            const data = await response.json();
            setUser(data.user);
        } catch (err) {
            setUser(null);
            setError((err as Error).message);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return { user, error, login, logout };
};
