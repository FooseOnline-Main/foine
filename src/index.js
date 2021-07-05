import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ProductsProvider from './providers/productProvider';
import AuthProvider from './providers/authProvider';
import WatchlistProvider from './providers/watchlistProvider';
import NotificationProvider from './providers/notificationProvider';
import ErrorProvider from './providers/errorProvider';

ReactDOM.render(
  <React.StrictMode>
    <ErrorProvider>
      <AuthProvider>
        <NotificationProvider>
          <ProductsProvider>
            <WatchlistProvider>
                <App />
            </WatchlistProvider>
          </ProductsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
