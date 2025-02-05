"""
Python Backend Service for Financial Calculations using NumPy
Provides statistical analysis, trend analysis, and risk metrics for financial data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)


def parse_date(date_str):
    """Parse date string to datetime object"""
    try:
        if isinstance(date_str, str):
            # Handle different date formats
            if '-' in date_str:
                parts = date_str.split('-')
                if len(parts) == 3:
                    return datetime(int(parts[0]), int(parts[1]), int(parts[2]))
        return None
    except:
        return None


@app.route('/api/financial/statistics', methods=['POST'])
def calculate_statistics():
    """
    Calculate statistical metrics for financial transactions using NumPy
    Returns: mean, median, std deviation, variance, min, max
    """
    try:
        data = request.json
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({'error': 'No transactions provided'}), 400
        
        # Extract amounts and convert to NumPy array
        amounts = []
        for txn in transactions:
            amount = float(txn.get('cost', 0))
            if txn.get('type') == 'expense':
                amount = abs(amount)  # Make expenses positive for analysis
            amounts.append(amount)
        
        amounts_array = np.array(amounts)
        
        # Calculate statistics using NumPy
        stats = {
            'mean': float(np.mean(amounts_array)),
            'median': float(np.median(amounts_array)),
            'std_deviation': float(np.std(amounts_array)),
            'variance': float(np.var(amounts_array)),
            'min': float(np.min(amounts_array)),
            'max': float(np.max(amounts_array)),
            'total': float(np.sum(amounts_array)),
            'count': len(amounts_array),
            'percentiles': {
                '25th': float(np.percentile(amounts_array, 25)),
                '50th': float(np.percentile(amounts_array, 50)),
                '75th': float(np.percentile(amounts_array, 75)),
                '90th': float(np.percentile(amounts_array, 90))
            }
        }
        
        return jsonify({'success': True, 'statistics': stats})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/financial/trends', methods=['POST'])
def calculate_trends():
    """
    Calculate trend analysis including moving averages and growth rates
    Uses NumPy for efficient time series calculations
    """
    try:
        data = request.json
        transactions = data.get('transactions', [])
        window_size = data.get('window_size', 7)  # Default 7-day moving average
        
        if not transactions:
            return jsonify({'error': 'No transactions provided'}), 400
        
        # Sort transactions by date
        sorted_txns = sorted(transactions, key=lambda x: parse_date(x.get('date')) or datetime.min)
        
        # Extract daily totals
        daily_totals = {}
        for txn in sorted_txns:
            date_str = txn.get('date', '')
            date_key = date_str.split(' ')[0] if ' ' in date_str else date_str
            
            if date_key not in daily_totals:
                daily_totals[date_key] = {'income': 0, 'expense': 0}
            
            amount = float(txn.get('cost', 0))
            if txn.get('type') == 'income':
                daily_totals[date_key]['income'] += amount
            else:
                daily_totals[date_key]['expense'] += abs(amount)
        
        # Convert to arrays sorted by date
        dates = sorted(daily_totals.keys())
        income_values = np.array([daily_totals[d]['income'] for d in dates])
        expense_values = np.array([daily_totals[d]['expense'] for d in dates])
        net_values = income_values - expense_values
        
        # Calculate moving averages using NumPy convolution
        if len(net_values) >= window_size:
            # Simple moving average using convolution
            weights = np.ones(window_size) / window_size
            moving_avg = np.convolve(net_values, weights, mode='valid')
            
            # Calculate growth rates
            growth_rates = np.diff(net_values) / (net_values[:-1] + 1e-10) * 100  # Avoid division by zero
            
            trends = {
                'dates': dates[window_size-1:],
                'moving_average': moving_avg.tolist(),
                'net_values': net_values.tolist(),
                'average_growth_rate': float(np.mean(growth_rates)) if len(growth_rates) > 0 else 0,
                'volatility': float(np.std(growth_rates)) if len(growth_rates) > 0 else 0
            }
        else:
            trends = {
                'dates': dates,
                'moving_average': net_values.tolist(),
                'net_values': net_values.tolist(),
                'average_growth_rate': 0,
                'volatility': 0
            }
        
        return jsonify({'success': True, 'trends': trends})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/financial/risk-metrics', methods=['POST'])
def calculate_risk_metrics():
    """
    Calculate financial risk metrics including volatility and Sharpe ratio
    Uses NumPy for efficient risk calculations
    """
    try:
        data = request.json
        transactions = data.get('transactions', [])
        risk_free_rate = data.get('risk_free_rate', 0.02)  # Default 2% annual
        
        if not transactions:
            return jsonify({'error': 'No transactions provided'}), 400
        
        # Extract daily net values
        daily_totals = {}
        for txn in transactions:
            date_str = txn.get('date', '')
            date_key = date_str.split(' ')[0] if ' ' in date_str else date_str
            
            if date_key not in daily_totals:
                daily_totals[date_key] = {'income': 0, 'expense': 0}
            
            amount = float(txn.get('cost', 0))
            if txn.get('type') == 'income':
                daily_totals[date_key]['income'] += amount
            else:
                daily_totals[date_key]['expense'] += abs(amount)
        
        dates = sorted(daily_totals.keys())
        net_values = np.array([daily_totals[d]['income'] - daily_totals[d]['expense'] for d in dates])
        
        if len(net_values) < 2:
            return jsonify({'error': 'Insufficient data for risk calculations'}), 400
        
        # Calculate returns (daily changes)
        returns = np.diff(net_values) / (np.abs(net_values[:-1]) + 1e-10)
        
        # Risk metrics using NumPy
        mean_return = np.mean(returns)
        volatility = np.std(returns)  # Standard deviation of returns
        variance = np.var(returns)
        
        # Sharpe ratio (simplified - assumes daily returns)
        sharpe_ratio = (mean_return - risk_free_rate / 365) / (volatility + 1e-10) if volatility > 0 else 0
        
        # Value at Risk (VaR) - 95% confidence
        var_95 = np.percentile(returns, 5) if len(returns) > 0 else 0
        
        # Maximum drawdown
        cumulative = np.cumsum(net_values)
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / (running_max + 1e-10)
        max_drawdown = float(np.min(drawdown)) if len(drawdown) > 0 else 0
        
        risk_metrics = {
            'volatility': float(volatility),
            'variance': float(variance),
            'mean_return': float(mean_return),
            'sharpe_ratio': float(sharpe_ratio),
            'value_at_risk_95': float(var_95),
            'max_drawdown': float(max_drawdown),
            'total_days': len(dates)
        }
        
        return jsonify({'success': True, 'risk_metrics': risk_metrics})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/financial/forecast', methods=['POST'])
def forecast_budget():
    """
    Simple budget forecasting using linear regression with NumPy
    Predicts future values based on historical trends
    """
    try:
        data = request.json
        transactions = data.get('transactions', [])
        forecast_days = data.get('forecast_days', 30)
        
        if not transactions:
            return jsonify({'error': 'No transactions provided'}), 400
        
        # Extract monthly totals
        monthly_totals = {}
        for txn in transactions:
            date_str = txn.get('date', '')
            date_key = date_str.split(' ')[0] if ' ' in date_str else date_str
            
            if '-' in date_key:
                year_month = '-'.join(date_key.split('-')[:2])  # YYYY-MM
                
                if year_month not in monthly_totals:
                    monthly_totals[year_month] = {'income': 0, 'expense': 0}
                
                amount = float(txn.get('cost', 0))
                if txn.get('type') == 'income':
                    monthly_totals[year_month]['income'] += amount
                else:
                    monthly_totals[year_month]['expense'] += abs(amount)
        
        if len(monthly_totals) < 2:
            return jsonify({'error': 'Insufficient data for forecasting'}), 400
        
        # Sort by date and extract values
        sorted_months = sorted(monthly_totals.keys())
        net_values = np.array([monthly_totals[m]['income'] - monthly_totals[m]['expense'] for m in sorted_months])
        
        # Create time indices
        x = np.arange(len(net_values))
        
        # Simple linear regression using NumPy
        # y = mx + b
        A = np.vstack([x, np.ones(len(x))]).T
        m, b = np.linalg.lstsq(A, net_values, rcond=None)[0]
        
        # Forecast future values
        future_x = np.arange(len(net_values), len(net_values) + forecast_days // 30 + 1)
        forecast_values = m * future_x + b
        
        forecast = {
            'historical_months': sorted_months,
            'historical_values': net_values.tolist(),
            'forecast_months': [f"Forecast_{i+1}" for i in range(len(future_x))],
            'forecast_values': forecast_values.tolist(),
            'trend_slope': float(m),
            'trend_intercept': float(b)
        }
        
        return jsonify({'success': True, 'forecast': forecast})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Python Financial Analytics Service'})


if __name__ == '__main__':
    print("Starting Python Financial Analytics Service...")
    print("NumPy version:", np.__version__)
    app.run(host='0.0.0.0', port=5001, debug=True)

