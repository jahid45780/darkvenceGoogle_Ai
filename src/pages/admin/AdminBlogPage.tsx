import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { BlogPostItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminBlogPageProps {
  posts: BlogPostItem[];
  onRefresh: () => void;
}

export const AdminBlogPage: React.FC<AdminBlogPageProps> = ({ posts, onRefresh }) => {
  const [editingPost, setEditingPost] = useState<Partial<BlogPostItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Custom Delete Modal
  const [deletingPost, setDeletingPost] = useState<BlogPostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [tagInput, setTagInput] = useState('');

  const handleEdit = (post: BlogPostItem) => {
    setEditingPost({
      ...post,
      tags: [...(post.tags || [])]
    });
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreateNew = () => {
    setEditingPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '## Overview\n\nDeep-dive into modern architectural patterns...',
      coverImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
      author: {
        name: 'Julian Vance',
        role: 'Head of Engineering'
      },
      category: 'Engineering',
      tags: ['Architecture', 'Performance', 'Next.js'],
      readTime: '6 min read',
      status: 'published',
      publishedAt: new Date().toISOString()
    });
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleTitleChange = (title: string) => {
    if (!editingPost) return;
    const updates: Partial<BlogPostItem> = { title };
    if (isCreating || !editingPost.slug) {
      updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    setEditingPost({ ...editingPost, ...updates });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Article cover image must be under 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, `${editingPost?.title || 'Article'}_cover`);
        if (res?.url) {
          setEditingPost(prev => prev ? { ...prev, coverImage: res.url } : null);
          setSuccessMessage('Article cover image uploaded successfully.');
        }
      } catch (err: any) {
        setError(err.message || 'Image upload failed.');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.slug) {
      setError('Title and slug are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isCreating) {
        await api.createBlogPost(editingPost);
        setSuccessMessage(`Article "${editingPost.title}" created successfully.`);
      } else if (editingPost.id) {
        await api.updateBlogPost(editingPost.id, editingPost);
        setSuccessMessage(`Article "${editingPost.title}" updated successfully.`);
      }
      setEditingPost(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save article.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    setError(null);

    try {
      await api.deleteBlogPost(deletingPost.id);
      setSuccessMessage(`Article "${deletingPost.title}" deleted.`);
      setDeletingPost(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete article.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B6FF2B] uppercase tracking-wider">
            <span>Editorial CMS</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-1">Insights &amp; Articles CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Publish architectural guides, ad attribution papers, and case analysis.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && !editingPost && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Read Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white font-display">
                    <div>
                      <span>{post.title}</span>
                      <p className="text-[11px] font-mono text-slate-400">/{post.slug}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {post.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {post.author?.name || 'Darkvence Editorial'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {post.readTime}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      post.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPost(post)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Delete Article?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">"{deletingPost.title}"</strong>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isDeleting ? 'Deleting...' : 'Delete Article'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setEditingPost(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white font-display">
                {isCreating ? 'Create New Article' : `Edit: ${editingPost.title}`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Publish thought leadership and market analysis.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Slug Identifier *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category</label>
                  <select
                    value={editingPost.category || 'Engineering'}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Performance Marketing">Performance Marketing</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Conversion Optimization">Conversion Optimization</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Estimated Read Time</label>
                  <input
                    type="text"
                    value={editingPost.readTime || '5 min read'}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Status</label>
                  <select
                    value={editingPost.status || 'published'}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <label className="font-semibold text-slate-300">Article Header Image</label>
                <div className="flex items-center gap-3">
                  {editingPost.coverImage ? (
                    <img src={editingPost.coverImage} alt="" className="w-16 h-12 rounded-lg object-cover border border-white/10" />
                  ) : null}
                  <label className="px-3 py-1.5 bg-[#B6FF2B] text-black/20 hover:bg-[#B6FF2B] text-black/30 text-[#B6FF2B] border border-[#B6FF2B] rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                    {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploadingImage} />
                  </label>
                  <input
                    type="text"
                    placeholder="or paste image URL"
                    value={editingPost.coverImage || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                    className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Executive Summary / Excerpt</label>
                <textarea
                  rows={2}
                  required
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Article Body (Markdown)</label>
                <textarea
                  rows={6}
                  required
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
