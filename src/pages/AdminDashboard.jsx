import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    const fetchBlogs = async () => {
        try {
            const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const blogsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBlogs(blogsData);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            showToast("Failed to fetch blog posts.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleDeleteClick = (id) => {
        setBlogToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;

        try {
            await deleteDoc(doc(db, 'blogs', blogToDelete));
            setBlogs(blogs.filter(blog => blog.id !== blogToDelete));
            showToast("Blog post deleted successfully.", "success");
        } catch (error) {
            console.error("Error deleting blog:", error);
            showToast("Failed to delete blog post.", "error");
        } finally {
            setIsModalOpen(false);
            setBlogToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-accent)" />
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <Link to="/admin/create" className="btn btn-primary">
                    <Plus size={18} /> Create New Post
                </Link>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Title</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map(blog => (
                            <tr key={blog.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem' }}>{blog.title || <span className="text-muted">Untitled</span>}</td>
                                <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                                    {blog.createdAt?.toDate ? new Date(blog.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <Link to={`/blog/${encodeURIComponent(blog.title || 'untitled')}`} className="btn btn-ghost" title="View">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/admin/edit/${blog.id}`} className="btn btn-ghost" title="Edit">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDeleteClick(blog.id)} className="btn btn-ghost" style={{ color: 'var(--color-danger)' }} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {blogs.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                    No blog posts found. Create your first one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Blog Post"
                message="Are you sure you want to delete this blog post? This action cannot be undone."
            />
        </div>
    );
};

export default AdminDashboard;
