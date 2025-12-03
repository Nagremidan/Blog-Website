import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Save, ArrowLeft, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditing = !!id;
    const textareaRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        content: ''
    });
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [matches, setMatches] = useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

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

    // Search logic
    const handleSearch = (term) => {
        setSearchTerm(term);
        if (!term) {
            setMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const content = formData.content;
        const regex = new RegExp(term, 'gi');
        const newMatches = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            newMatches.push(match.index);
        }

        setMatches(newMatches);
        if (newMatches.length > 0) {
            setCurrentMatchIndex(0);
            scrollToMatch(newMatches[0], term.length);
        } else {
            setCurrentMatchIndex(-1);
        }
    };

    const scrollToMatch = (index, length) => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(index, index + length);

            // Calculate scroll position roughly
            const textBefore = formData.content.substring(0, index);
            const lines = textBefore.split('\n').length;
            const lineHeight = 20; // Approximate line height in px
            textareaRef.current.scrollTop = (lines - 5) * lineHeight; // Scroll to show context
        }
    };

    const nextMatch = () => {
        if (matches.length === 0) return;
        const nextIndex = (currentMatchIndex + 1) % matches.length;
        setCurrentMatchIndex(nextIndex);
        scrollToMatch(matches[nextIndex], searchTerm.length);
    };

    const prevMatch = () => {
        if (matches.length === 0) return;
        const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        setCurrentMatchIndex(prevIndex);
        scrollToMatch(matches[prevIndex], searchTerm.length);
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                        <label style={{ fontWeight: 500 }}>
                            Content (HTML/CSS Supported)
                            <span style={{ color: 'var(--color-danger)', marginLeft: '0.25rem' }}>*</span>
                        </label>

                        {/* In-Editor Search Bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#f1f5f9',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)'
                        }}>
                            <Search size={14} className="text-muted" />
                            <input
                                type="text"
                                placeholder="Find in content..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: '0.875rem',
                                    width: '150px'
                                }}
                            />
                            {matches.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', minWidth: '40px', textAlign: 'center' }}>
                                    {currentMatchIndex + 1}/{matches.length}
                                </span>
                            )}
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <button
                                    type="button"
                                    onClick={prevMatch}
                                    disabled={matches.length === 0}
                                    className="btn btn-ghost"
                                    style={{ padding: '2px', height: 'auto', minHeight: 'auto' }}
                                    title="Previous match"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextMatch}
                                    disabled={matches.length === 0}
                                    className="btn btn-ghost"
                                    style={{ padding: '2px', height: 'auto', minHeight: 'auto' }}
                                    title="Next match"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => handleSearch('')}
                                    className="btn btn-ghost"
                                    style={{ padding: '2px', height: 'auto', minHeight: 'auto', color: 'var(--color-text-secondary)' }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <span className="text-muted" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 400 }}>
                        You can write raw HTML here.
                    </span>

                    <textarea
                        ref={textareaRef}
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="input"
                        required
                        rows={20}
                        style={{ fontFamily: 'monospace', resize: 'vertical', lineHeight: '1.5' }}
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
