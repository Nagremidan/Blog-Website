import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, ArrowLeft, Calendar, User } from 'lucide-react';

const BlogPost = () => {
    const { title } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Query by title since that's what we have in the URL
                // Note: In a real app, we might want to use a slug or ID, but user requested /Blog_Title
                const q = query(collection(db, 'blogs'), where('title', '==', decodeURIComponent(title)));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setBlog({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [title]);

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-accent)" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Blog post not found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <button
                className="btn btn-ghost"
                onClick={() => navigate('/')}
                style={{ marginBottom: '2rem', paddingLeft: 0 }}
            >
                <ArrowLeft size={18} /> Back to all posts
            </button>

            <article>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ marginBottom: '1.5rem', fontSize: '3rem' }}>{blog.title}</h1>

                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            {blog.createdAt?.toDate ? new Date(blog.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} />
                            Admin
                        </span>
                    </div>

                    {blog.imageUrl && (
                        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '3rem' }}>
                            <img
                                src={blog.imageUrl}
                                alt={blog.title}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    )}
                </header>

                {/* 
          DANGEROUS: Rendering raw HTML as requested for "full power".
          In a real production app, we would sanitize this with DOMPurify.
        */}
                <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
                />
            </article>
        </div>
    );
};

export default BlogPost;
