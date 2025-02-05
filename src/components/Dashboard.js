import React, { useState, useEffect } from 'react';
import Costs from "./Costs";
import NewCost from "./NewCost/NewCost";
import QrScanner from "./QrScanner";
import QrUpload from "./QrUpload";
import Footer from './Footer';
import './Dashboard.css';
import ExpensePieChart from './PieChartComponent';
import BarChartComponent from './BarChartComponent';
import LineChartComponent from './LineChartComponent';
import FinancialAnalytics from './FinancialAnalytics';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const Dashboard = ({ user }) => {
    const [showScanner, setShowScanner] = useState(false);
    const [costs, setCosts] = useState([]);
    const [selectedYear, setSelectedYear] = useState("2024");
    const [selectedMonth, setSelectedMonth] = useState("");

    useEffect(() => {
        if (!user) return;

        const userCostsRef = ref(database, `users/${user.uid}/purchases`);
        const unsubscribe = onValue(userCostsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedCosts = [];

            for (let key in data) {
                const dateString = data[key].date;
                const [year, month, day] = dateString.split('-').map(Number);
                const date = new Date(year, month - 1, day);

                loadedCosts.push({
                    id: data[key].id,
                    type: data[key].type,
                    category: data[key].category || '',
                    description: data[key].description || '',
                    cost: parseFloat(data[key].cost),
                    date: date,
                });
            }

            setCosts(loadedCosts);
        });

        return () => unsubscribe();
    }, [user]);

    const filterCosts = (type) => {
        return costs.filter(cost => {
            const costYear = cost.date.getFullYear().toString();
            const costMonth = ("0" + (cost.date.getMonth() + 1)).slice(-2);

            const yearMatch = costYear === selectedYear;
            const monthMatch = selectedMonth ? costMonth === selectedMonth : true;

            return cost.type === type && yearMatch && monthMatch;
        });
    };

    const totalIncome = filterCosts('income')
        .reduce((acc, curr) => acc + curr.cost, 0);

    const totalExpenses = filterCosts('expense')
        .reduce((acc, curr) => acc + Math.abs(curr.cost), 0);

    const difference = totalIncome - totalExpenses;

    const filteredCosts = costs.filter(cost => {
        const costYear = cost.date.getFullYear().toString();
        const costMonth = ("0" + (cost.date.getMonth() + 1)).slice(-2);

        const yearMatch = costYear === selectedYear;
        const monthMatch = selectedMonth ? costMonth === selectedMonth : true;

        return (cost.type === 'income' || cost.type === 'expense') && yearMatch && monthMatch;
    });

    const pieChartCosts = costs.filter(cost => {
        const costYear = cost.date.getFullYear().toString();
        const costMonth = ("0" + (cost.date.getMonth() + 1)).slice(-2);

        const yearMatch = costYear === selectedYear;
        const monthMatch = selectedMonth ? costMonth === selectedMonth : true;

        return cost.type === 'expense' && yearMatch && monthMatch;
    });

    const barChartCosts = costs.filter(cost => {
        const costYear = cost.date.getFullYear().toString();

        const yearMatch = costYear === selectedYear;

        return yearMatch;
    });

    const lineChartCosts = costs.filter(cost => {
        const costYear = cost.date.getFullYear().toString();
        const costMonth = ("0" + (cost.date.getMonth() + 1)).slice(-2);

        const yearMatch = costYear === selectedYear;
        const monthMatch = selectedMonth ? costMonth === selectedMonth : true;

        return (cost.type === 'income' || cost.type === 'expense') && yearMatch && monthMatch;
    });

    useEffect(() => {
        console.log("All Costs:", costs);
        console.log("Pie Chart Costs:", pieChartCosts);
        console.log("Bar Chart Costs:", barChartCosts);
        console.log("Line Chart Costs:", lineChartCosts);
    }, [costs, pieChartCosts, barChartCosts, lineChartCosts]);

    const yearChangeHandler = (year) => {
        setSelectedYear(year);
    };

    const monthChangeHandler = (month) => {
        setSelectedMonth(month);
    };

    return (
        <>
            {/* Фонове відео (закоментовано)
            <video className="video-background" autoPlay loop muted>
                <source src="/1v_1.mp4" type="video/mp4" />
                Ваш браузер не підтримує відео.
            </video>
            */}

            <h1>Expense and Budget Tracking</h1>

            <div className="dashboard-container">
                <div className="dashboard-difference">
                    <strong>DIFFERENCE</strong>
                    <br />
                    <span>{difference.toFixed(2)}€</span>
                </div>

                <div className="dashboard-row">
                    <div className="dashboard-income">
                        <span>INCOME</span>
                        <span>+{totalIncome.toFixed(2)}€</span>
                    </div>
                    <div className="dashboard-spendings">
                        <span>EXPENSE</span>
                        <span>-{totalExpenses.toFixed(2)}€</span>
                    </div>
                </div>
            </div>

            {/*<div className="dashboard">
                <button onClick={() => setShowScanner(true)}>USE QR</button>

                {showScanner && (
                    <QrScanner onCancel={() => setShowScanner(false)} />
                )}

            </div>*/}
            <QrScanner />

            <QrUpload />

            <NewCost /> {/* Переконайтеся, що NewCost обробляє Description належним чином */}

            <br />
            <div className="table-container">
                <table className="chart-table">
                    <tbody>
                        <tr>
                            <td className="chart-cell" colSpan={2}>
                                {/* ExpensePieChart тепер використовує Category */}
                                <ExpensePieChart costs={pieChartCosts} />
                            </td>
                        </tr>
                        <tr>
                            <td className="chart-cell" colSpan={2}>
                                <BarChartComponent costs={barChartCosts} /> {/* Передає всі транзакції за рік */}
                            </td>
                        </tr>
                        <tr>
                            <td className="chart-cell" colSpan={2}>
                                <LineChartComponent
                                    costs={lineChartCosts}
                                    selectedYear={selectedYear}
                                    selectedMonth={selectedMonth}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <FinancialAnalytics costs={filteredCosts} />

            <Costs
                costs={filteredCosts} // Передає фільтровані витрати
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onChangeYear={yearChangeHandler}
                onChangeMonth={monthChangeHandler}
            />
            <Footer />
        </>
    );
}

export default Dashboard;
