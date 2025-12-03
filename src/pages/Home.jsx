import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import BlogCard from '../components/BlogCard';
import { Loader2 } from 'lucide-react';

const Home = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

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
        </div>
    );
};

export default Home;
