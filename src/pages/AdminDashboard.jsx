import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy, limit, startAfter, startAt } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Plus, Edit, Trash2, Eye, Search, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // Pagination state
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [isFirstPage, setIsFirstPage] = useState(true);
    const [isLastPage, setIsLastPage] = useState(false);
    const [pageStack, setPageStack] = useState([]);

    const PAGE_SIZE = 10;

    const fetchBlogs = async (direction = 'initial', startDoc = null) => {
        setLoading(true);
        try {
            let q;
            const baseQuery = collection(db, 'blogs');
            const fetchLimit = PAGE_SIZE + 1;

            if (direction === 'next' && startDoc) {
                q = query(baseQuery, orderBy('createdAt', 'desc'), startAfter(startDoc), limit(fetchLimit));
            } else if (direction === 'prev' && startDoc) {
                q = query(baseQuery, orderBy('createdAt', 'desc'), startAt(startDoc), limit(fetchLimit));
            } else {
                q = query(baseQuery, orderBy('createdAt', 'desc'), limit(fetchLimit));
            }

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs;

            let hasMore = false;
            let visibleDocs = docs;

            if (docs.length > PAGE_SIZE) {
                hasMore = true;
                visibleDocs = docs.slice(0, PAGE_SIZE);
            } else {
                hasMore = false;
            }

            const blogsData = visibleDocs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setBlogs(blogsData);

            if (visibleDocs.length > 0) {
                setFirstVisible(visibleDocs[0]);
                setLastVisible(visibleDocs[visibleDocs.length - 1]);
            }

            setIsLastPage(!hasMore);

            if (direction === 'initial') {
                setIsFirstPage(true);
                setPageStack([]);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            showToast("Failed to fetch blog posts.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Search function
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setIsSearching(true);
        try {
            // For search, we fetch all blogs (or a reasonable limit) and filter client-side
            // Firestore doesn't support full-text search natively
            const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const allBlogs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const lowerQuery = searchQuery.toLowerCase();
            const filtered = allBlogs.filter(blog =>
                (blog.title && blog.title.toLowerCase().includes(lowerQuery)) ||
                (blog.content && blog.content.toLowerCase().includes(lowerQuery))
            );

            setSearchResults(filtered);
        } catch (error) {
            console.error("Error searching blogs:", error);
            showToast("Failed to search blogs.", "error");
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        setSearchResults([]);
        fetchBlogs(); // Reload normal pagination
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleNext = () => {
        if (!isLastPage && lastVisible) {
            setPageStack(prev => [...prev, firstVisible]);
            setIsFirstPage(false);
            fetchBlogs('next', lastVisible);
        }
    };

    const handlePrev = () => {
        if (pageStack.length > 0) {
            const prevStart = pageStack[pageStack.length - 1];
            const newStack = pageStack.slice(0, -1);
            setPageStack(newStack);
            if (newStack.length === 0) {
                setIsFirstPage(true);
            }
            fetchBlogs('prev', prevStart);
        }
    };

    const handleDeleteClick = (id) => {
        setBlogToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;

        try {
            await deleteDoc(doc(db, 'blogs', blogToDelete));

            if (isSearching) {
                setSearchResults(prev => prev.filter(blog => blog.id !== blogToDelete));
            } else {
                setBlogs(prev => prev.filter(blog => blog.id !== blogToDelete));
            }

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

    const displayBlogs = isSearching ? searchResults : blogs;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1>Admin Dashboard</h1>
                <Link to="/admin/create" className="btn btn-primary">
                    <Plus size={18} /> Create New Post
                </Link>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center' }}>
                <form
                    onSubmit={handleSearch}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        borderRadius: '100px',
                        padding: '0.5rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        maxWidth: '600px',
                        border: '1px solid var(--color-border)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Search size={20} style={{ marginLeft: '1.25rem', color: 'var(--color-text-secondary)', minWidth: '20px' }} />
                    <input
                        type="text"
                        placeholder="Search by title or HTML content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            flex: 1,
                            padding: '0.75rem 1rem',
                            fontSize: '1rem',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-text-secondary)',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                marginRight: '0.5rem'
                            }}
                            title="Clear search"
                        >
                            <X size={18} />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn"
                        style={{
                            backgroundColor: '#0f172a', // Dark elegant button
                            color: '#ffffff',
                            borderRadius: '50px',
                            padding: '0.75rem 2rem',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        Search
                    </button>
                </form>
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
                        {displayBlogs.map(blog => (
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
                        {displayBlogs.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                    {isSearching ? "No matching posts found." : "No blog posts found. Create your first one!"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!isSearching && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        onClick={handlePrev}
                        disabled={isFirstPage}
                        className="btn"
                        style={{
                            opacity: isFirstPage ? 0.5 : 1,
                            cursor: isFirstPage ? 'not-allowed' : 'pointer',
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isLastPage}
                        className="btn"
                        style={{
                            opacity: isLastPage ? 0.5 : 1,
                            cursor: isLastPage ? 'not-allowed' : 'pointer',
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        Next
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Blog Post"
                message="Are you sure you want to delete this blog post? This action cannot be undone."
            />
        </div >
    );
};

export default AdminDashboard;
