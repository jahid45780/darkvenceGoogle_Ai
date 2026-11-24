import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Upload,
  Star
} from 'lucide-react';
import { ProjectItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminProjectsPageProps {
  projects: ProjectItem[];
  onRefresh: () => void;
}

export const AdminProjectsPage: React.FC<AdminProjectsPageProps> = ({ projects, onRefresh }) => {
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Custom Delete Modal
  const [deletingProject, setDeletingProject] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newTech, setNewTech] = useState('');

  const handleEdit = (project: ProjectItem) => {
    setEditingProject({
      ...project,
      results: [...(project.results || [])],
      technologies: [...(project.technologies || [])],
      images: [...(project.images || [])]
    });
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreateNew = () => {
    setEditingProject({
      title: '',
      slug: '',
      client: 'Sample Client (Demo)',
      category: 'Website Development',
      description: '',
      challenge: '',
      solution: '',
      results: [
        { metric: '99.9%', label: 'Uptime reliability' },
        { metric: '+120%', label: 'Conversion rate' }
      ],
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      images: ['/src/assets/images/project_fintech_platform_1790497066827.jpg'],
      featured: false,
      status: 'published',
      order: projects.length + 1
    });
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleTitleChange = (title: string) => {
    if (!editingProject) return;
    const updates: Partial<ProjectItem> = { title };
    if (isCreating || !editingProject.slug) {
      updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    setEditingProject({ ...editingProject, ...updates });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, `${editingProject?.title || 'Project'}_asset`);
        if (res?.url) {
          setEditingProject(prev => prev ? {
            ...prev,
            images: [res.url, ...(prev.images || []).filter(img => img !== res.url)]
          } : null);
          setSuccessMessage('Project screenshot uploaded successfully.');
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
    if (!editingProject?.title || !editingProject?.slug) {
      setError('Title and slug are required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isCreating) {
        await api.createProject(editingProject);
        setSuccessMessage(`Project "${editingProject.title}" created successfully.`);
      } else if (editingProject.id) {
        await api.updateProject(editingProject.id, editingProject);
        setSuccessMessage(`Project "${editingProject.title}" updated successfully.`);
      }
      setEditingProject(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    setError(null);

    try {
      await api.deleteProject(deletingProject.id);
      setSuccessMessage(`Case study "${deletingProject.title}" deleted.`);
      setDeletingProject(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (project: ProjectItem) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateProject(project.id, { status: nextStatus });
      setSuccessMessage(`Project "${project.title}" status changed to ${nextStatus}.`);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B6FF2B] uppercase tracking-wider">
            <span>Portfolio CMS</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-1">Portfolio Case Studies CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage project showcases, quantified metrics, and imagery.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Study</span>
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

      {error && !editingProject && (
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

      {/* Projects Table */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Case Study</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {project.images?.[0] ? (
                        <img src={project.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-white font-display">{project.title}</span>
                        <p className="text-[11px] font-mono text-slate-400">/{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {project.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {project.client || 'Demo'}
                  </td>
                  <td className="py-3.5 px-4">
                    {project.featured ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        <span>Featured</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(project)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        project.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {project.status.toUpperCase()}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
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

      {/* Delete Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Delete Case Study?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">"{deletingProject.title}"</strong>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Case Study'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white font-display">
                {isCreating ? 'Create New Case Study' : `Edit: ${editingProject.title}`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Showcase verified technical and financial outcomes.</p>
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
                  <label className="font-semibold text-slate-300">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Slug Identifier *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Client Name</label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category</label>
                  <select
                    value={editingProject.category || 'Website Development'}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Website Development">Website Development</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Mobile Application">Mobile Application</option>
                    <option value="CMS Development">CMS Development</option>
                    <option value="Custom Software">Custom Software</option>
                    <option value="Performance Marketing">Performance Marketing</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Status</label>
                  <select
                    value={editingProject.status || 'published'}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <label className="font-semibold text-slate-300">Project Screenshot / Cover Image</label>
                <div className="flex items-center gap-3">
                  {editingProject.images?.[0] ? (
                    <img src={editingProject.images[0]} alt="" className="w-16 h-12 rounded-lg object-cover border border-white/10" />
                  ) : null}
                  <label className="px-3 py-1.5 bg-[#B6FF2B] text-black/20 hover:bg-[#B6FF2B] text-black/30 text-[#B6FF2B] border border-[#B6FF2B] rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                    {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploadingImage} />
                  </label>
                  <input
                    type="text"
                    placeholder="or paste image URL"
                    value={editingProject.images?.[0] || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, images: [e.target.value] })}
                    className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Summary Description</label>
                <textarea
                  rows={2}
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Architectural Challenge</label>
                  <textarea
                    rows={3}
                    value={editingProject.challenge || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, challenge: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Engineered Solution</label>
                  <textarea
                    rows={3}
                    value={editingProject.solution || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300">Technologies Used</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Next.js 15, PostgreSQL, Redis"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newTech.trim()) {
                          setEditingProject({ ...editingProject, technologies: [...(editingProject.technologies || []), newTech.trim()] });
                          setNewTech('');
                        }
                      }
                    }}
                    className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTech.trim()) {
                        setEditingProject({ ...editingProject, technologies: [...(editingProject.technologies || []), newTech.trim()] });
                        setNewTech('');
                      }
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editingProject.technologies?.map((tech, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black border border-[#232323] text-[#B6FF2B] text-[11px]">
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(editingProject.technologies || [])];
                          updated.splice(idx, 1);
                          setEditingProject({ ...editingProject, technologies: updated });
                        }}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredProject"
                  checked={!!editingProject.featured}
                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                  className="rounded border-white/20 bg-[#161616] accent-[#B6FF2B] focus:ring-[#B6FF2B]"
                />
                <label htmlFor="featuredProject" className="text-slate-300 cursor-pointer">
                  Featured on Homepage Work Showcase
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Case Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
