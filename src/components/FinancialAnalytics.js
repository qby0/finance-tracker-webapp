import React, { useState, useEffect } from 'react';
import './FinancialAnalytics.css';

const FinancialAnalytics = ({ costs }) => {
    const [statistics, setStatistics] = useState(null);
    const [trends, setTrends] = useState(null);
    const [riskMetrics, setRiskMetrics] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('statistics');

    useEffect(() => {
        if (costs && costs.length > 0) {
            fetchAnalytics();
        }
    }, [costs]);

    const formatDate = (date) => {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return date;
    };

    const prepareTransactions = () => {
        return costs.map(cost => ({
            cost: cost.cost,
            type: cost.type,
            date: formatDate(cost.date),
            description: cost.description || '',
            category: cost.category || ''
        }));
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        const transactions = prepareTransactions();

        try {
            // Fetch statistics
            const statsResponse = await fetch('http://localhost:5000/api/financial/statistics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions })
            });
            const statsData = await statsResponse.json();
            if (statsData.success) setStatistics(statsData.statistics);

            // Fetch trends
            const trendsResponse = await fetch('http://localhost:5000/api/financial/trends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions, window_size: 7 })
            });
            const trendsData = await trendsResponse.json();
            if (trendsData.success) setTrends(trendsData.trends);

            // Fetch risk metrics
            const riskResponse = await fetch('http://localhost:5000/api/financial/risk-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions })
            });
            const riskData = await riskResponse.json();
            if (riskData.success) setRiskMetrics(riskData.risk_metrics);

            // Fetch forecast
            const forecastResponse = await fetch('http://localhost:5000/api/financial/forecast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions, forecast_days: 30 })
            });
            const forecastData = await forecastResponse.json();
            if (forecastData.success) setForecast(forecastData.forecast);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStatistics = () => {
        if (!statistics) return <p>No statistics available</p>;

        return (
            <div className="analytics-section">
                <h3>Statistical Analysis (NumPy)</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Mean</div>
                        <div className="stat-value">{statistics.mean.toFixed(2)}€</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Median</div>
                        <div className="stat-value">{statistics.median.toFixed(2)}€</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Std Deviation</div>
                        <div className="stat-value">{statistics.std_deviation.toFixed(2)}€</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Variance</div>
                        <div className="stat-value">{statistics.variance.toFixed(2)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Min</div>
                        <div className="stat-value">{statistics.min.toFixed(2)}€</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Max</div>
                        <div className="stat-value">{statistics.max.toFixed(2)}€</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total</div>
                        <div className="stat-value">{statistics.total.toFixed(2)}€</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Count</div>
                        <div className="stat-value">{statistics.count}</div>
                    </div>
                </div>
                <div className="percentiles-section">
                    <h4>Percentiles</h4>
                    <div className="percentiles-grid">
                        <div><strong>25th:</strong> {statistics.percentiles['25th'].toFixed(2)}€</div>
                        <div><strong>50th:</strong> {statistics.percentiles['50th'].toFixed(2)}€</div>
                        <div><strong>75th:</strong> {statistics.percentiles['75th'].toFixed(2)}€</div>
                        <div><strong>90th:</strong> {statistics.percentiles['90th'].toFixed(2)}€</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTrends = () => {
        if (!trends) return <p>No trends data available</p>;

        return (
            <div className="analytics-section">
                <h3>Trend Analysis (NumPy Moving Averages)</h3>
                <div className="trends-info">
                    <div className="trend-metric">
                        <strong>Average Growth Rate:</strong> {trends.average_growth_rate.toFixed(2)}%
                    </div>
                    <div className="trend-metric">
                        <strong>Volatility:</strong> {trends.volatility.toFixed(2)}%
                    </div>
                </div>
                <div className="trends-chart">
                    <p><em>Moving average calculated using NumPy convolution</em></p>
                    <div className="trend-values">
                        {trends.moving_average && trends.moving_average.length > 0 ? (
                            <div>
                                <strong>Latest Moving Average (7-day):</strong> {trends.moving_average[trends.moving_average.length - 1].toFixed(2)}€
                            </div>
                        ) : (
                            <p>Insufficient data for moving average calculation</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderRiskMetrics = () => {
        if (!riskMetrics) return <p>No risk metrics available</p>;

        return (
            <div className="analytics-section">
                <h3>Risk Metrics (NumPy Financial Analysis)</h3>
                <div className="risk-grid">
                    <div className="risk-card">
                        <div className="risk-label">Volatility</div>
                        <div className="risk-value">{(riskMetrics.volatility * 100).toFixed(2)}%</div>
                    </div>
                    <div className="risk-card">
                        <div className="risk-label">Variance</div>
                        <div className="risk-value">{riskMetrics.variance.toFixed(4)}</div>
                    </div>
                    <div className="risk-card">
                        <div className="risk-label">Mean Return</div>
                        <div className="risk-value">{(riskMetrics.mean_return * 100).toFixed(2)}%</div>
                    </div>
                    <div className="risk-card">
                        <div className="risk-label">Sharpe Ratio</div>
                        <div className="risk-value">{riskMetrics.sharpe_ratio.toFixed(2)}</div>
                    </div>
                    <div className="risk-card">
                        <div className="risk-label">Value at Risk (95%)</div>
                        <div className="risk-value">{(riskMetrics.value_at_risk_95 * 100).toFixed(2)}%</div>
                    </div>
                    <div className="risk-card">
                        <div className="risk-label">Max Drawdown</div>
                        <div className="risk-value">{(riskMetrics.max_drawdown * 100).toFixed(2)}%</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderForecast = () => {
        if (!forecast) return <p>No forecast data available</p>;

        return (
            <div className="analytics-section">
                <h3>Budget Forecast (NumPy Linear Regression)</h3>
                <div className="forecast-info">
                    <div className="forecast-metric">
                        <strong>Trend Slope:</strong> {forecast.trend_slope.toFixed(2)}€/month
                    </div>
                    <div className="forecast-metric">
                        <strong>Trend Intercept:</strong> {forecast.trend_intercept.toFixed(2)}€
                    </div>
                </div>
                {forecast.forecast_values && forecast.forecast_values.length > 0 && (
                    <div className="forecast-values">
                        <h4>Projected Values:</h4>
                        {forecast.forecast_values.map((value, idx) => (
                            <div key={idx} className="forecast-item">
                                Month {idx + 1}: {value.toFixed(2)}€
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="financial-analytics">
            <h2>Financial Analytics (Powered by NumPy & Python)</h2>
            <p className="analytics-description">
                Advanced financial calculations using NumPy for statistical analysis, trend detection, 
                risk metrics, and budget forecasting.
            </p>

            {loading && <div className="loading">Calculating analytics...</div>}

            <div className="tabs">
                <button 
                    className={activeTab === 'statistics' ? 'active' : ''}
                    onClick={() => setActiveTab('statistics')}
                >
                    Statistics
                </button>
                <button 
                    className={activeTab === 'trends' ? 'active' : ''}
                    onClick={() => setActiveTab('trends')}
                >
                    Trends
                </button>
                <button 
                    className={activeTab === 'risk' ? 'active' : ''}
                    onClick={() => setActiveTab('risk')}
                >
                    Risk Metrics
                </button>
                <button 
                    className={activeTab === 'forecast' ? 'active' : ''}
                    onClick={() => setActiveTab('forecast')}
                >
                    Forecast
                </button>
            </div>

            <div className="analytics-content">
                {activeTab === 'statistics' && renderStatistics()}
                {activeTab === 'trends' && renderTrends()}
                {activeTab === 'risk' && renderRiskMetrics()}
                {activeTab === 'forecast' && renderForecast()}
            </div>
        </div>
    );
};

export default FinancialAnalytics;

