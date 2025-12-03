import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, startAt } from 'firebase/firestore';
import { db } from '../firebase';
import BlogCard from '../components/BlogCard';
import { Loader2 } from 'lucide-react';

const Home = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [isFirstPage, setIsFirstPage] = useState(true);
    const [isLastPage, setIsLastPage] = useState(false);
    const [pageStack, setPageStack] = useState([]); // To keep track of start points for previous pages

    const PAGE_SIZE = 9;

    const fetchBlogs = async (direction = 'initial', cursor = null) => {
        setLoading(true);
        try {
            let q;
            const baseQuery = collection(db, 'blogs');
            const orderByQuery = orderBy('createdAt', 'desc');

            if (direction === 'next' && cursor) {
                q = query(baseQuery, orderByQuery, startAfter(cursor), limit(PAGE_SIZE));
            } else if (direction === 'prev' && cursor) {
                // For previous, we need to go back. 
                // A simpler way for "prev" in this stack-based approach:
                // We pop the current page start from stack to go back?
                // Actually, standard Firestore pagination often uses startAfter for next.
                // For prev, if we keep a stack of "first visible" docs of each page, we can just jump to that.
                // Let's use the stack approach for simplicity and reliability.
                // If direction is 'prev', we use the cursor passed which should be the start of the previous page.
                q = query(baseQuery, orderByQuery, startAt(cursor), limit(PAGE_SIZE));
            } else {
                // Initial load
                q = query(baseQuery, orderByQuery, limit(PAGE_SIZE));
            }

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const blogsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setBlogs(blogsData);
                setFirstVisible(querySnapshot.docs[0]);
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

                // Check if there are more docs
                // We can fetch one more to check, or just assume if we got less than PAGE_SIZE
                if (querySnapshot.docs.length < PAGE_SIZE) {
                    setIsLastPage(true);
                } else {
                    // Ideally we should peek ahead, but for now let's assume if full page, maybe more.
                    // A better check is to try fetching PAGE_SIZE + 1
                    // Let's stick to simple length check for now, and maybe "Next" will result in empty page which we can handle.
                    // Or better: fetch PAGE_SIZE + 1
                    setIsLastPage(false);
                }

                if (direction === 'initial') {
                    setIsFirstPage(true);
                    setPageStack([]);
                } else if (direction === 'next') {
                    setIsFirstPage(false);
                } else if (direction === 'prev') {
                    // If we are back at the start (how to know?)
                    // We will manage pageStack in handle functions
                }

            } else {
                if (direction === 'next') {
                    setIsLastPage(true);
                }
                // If initial was empty, blogs is empty
                if (direction === 'initial') {
                    setBlogs([]);
                }
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Improved fetch with peeking to correctly set isLastPage
    const fetchBlogsWithPagination = async (direction = 'initial', startDoc = null) => {
        setLoading(true);
        try {
            let q;
            const baseQuery = collection(db, 'blogs');

            // Fetch one extra to check if there's a next page
            const fetchLimit = PAGE_SIZE + 1;

            if (direction === 'next' && startDoc) {
                q = query(baseQuery, orderBy('createdAt', 'desc'), startAfter(startDoc), limit(fetchLimit));
            } else if (direction === 'prev' && startDoc) {
                // For prev, we use startAt with the doc from our stack
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogsWithPagination();
    }, []);

    const handleNext = () => {
        if (!isLastPage && lastVisible) {
            setPageStack(prev => [...prev, firstVisible]);
            setIsFirstPage(false);
            fetchBlogsWithPagination('next', lastVisible);
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
            fetchBlogsWithPagination('prev', prevStart);
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
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>Inside Design: Stories and interviews</h1>
                <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                    Subscribe to learn about new product features, the latest in technology and updates.
                </p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {blogs.map(blog => (
                    <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>

            {blogs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
                    <p>No blog posts yet. Visit the Admin Dashboard to create one.</p>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
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
        </div>
    );
};

export default Home;
