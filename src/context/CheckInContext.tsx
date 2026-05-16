import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CheckInData {
    id: string;
    date: string;
    mood: number; // 1-5
    energy: number; // 1-5
    social: number; // 1-5
    stress: number; // 1-5
    journal?: string;
}

interface CheckInContextType {
    checkIns: CheckInData[];
    addCheckIn: (data: Omit<CheckInData, 'id' | 'date'>) => void;
    getRecentCheckIns: (days: number) => CheckInData[];
}

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

export const CheckInProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [checkIns, setCheckIns] = useState<CheckInData[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('equimind_checkins');
        if (saved) {
            try {
                setCheckIns(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse check-ins', e);
            }
        } else {
            // Add some dummy data for demonstration if empty
            const dummyData: CheckInData[] = Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return {
                    id: `dummy-${i}`,
                    date: date.toISOString(),
                    mood: Math.floor(Math.random() * 2) + 3, // 3-5
                    energy: Math.floor(Math.random() * 3) + 2, // 2-5
                    social: Math.floor(Math.random() * 3) + 2,
                    stress: Math.floor(Math.random() * 3) + 1,
                };
            });
            setCheckIns(dummyData);
            localStorage.setItem('equimind_checkins', JSON.stringify(dummyData));
        }
    }, []);

    const addCheckIn = (data: Omit<CheckInData, 'id' | 'date'>) => {
        const newCheckIn: CheckInData = {
            ...data,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };

        const updated = [...checkIns, newCheckIn];
        setCheckIns(updated);
        localStorage.setItem('equimind_checkins', JSON.stringify(updated));
    };

    const getRecentCheckIns = (days: number) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return checkIns.filter(c => new Date(c.date) >= cutoff);
    };

    return (
        <CheckInContext.Provider value={{ checkIns, addCheckIn, getRecentCheckIns }}>
            {children}
        </CheckInContext.Provider>
    );
};

export const useCheckIn = () => {
    const context = useContext(CheckInContext);
    if (context === undefined) {
        throw new Error('useCheckIn must be used within a CheckInProvider');
    }
    return context;
};
