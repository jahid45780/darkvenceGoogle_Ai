import React, { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Search, ExternalLink, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { MediaItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminMediaPageProps {
  media: MediaItem[];
  onRefresh: () => void;
}

export const AdminMediaPage: React.FC<AdminMediaPageProps> = ({ media, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMedia = media.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setUploadError('Only JPEG, PNG, WebP, and SVG images are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB maximum limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const base64 = reader.result as string;
        await api.createMedia({
          name: file.name,
          url: base64,
          format: file.type.replace('image/', '') as any,
          sizeBytes: file.size,
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        });
        setSuccessMessage('Media asset uploaded and registered.');
        onRefresh();
      } catch (err: any) {
        setUploadError(err.message || 'Upload processing failed.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteMedia(deletingId);
      if (selectedItem?.id === deletingId) setSelectedItem(null);
      setSuccessMessage('Asset deleted from media library.');
      setDeletingId(null);
      onRefresh();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to remove media asset.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Media Library &amp; Asset Vault</h1>
          <p className="text-xs text-slate-400 mt-1">Manage optimized visual assets, dimensions, format compression, and alt text.</p>
        </div>

        <label className="px-4 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Compressing Asset...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Cloudinary credentials & Storage status note */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Storage Engine:</span>
          <span className="text-slate-400 font-mono">Cloudinary CDN &amp; Resilient Local Pipeline</span>
        </div>
        <div className="text-slate-500 text-[11px] font-mono">
          JPEG / PNG / WebP · Max 5MB per asset
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter media assets by name or alt text..."
          className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#B6FF2B]"
        />
      </div>

      {/* Grid of Media */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group rounded-2xl bg-[#0F0F0F] border border-white/5 hover:border-[#B6FF2B] p-3 space-y-2 cursor-pointer transition-all shadow-md relative overflow-hidden"
          >
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-white/5 relative">
              <img
                src={item.url}
                alt={item.altText || item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 right-2 text-[9px] font-mono bg-black/70 text-slate-300 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                {item.format}
              </span>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white truncate">{item.name}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{formatFileSize(item.sizeBytes)}</span>
                <span>{item.dimensions ? `${item.dimensions.width}x${item.dimensions.height}` : 'Responsive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white font-display">Asset Inspector</h3>

            <div className="rounded-xl overflow-hidden max-h-64 bg-slate-950 border border-white/10 flex items-center justify-center">
              <img
                src={selectedItem.url}
                alt={selectedItem.altText || selectedItem.name}
                referrerPolicy="no-referrer"
                className="max-h-64 object-contain"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono text-white">{selectedItem.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                <span className="text-slate-500">Size:</span>
                <span className="font-mono text-white">{formatFileSize(selectedItem.sizeBytes)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                <span className="text-slate-500">Format:</span>
                <span className="font-mono text-white uppercase">{selectedItem.format}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                <span className="text-slate-500">Alt Text:</span>
                <span className="text-white italic">{selectedItem.altText || 'Not specified'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setDeletingId(selectedItem.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Asset</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Media Asset?</h3>
            <p className="text-xs text-slate-400">Are you sure you want to permanently remove this asset from the media library?</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
