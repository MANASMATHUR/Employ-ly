'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Post {
    _id: string;
    content: string;
    postType: 'update' | 'question' | 'opportunity' | 'advice';
    author: { _id: string; name: string; avatarUrl?: string };
    likes: string[];
    comments: Array<{ _id: string; content: string; author: { name: string }; createdAt: string }>;
    createdAt: string;
}

const POST_TYPES = [
    { id: 'update', label: '📝 Update', desc: 'Share what you\'re working on' },
    { id: 'question', label: '❓ Question', desc: 'Ask the community' },
    { id: 'opportunity', label: '🚀 Opportunity', desc: 'Share a job or project' },
    { id: 'advice', label: '💡 Advice', desc: 'Share your learnings' },
];

export default function FeedPage() {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [postType, setPostType] = useState('update');
    const [posting, setPosting] = useState(false);
    const [expandedComments, setExpandedComments] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/feed');
            const data = await res.json();
            if (data.success) setPosts(data.posts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!newPost.trim() || !token) return;
        setPosting(true);
        try {
            const res = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: newPost, postType }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts([data.post, ...posts]);
                setNewPost('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!token) return;
        try {
            const res = await fetch(`/api/feed/${postId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        const currentLikes = Array.isArray(p.likes) ? p.likes : [];
                        if (data.liked) {
                            // Add user ID to likes if not present
                            const userId = user?.id;
                            if (userId && !currentLikes.includes(userId)) {
                                return { ...p, likes: [...currentLikes, userId] };
                            }
                        } else {
                            // Remove user ID from likes
                            const userId = user?.id;
                            if (userId) {
                                return { ...p, likes: currentLikes.filter(id => id !== userId) };
                            }
                        }
                        return { ...p, likes: data.likes || currentLikes };
                    }
                    return p;
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (postId: string) => {
        if (!newComment.trim() || !token) return;
        try {
            const res = await fetch(`/api/feed/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: newComment }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.map(p => p._id === postId ? { ...p, comments: data.comments } : p));
                setNewComment('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const timeAgo = (date: string) => {
        const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    const getTypeEmoji = (type: string) => {
        const t = POST_TYPES.find(p => p.id === type);
        return t?.label.split(' ')[0] || '📝';
    };

    return (
        <div className="min-h-screen py-10 relative">
            <div className="blob blob-ruby -top-48 right-20 opacity-30"></div>
            <div className="blob blob-green -bottom-32 -left-20 opacity-20"></div>

            <div className="max-w-2xl mx-auto px-5 sm:px-8">
                {/* Header */}
                <div className="mb-8">
                    <span className="label">Community</span>
                    <h1 className="text-[var(--cream)] text-3xl font-bold mt-2 mb-3">
                        What's happening
                    </h1>
                    <p className="text-[var(--ash)]">
                        Share updates, ask questions, help others.
                    </p>
                </div>

                {/* Compose */}
                {user ? (
                    <div className="card mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center text-white font-bold flex-shrink-0">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="input min-h-[80px] mb-3"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {POST_TYPES.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setPostType(type.id)}
                                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${postType === type.id
                                                        ? 'bg-[var(--ruby)]/15 text-[var(--ruby-soft)]'
                                                        : 'bg-[var(--charcoal)] text-[var(--ash)] hover:text-[var(--cream)]'
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handlePost}
                                        disabled={!newPost.trim() || posting}
                                        className="btn-primary py-2 px-5 text-sm disabled:opacity-50"
                                    >
                                        {posting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card mb-8 p-6 text-center">
                        <p className="text-[var(--ash)] mb-4">Log in to join the conversation</p>
                        <Link href="/auth/login" className="btn-primary">Log in</Link>
                    </div>
                )}

                {/* Posts */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="flex gap-4">
                                    <div className="skeleton skeleton-avatar"></div>
                                    <div className="flex-1">
                                        <div className="skeleton skeleton-title mb-3"></div>
                                        <div className="skeleton skeleton-text"></div>
                                        <div className="skeleton skeleton-text w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💬</div>
                        <h3 className="empty-state-title">No posts yet</h3>
                        <p className="empty-state-desc">Be the first to share something!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div key={post._id} className="card">
                                {/* Author row */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center text-white font-bold text-sm">
                                        {post.author.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--cream)]">{post.author.name}</span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-[var(--charcoal)] text-[var(--ash)]">
                                                {getTypeEmoji(post.postType)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-[var(--smoke)]">{timeAgo(post.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <p className="text-[var(--stone)] leading-relaxed mb-4 whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-4 pt-4 border-t border-[var(--charcoal)]">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-1.5 text-sm transition-colors ${user && post.likes.includes(user.id)
                                                ? 'text-[var(--ruby)]'
                                                : 'text-[var(--ash)] hover:text-[var(--ruby)]'
                                            }`}
                                    >
                                        <span>{user && post.likes.includes(user.id) ? '❤️' : '🤍'}</span>
                                        <span>{post.likes.length}</span>
                                    </button>
                                    <button
                                        onClick={() => setExpandedComments(expandedComments === post._id ? null : post._id)}
                                        className="flex items-center gap-1.5 text-sm text-[var(--ash)] hover:text-[var(--cream)] transition-colors"
                                    >
                                        <span>💬</span>
                                        <span>{post.comments.length}</span>
                                    </button>
                                </div>

                                {/* Comments */}
                                {expandedComments === post._id && (
                                    <div className="mt-4 pt-4 border-t border-[var(--charcoal)]">
                                        {post.comments.length > 0 && (
                                            <div className="space-y-3 mb-4">
                                                {post.comments.map((comment) => (
                                                    <div key={comment._id} className="flex gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-[var(--charcoal)] flex items-center justify-center text-xs text-[var(--ash)]">
                                                            {comment.author.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-medium text-[var(--cream)]">{comment.author.name}</span>
                                                                <span className="text-xs text-[var(--smoke)]">{timeAgo(comment.createdAt)}</span>
                                                            </div>
                                                            <p className="text-sm text-[var(--stone)]">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {user && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                                                    placeholder="Write a comment..."
                                                    className="input flex-1 py-2 text-sm"
                                                />
                                                <button onClick={() => handleComment(post._id)} className="btn-secondary py-2 px-4 text-sm">
                                                    Reply
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
