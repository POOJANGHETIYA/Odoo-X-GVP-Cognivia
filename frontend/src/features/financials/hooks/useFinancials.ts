import { useQuery } from '@tanstack/react-query';
import { mockExpenses, mockTrips, mockDrivers } from '@/mocks/mockData';
import { Expense, Trip, Driver } from '@/types';
import { parseISO, format } from 'date-fns';

export function useFinancials() {
    return useQuery({
        queryKey: ['financials'],
        queryFn: () => {
            // Simplified: In a real app, this would be an API call
            return Promise.resolve({
                expenses: mockExpenses as any as Expense[],
                trips: mockTrips as any as Trip[],
            });
        },
    });
}

export function useExpenses() {
    return useQuery<Expense[]>({
        queryKey: ['expenses'],
        queryFn: () => Promise.resolve(mockExpenses as any as Expense[]),
    });
}

export function useFinancialStats() {
    const { data } = useFinancials();

    if (!data) return null;

    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.cost, 0);
    const totalRevenue = data.trips.reduce((sum, t) => sum + t.expected_revenue, 0);
    const netMargin = totalRevenue - totalExpenses;

    // Category distribution
    const categoryDataMap: Record<string, number> = {};
    data.expenses.forEach(e => {
        categoryDataMap[e.category] = (categoryDataMap[e.category] || 0) + e.cost;
    });
    const categoryData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));

    // Monthly trend (last 6 months - approximation from mock data)
    // Mock data has dates like 2025-08 to 2026-02
    const monthlyDataMap: Record<string, { month: string; revenue: number; expenses: number }> = {};

    data.trips.forEach(t => {
        if (!t.created_at) return;
        const month = format(parseISO(t.created_at), 'MMM yy');
        if (!monthlyDataMap[month]) monthlyDataMap[month] = { month, revenue: 0, expenses: 0 };
        monthlyDataMap[month].revenue += t.expected_revenue;
    });

    data.expenses.forEach(e => {
        const month = format(parseISO(e.logged_at), 'MMM yy');
        if (!monthlyDataMap[month]) monthlyDataMap[month] = { month, revenue: 0, expenses: 0 };
        monthlyDataMap[month].expenses += e.cost;
    });

    const monthlyTrend = Object.values(monthlyDataMap).sort((a, b) => {
        const dateA = parseISO(data.trips.find(t => format(parseISO(t.created_at!), 'MMM yy') === a.month)?.created_at || '');
        const dateB = parseISO(data.trips.find(t => format(parseISO(t.created_at!), 'MMM yy') === b.month)?.created_at || '');
        return dateA.getTime() - dateB.getTime();
    }).slice(-6);

    return {
        totalExpenses,
        totalRevenue,
        netMargin,
        categoryData,
        monthlyTrend
    };
}

export function useExpenseLogs() {
    return useQuery({
        queryKey: ['expense-logs'],
        queryFn: () => {
            const trips = mockTrips as any as Trip[];
            const expenses = mockExpenses as any as Expense[];
            const drivers = mockDrivers as any as Driver[];

            // Aggregate expenses per trip
            const expenseAgg: Record<string, { fuel: number; misc: number }> = {};
            expenses.forEach(e => {
                if (!e.trip_id) return;
                if (!expenseAgg[e.trip_id]) expenseAgg[e.trip_id] = { fuel: 0, misc: 0 };
                if (e.category === 'Fuel') {
                    expenseAgg[e.trip_id].fuel += e.cost;
                } else {
                    expenseAgg[e.trip_id].misc += e.cost;
                }
            });

            // Join with trips
            const logs = trips.map(t => {
                const driver = drivers.find(d => d.id === t.driver_id);
                const agg = expenseAgg[t.id] || { fuel: 0, misc: 0 };
                return {
                    id: t.id,
                    tripId: t.tracking_number,
                    driver: driver?.full_name || 'Unassigned',
                    distance: `${t.estimated_distance_km || 0} km`,
                    fuelExpense: agg.fuel,
                    miscExpense: agg.misc,
                    status: t.status,
                };
            }).filter(log => log.fuelExpense > 0 || log.miscExpense > 0);

            return Promise.resolve(logs);
        },
    });
}
