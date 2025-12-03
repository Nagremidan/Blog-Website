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
            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by title or HTML content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="clear-search-btn"
                            title="Clear search"
                        >
                            <X size={18} />
                        </button>
                    )}
                    <button type="submit" className="btn search-btn">
                        Search
                    </button>
                </form>
            </div>

            <div className="card blog-list-container">
                <div className="blog-list-header">
                    <div className="blog-list-header-title">Title</div>
                    <div className="blog-list-header-date">Date</div>
                    <div className="blog-list-header-actions">Actions</div>
                </div>
                <div className="blog-list-body">
                    {displayBlogs.map(blog => (
                        <div key={blog.id} className="blog-list-item">
                            <div className="blog-list-item-title">
                                {blog.title || <span className="text-muted">Untitled</span>}
                            </div>
                            <div className="blog-list-item-date">
                                {blog.createdAt?.toDate ? new Date(blog.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="blog-list-item-actions">
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
                        </div>
                    ))}
                    {displayBlogs.length === 0 && (
                        <div className="blog-list-empty">
                            {isSearching ? "No matching posts found." : "No blog posts found. Create your first one!"}
                        </div>
                    )}
                </div>
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
