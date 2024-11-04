import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import React, { Suspense } from 'react';
import MainLayout from './layouts/MainLayout';

// 使用懒加载优化首屏加载
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const BookmarkList = React.lazy(() => import('./pages/BookmarkList'));
const CategoryManagement = React.lazy(() => import('./pages/CategoryManagement'));
const TagManagement = React.lazy(() => import('./pages/TagManagement'));
const Statistics = React.lazy(() => import('./pages/Statistics'));

// 加载提示组件
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingComponent />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookmarks" element={<BookmarkList />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="tags" element={<TagManagement />} />
            <Route path="stats" element={<Statistics />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App; 