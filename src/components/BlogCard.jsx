import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BlogCard = ({ blog }) => {
    return (
        <article className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {blog.imageUrl && (
                <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            )}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{blog.title}</h2>
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <Link
                        to={`/blog/${encodeURIComponent(blog.title)}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-accent)',
                            fontWeight: 500
                        }}
                    >
                        Read Article <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default BlogCard;
