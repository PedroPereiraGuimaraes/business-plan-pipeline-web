"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

export interface User {
    id: string;
    email: string;
    name: string;
    access_level: string;
    created_at?: string;
}

interface UserContextData {
    user: User | null;
    isLoading: boolean;
}

const UserContext = createContext<UserContextData>({ user: null, isLoading: true });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getMe();
                setUser(userData);
            } catch (err) {
                localStorage.removeItem("token");
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    return (
        <UserContext.Provider value={{ user, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
