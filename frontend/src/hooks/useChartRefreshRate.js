import { createContext, useContext, useEffect, useState } from 'react';

const ChartRefreshRateContext = createContext();

export function ChartRefreshRateProvider({ children }) {
    const [refreshRate, setRefreshRate] = useState(() => {
        const saved = localStorage.getItem('chartRefreshRate');
        return saved ? parseInt(saved, 10) : 5000; // Default to 5 seconds
    });

    useEffect(() => {
        localStorage.setItem('chartRefreshRate', refreshRate.toString());
    }, [refreshRate]);

    return (
        <ChartRefreshRateContext.Provider value={{ refreshRate, setRefreshRate }}>
            {children}
        </ChartRefreshRateContext.Provider>
    );
}

export function useChartRefreshRate() {
    const context = useContext(ChartRefreshRateContext);
    if (!context) {
        throw new Error('useChartRefreshRate must be used within a ChartRefreshRateProvider');
    }
    return context;
}
