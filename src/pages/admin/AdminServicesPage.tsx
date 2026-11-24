import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Globe,
  Smartphone,
  LayoutGrid,
  TrendingUp,
  Share2,
  Cpu,
  Layers,
  Activity,
  Sparkles,
  Search,
  Upload,
  Image as ImageIcon,
  ArrowUpRight,
  ListPlus,
  HelpCircle,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ServiceItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminServicesPageProps {
  services: ServiceItem[];
  onRefresh: () => void;
}

export const AdminServicesPage: React.FC<AdminServicesPageProps> = ({ services, onRefresh }) => {
  // Search, filter, and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Editing / Creating modal state
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion modal state
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New feature / deliverable inputs for dynamic lists
  const [newFeature, setNewFeature] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newProcessStep, setNewProcessStep] = useState('');
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [newProcessDesc, setNewProcessDesc] = useState('');

  // Icon options
  const iconOptions = [
    { value: 'Globe', label: 'Globe (Web)', icon: Globe },
    { value: 'Smartphone', label: 'Smartphone (Mobile)', icon: Smartphone },
    { value: 'LayoutGrid', label: 'LayoutGrid (CMS)', icon: LayoutGrid },
    { value: 'TrendingUp', label: 'TrendingUp (Google Ads)', icon: TrendingUp },
    { value: 'Share2', label: 'Share2 (Social Ads)', icon: Share2 },
    { value: 'Cpu', label: 'Cpu (Custom Software)', icon: Cpu },
    { value: 'Layers', label: 'Layers (Web Apps)', icon: Layers },
    { value: 'Activity', label: 'Activity (Attribution / CRO)', icon: Activity },
    { value: 'Sparkles', label: 'Sparkles (Innovation)', icon: Sparkles }
  ];

  // Helper to render icon
  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-4 h-4 text-[#B6FF2B]" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4 text-[#B6FF2B]" />;
      case 'LayoutGrid': return <LayoutGrid className="w-4 h-4 text-[#B6FF2B]" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-[#B6FF2B]" />;
      case 'Share2': return <Share2 className="w-4 h-4 text-[#B6FF2B]" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-[#B6FF2B]" />;
      case 'Layers': return <Layers className="w-4 h-4 text-[#B6FF2B]" />;
      case 'Activity': return <Activity className="w-4 h-4 text-[#B6FF2B]" />;
      default: return <Sparkles className="w-4 h-4 text-[#B6FF2B]" />;
    }
  };

  // Helper to auto-suggest slug from title
  const handleTitleChange = (title: string) => {
    if (!editingService) return;
    const updates: Partial<ServiceItem> = { title };
    if (isCreating || !editingService.slug) {
      updates.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    setEditingService({ ...editingService, ...updates });
  };

  // Filter and search services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, searchQuery, statusFilter]);

  // Paginated services
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  // Open Edit Modal
  const handleEdit = (service: ServiceItem) => {
    setEditingService({
      ...service,
      features: [...(service.features || [])],
      deliverables: [...(service.deliverables || [])],
      process: [...(service.process || [])],
      faqs: [...(service.faqs || [])]
    });
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Open Create Modal
  const handleCreateNew = () => {
    setEditingService({
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      icon: 'Globe',
      category: 'Web Engineering',
      coverImage: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
      ogImage: '',
      features: [
        'High-concurrency React & Next.js core architecture',
        'Sub-second Core Web Vitals optimization'
      ],
      deliverables: [
        'Modular source repository and build pipeline',
        'Technical architectural documentation and SLA'
      ],
      process: [
        { step: '01', title: 'Technical Discovery', description: 'Architecture audit and specifications' },
        { step: '02', title: 'Sprint Delivery', description: 'Modular engineering and continuous QA' },
        { step: '03', title: 'Production Launch', description: 'Hardened cloud deployment and attribution setup' }
      ],
      faqs: [
        { question: 'What is the standard engagement timeline?', answer: 'Typical sprint delivery cycles range between 4 to 8 weeks depending on scope.' }
      ],
      featured: false,
      status: 'published',
      order: services.length + 1,
      seoTitle: '',
      seoDescription: ''
    });
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle Cover Image File Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be under 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const uploadRes = await api.uploadImage(base64Data, `${editingService?.title || 'Service'}_cover`);
          if (uploadRes?.url) {
            setEditingService(prev => prev ? { ...prev, coverImage: uploadRes.url } : null);
            setSuccessMessage('Cover image uploaded successfully to Cloudinary / Asset Registry.');
          }
        } catch (uploadErr: any) {
          setError(uploadErr.message || 'Image upload failed. Please try a direct URL or smaller file.');
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Failed to process image file.');
      setIsUploadingImage(false);
    }
  };

  // Add / Remove dynamic items
  const addFeature = () => {
    if (!newFeature.trim() || !editingService) return;
    setEditingService({
      ...editingService,
      features: [...(editingService.features || []), newFeature.trim()]
    });
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    if (!editingService) return;
    const updated = [...(editingService.features || [])];
    updated.splice(idx, 1);
    setEditingService({ ...editingService, features: updated });
  };

  const addDeliverable = () => {
    if (!newDeliverable.trim() || !editingService) return;
    setEditingService({
      ...editingService,
      deliverables: [...(editingService.deliverables || []), newDeliverable.trim()]
    });
    setNewDeliverable('');
  };

  const removeDeliverable = (idx: number) => {
    if (!editingService) return;
    const updated = [...(editingService.deliverables || [])];
    updated.splice(idx, 1);
    setEditingService({ ...editingService, deliverables: updated });
  };

  const addProcessStep = () => {
    if (!newProcessTitle.trim() || !editingService) return;
    const nextStepNum = String((editingService.process?.length || 0) + 1).padStart(2, '0');
    setEditingService({
      ...editingService,
      process: [
        ...(editingService.process || []),
        {
          step: newProcessStep.trim() || nextStepNum,
          title: newProcessTitle.trim(),
          description: newProcessDesc.trim() || 'Execution phase'
        }
      ]
    });
    setNewProcessStep('');
    setNewProcessTitle('');
    setNewProcessDesc('');
  };

  const removeProcessStep = (idx: number) => {
    if (!editingService) return;
    const updated = [...(editingService.process || [])];
    updated.splice(idx, 1);
    setEditingService({ ...editingService, process: updated });
  };

  const addFaq = () => {
    if (!newFaqQ.trim() || !editingService) return;
    setEditingService({
      ...editingService,
      faqs: [
        ...(editingService.faqs || []),
        {
          question: newFaqQ.trim(),
          answer: newFaqA.trim() || 'Detailed consultation provided upon client intake.'
        }
      ]
    });
    setNewFaqQ('');
    setNewFaqA('');
  };

  const removeFaq = (idx: number) => {
    if (!editingService) return;
    const updated = [...(editingService.faqs || [])];
    updated.splice(idx, 1);
    setEditingService({ ...editingService, faqs: updated });
  };

  // Save Service
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingService?.title?.trim()) {
      setError('Service title is required.');
      return;
    }

    if (!editingService?.slug?.trim()) {
      setError('URL slug is required.');
      return;
    }

    if (!editingService?.shortDescription?.trim()) {
      setError('Short summary description is required.');
      return;
    }

    if (!editingService?.fullDescription?.trim()) {
      setError('Full technical description is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isCreating) {
        await api.createService(editingService);
        setSuccessMessage(`Service "${editingService.title}" created successfully!`);
      } else if (editingService.id) {
        await api.updateService(editingService.id, editingService);
        setSuccessMessage(`Service "${editingService.title}" updated successfully!`);
      }
      setEditingService(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save service.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle status directly from table
  const handleQuickStatusChange = async (service: ServiceItem, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      await api.updateServiceStatus(service.id, newStatus);
      setSuccessMessage(`Service "${service.title}" status changed to ${newStatus}.`);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to change service status.');
    }
  };

  // Confirm Delete
  const handleExecuteDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    setError(null);

    try {
      await api.deleteService(deletingService.id);
      setSuccessMessage(`Service "${deletingService.title}" has been deleted.`);
      setDeletingService(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete service.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B6FF2B] uppercase tracking-wider">
            <span>Admin CMS</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Agency Capabilities</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-1">Services Management CMS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage agency offerings, deliverables, execution workflows, and SEO metadata.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && !editingService && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#0F0F0F] border border-white/5 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services by title, slug, or keywords..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#161616] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF2B]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
          {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
              {status === 'all' && ` (${services.length})`}
              {status !== 'all' && ` (${services.filter(s => s.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table Card */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Slug &amp; Route</th>
                <th className="py-3.5 px-4">Icon &amp; Media</th>
                <th className="py-3.5 px-4">Features &amp; Phases</th>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <p className="text-sm">No services found matching your criteria.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                      className="text-xs text-[#B6FF2B] hover:underline"
                    >
                      Clear search and filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedServices.map((service) => (
                  <tr key={service.id} className="hover:bg-white/[0.015] transition-colors group">
                    {/* Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#B6FF2B] transition-colors">
                          {renderServiceIcon(service.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white font-display text-sm">
                              {service.title}
                            </span>
                            {service.featured && (
                              <span className="flex items-center gap-0.5 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Star className="w-2.5 h-2.5 fill-amber-300" />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {service.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4">
                      <a
                        href={`/services/${service.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-slate-400 hover:text-[#B6FF2B] transition-colors"
                      >
                        <span>/{service.slug}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </td>

                    {/* Media */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {service.coverImage ? (
                          <img
                            src={service.coverImage}
                            alt={service.title}
                            className="w-8 h-8 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          {service.icon}
                        </span>
                      </div>
                    </td>

                    {/* Features count */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-400">
                        <span>{service.features?.length || 0} features</span>
                        <span className="mx-1 text-slate-600">·</span>
                        <span>{service.process?.length || 0} steps</span>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      #{service.order}
                    </td>

                    {/* Status with quick toggle */}
                    <td className="py-3.5 px-4">
                      <select
                        value={service.status}
                        onChange={(e) => handleQuickStatusChange(service, e.target.value as any)}
                        className={`text-[10px] font-mono px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          service.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : service.status === 'draft'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                        }`}
                      >
                        <option value="published" className="bg-[#0e1017] text-white">Published</option>
                        <option value="draft" className="bg-[#0e1017] text-white">Draft</option>
                        <option value="archived" className="bg-[#0e1017] text-white">Archived</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingService(service)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.01] text-xs text-slate-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} services
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Delete Service Offering?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">"{deletingService.title}"</strong> ({deletingService.slug})?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setDeletingService(null)}
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Service'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Service Comprehensive Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            {/* Modal Close button */}
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B6FF2B] uppercase tracking-wider">
                <span>{isCreating ? 'CMS Creator' : 'CMS Editor'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
                {isCreating ? 'Add New Agency Service' : `Edit: ${editingService.title}`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure service details, deliverables, execution phases, and SEO tags.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Section 1: Basic Identifiers */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  1. Service Overview &amp; Routing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-300">
                      Service Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Website Development"
                      value={editingService.title || ''}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF2B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-slate-300">
                      URL Slug <span className="text-rose-400">*</span> (lowercase alphanumeric)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. website-development"
                      value={editingService.slug || ''}
                      onChange={(e) => setEditingService({ ...editingService, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B6FF2B]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-300">
                    Short Summary Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Short elevator pitch displayed on cards and overview grids..."
                    value={editingService.shortDescription || ''}
                    onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF2B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-300">
                    Full Technical Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="In-depth explanation of technical methods, business impact, and architectural approach..."
                    value={editingService.fullDescription || ''}
                    onChange={(e) => setEditingService({ ...editingService, fullDescription: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF2B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-300">Icon Symbol</label>
                    <select
                      value={editingService.icon || 'Globe'}
                      onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#B6FF2B]"
                    >
                      {iconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0e1017]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-slate-300">Status</label>
                    <select
                      value={editingService.status || 'published'}
                      onChange={(e) => setEditingService({ ...editingService, status: e.target.value as any })}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#B6FF2B]"
                    >
                      <option value="published" className="bg-[#0e1017]">Published (Live)</option>
                      <option value="draft" className="bg-[#0e1017]">Draft (Private)</option>
                      <option value="archived" className="bg-[#0e1017]">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-slate-300">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={editingService.order || 1}
                      onChange={(e) => setEditingService({ ...editingService, order: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#B6FF2B]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featuredService"
                    checked={!!editingService.featured}
                    onChange={(e) => setEditingService({ ...editingService, featured: e.target.checked })}
                    className="rounded border-white/20 bg-[#161616] accent-[#B6FF2B] focus:ring-[#B6FF2B]"
                  />
                  <label htmlFor="featuredService" className="text-slate-300 cursor-pointer">
                    Feature on Homepage highlight cards
                  </label>
                </div>
              </div>

              {/* Section 2: Cover Image & Media */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  2. Cover Image &amp; Media (Cloudinary)
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {editingService.coverImage ? (
                    <div className="relative group w-36 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img
                        src={editingService.coverImage}
                        alt="Service Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingService({ ...editingService, coverImage: '' })}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-300 text-[10px] font-semibold transition-opacity"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 h-24 rounded-xl bg-white/5 border border-dashed border-white/15 flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">No image set</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <label className="font-medium text-slate-300">Upload to Cloudinary or Enter URL</label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 bg-[#B6FF2B] text-black/20 hover:bg-[#B6FF2B] text-black/30 text-[#B6FF2B] border border-[#B6FF2B] rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                        {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{isUploadingImage ? 'Uploading...' : 'Choose File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-slate-500 text-[10px]">or</span>
                      <input
                        type="text"
                        placeholder="Paste image URL (https://...)"
                        value={editingService.coverImage || ''}
                        onChange={(e) => setEditingService({ ...editingService, coverImage: e.target.value })}
                        className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#B6FF2B]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Features & Deliverables */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  3. Key Features &amp; Deliverables
                </h3>

                {/* Features */}
                <div className="space-y-2">
                  <label className="font-medium text-slate-300">Technical Features / Benefits</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Next.js App Router with Server-Side Rendering"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                      className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editingService.features?.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black border border-[#232323] text-[#B6FF2B] text-[11px]"
                      >
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="font-medium text-slate-300">Client Deliverables</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Production GitHub repository with automated CI/CD"
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable(); } }}
                      className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addDeliverable}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editingService.deliverables?.map((del, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black border border-[#232323] text-[#B6FF2B] text-[11px]"
                      >
                        <span>{del}</span>
                        <button
                          type="button"
                          onClick={() => removeDeliverable(idx)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Execution Process Steps */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  4. Execution Phases &amp; Process Steps
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Step (e.g. 01)"
                    value={newProcessStep}
                    onChange={(e) => setNewProcessStep(e.target.value)}
                    className="bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Phase Title"
                    value={newProcessTitle}
                    onChange={(e) => setNewProcessTitle(e.target.value)}
                    className="sm:col-span-2 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={addProcessStep}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 cursor-pointer text-center"
                  >
                    Add Phase
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Phase description..."
                  value={newProcessDesc}
                  onChange={(e) => setNewProcessDesc(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                />

                <div className="space-y-2 pt-2">
                  {editingService.process?.map((proc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#B6FF2B] font-semibold">{proc.step}</span>
                        <div>
                          <p className="font-semibold text-white">{proc.title}</p>
                          <p className="text-[11px] text-slate-400">{proc.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProcessStep(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: FAQs */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  5. Frequently Asked Questions (Service FAQs)
                </h3>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Question (e.g. How does your sprint handoff work?)"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Answer..."
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                    />
                    <button
                      type="button"
                      onClick={addFaq}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 cursor-pointer"
                    >
                      Add FAQ
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {editingService.faqs?.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">Q: {faq.question}</p>
                        <p className="text-[11px] text-slate-400">A: {faq.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: SEO Metadata */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  6. SEO &amp; Open Graph Metadata
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-300">Custom SEO Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Website Development — Darkvence Agency"
                      value={editingService.seoTitle || ''}
                      onChange={(e) => setEditingService({ ...editingService, seoTitle: e.target.value })}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-slate-300">Open Graph Social Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingService.ogImage || ''}
                      onChange={(e) => setEditingService({ ...editingService, ogImage: e.target.value })}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-300">Meta Description</label>
                  <textarea
                    rows={2}
                    placeholder="Search engine snippet describing this service..."
                    value={editingService.seoDescription || ''}
                    onChange={(e) => setEditingService({ ...editingService, seoDescription: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  disabled={isSaving}
                  className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl shadow-lg shadow-[#B6FF2B]/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Persisting to Database...' : isCreating ? 'Publish New Service' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
