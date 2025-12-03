import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        content: ''
    });
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEditing) {
            const fetchBlog = async () => {
                try {
                    const docRef = doc(db, 'blogs', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setFormData(docSnap.data());
                    } else {
                        showToast("Blog not found!", "error");
                        navigate('/admin');
                    }
                } catch (error) {
                    console.error("Error fetching blog:", error);
                    showToast("Failed to fetch blog details.", "error");
                } finally {
                    setLoading(false);
                }
            };
            fetchBlog();
        }
    }, [id, isEditing, navigate, showToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const blogData = {
                ...formData,
                updatedAt: serverTimestamp()
            };

            if (isEditing) {
                await updateDoc(doc(db, 'blogs', id), blogData);
                showToast("Blog post updated successfully!", "success");
            } else {
                blogData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'blogs'), blogData);
                showToast("New blog post created!", "success");
            }
            navigate('/admin');
        } catch (error) {
            console.error("Error saving blog:", error);
            showToast(`Failed to save blog post: ${error.message}`, "error");
        } finally {
            setSaving(false);
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
        <div className="container" style={{ maxWidth: '800px' }}>
            <button
                className="btn btn-ghost"
                onClick={() => navigate('/admin')}
                style={{ marginBottom: '2rem', paddingLeft: 0 }}
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '2rem' }}>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title <span className="text-muted">(Optional)</span></label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="input"
                        placeholder="Enter blog title..."
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Image URL <span className="text-muted">(Optional)</span></label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="input"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Content (HTML/CSS Supported)
                        <span style={{ color: 'var(--color-danger)', marginLeft: '0.25rem' }}>*</span>
                        <span className="text-muted" style={{ fontSize: '0.875rem', marginLeft: '0.5rem', fontWeight: 400 }}>
                            You can write raw HTML here.
                        </span>
                    </label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="input"
                        required
                        rows={15}
                        style={{ fontFamily: 'monospace', resize: 'vertical' }}
                        placeholder="<h1>My Blog Post</h1><p>Content goes here...</p>"
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Editor;
