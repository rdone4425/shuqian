import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 添加错误处理
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', error);
      setHasError(true);
      setError(error);
    };

    return () => {
      window.onerror = null;
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>应用出现错误</h1>
        <pre>{error?.message}</pre>
      </div>
    );
  }

  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
) 