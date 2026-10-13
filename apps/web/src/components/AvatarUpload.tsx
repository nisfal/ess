import React, { useRef, useState } from 'react';
import {
  Upload,
  Camera,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Link,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
  initialName?: string;
  presets?: string[];
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  maxSizeMB = 2,
  initialName = 'U',
  presets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  ],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessNotice(null);

    // 1. Validasi jenis file (harus gambar)
    if (!file.type.startsWith('image/')) {
      setError('File yang dipilih bukan gambar. Harap pilih file JPG, PNG, atau WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validasi maksimal ukuran file (maxSizeMB)
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(
        `Ukuran foto terlalu besar (${fileSizeMB} MB). Maksimal ukuran file foto adalah ${maxSizeMB} MB.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);

    try {
      // 3. Baca dan kompres gambar secara client-side menggunakan Canvas
      const optimizedDataUrl = await processAndOptimizeImage(file);
      onChange(optimizedDataUrl);
      const originalSizeKB = Math.round(file.size / 1024);
      setSuccessNotice(`Foto berhasil dipilih (${originalSizeKB} KB &bull; teroptimasi)`);
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses gambar');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processAndOptimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_SIZE = 512;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Export as JPEG with 0.85 quality for compact size and great visual quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Format file gambar tidak valid atau rusak'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = () => {
    setError(null);
    setSuccessNotice('Foto profil dihapus');
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 border-2 border-zinc-200/90 shadow-xs flex items-center justify-center">
            {value ? (
              <img
                src={value}
                alt="Foto Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-600 font-bold text-xl">
                {initialName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
            title="Ganti Foto"
          >
            <Camera className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Ubah</span>
          </button>
        </div>

        {/* Action Buttons & Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              <span>{isProcessing ? 'Memproses...' : 'Upload Gambar'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-zinc-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Hapus Foto</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Link className="w-3 h-3 mr-1" />
              <span>Preset / URL</span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </button>
          </div>

          <p className="text-3xs text-zinc-500 flex items-center gap-1">
            <span className="font-semibold text-zinc-700">Maksimal {maxSizeMB} MB</span>
            <span>&bull;</span>
            <span>Format yang didukung: JPG, PNG, WEBP</span>
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Notice */}
      {successNotice && !error && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: successNotice }} />
        </div>
      )}

      {/* Optional Presets & URL Link Dropdown */}
      {showAdvanced && (
        <div className="p-3 bg-zinc-50 border border-zinc-200/90 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
          <div>
            <label className="block text-3xs font-semibold text-zinc-600 mb-1.5">
              Pilihan Preset Foto
            </label>
            <div className="flex items-center space-x-2">
              {presets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setError(null);
                    setSuccessNotice('Preset foto dipilih');
                    onChange(preset);
                  }}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                    value === preset
                      ? 'border-zinc-900 ring-2 ring-zinc-900/10 scale-110 shadow-xs'
                      : 'border-zinc-200 opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={`Preset ${idx + 1}`}
                >
                  <img
                    src={preset}
                    alt={`Preset ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-3xs font-semibold text-zinc-600 mb-1">
              Atau Masukkan URL Gambar (https://...)
            </label>
            <input
              type="text"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => {
                setError(null);
                onChange(e.target.value);
              }}
              placeholder="https://example.com/foto.jpg"
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};
