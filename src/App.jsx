import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import BookmarkList from './pages/BookmarkList';
import CategoryManagement from './pages/CategoryManagement';
import TagManagement from './pages/TagManagement';
import Statistics from './pages/Statistics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookmarks" element={<BookmarkList />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="tags" element={<TagManagement />} />
          <Route path="stats" element={<Statistics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App; 