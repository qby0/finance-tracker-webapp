# Finance Tracker Web Application

A comprehensive finance tracking web application with advanced analytics powered by Python and NumPy.

## Features

- **Expense and Income Tracking**: Track your daily financial transactions
- **QR Code Receipt Scanning**: Automatically extract purchase information from QR codes
- **Data Visualization**: Interactive charts and graphs for financial insights
- **Advanced Analytics**: Statistical analysis, trend detection, risk metrics, and budget forecasting using NumPy
- **User Authentication**: Secure login and registration with Firebase

## Tech Stack

- **Frontend**: React, Chart.js, Recharts
- **Backend**: Node.js/Express
- **Python Backend**: Flask with NumPy for financial calculations
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth

## Python & NumPy Integration

The application includes a Python backend service that leverages NumPy for advanced financial calculations:

- **Statistical Analysis**: Mean, median, standard deviation, variance, percentiles
- **Trend Analysis**: Moving averages using NumPy convolution, growth rate calculations
- **Risk Metrics**: Volatility, Sharpe ratio, Value at Risk (VaR), maximum drawdown
- **Budget Forecasting**: Linear regression for future budget predictions

### Python Service Setup

1. Install Python dependencies:
```bash
cd server
pip install -r requirements.txt
```

2. Start the Python service:
```bash
python python_service.py
```

The Python service runs on `http://localhost:5001` by default.

## Getting Started

## Installation

1. Clone the repository:
```bash
git clone https://github.com/qby0/finance-tracker-webapp.git
cd finance-tracker-webapp
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
cd server
pip install -r requirements.txt
cd ..
```

## Running the Application

### Start the Python Backend Service

In one terminal, start the Python service:
```bash
cd server
python python_service.py
```

The Python service will run on `http://localhost:5001`

### Start the Node.js Server

In another terminal, start the Node.js server:
```bash
cd server
node server.js
```

The Node.js server will run on `http://localhost:5000`

### Start the React Frontend

In a third terminal, start the React development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
