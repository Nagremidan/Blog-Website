import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import AdminDashboard from './pages/AdminDashboard';
import Editor from './pages/Editor';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:title" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/create" element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit/:id" element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)'
      }}>
        <p>&copy; {new Date().getFullYear()} DevBlog. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
