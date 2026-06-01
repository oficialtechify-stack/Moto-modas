import React, { useRef, useState, useEffect } from 'react';
import { Upload, Clipboard, Link, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ImageDropZoneProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function ImageDropZone({ value, onChange, label = "Imagem do Produto:" }: ImageDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteActive, setPasteActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  // Focus of paste detection
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only process paste if target is anywhere inside the dropzone or active window element isn't an input/textarea
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      
      const isFocusedInZone = zoneRef.current?.contains(activeEl);
      
      // If user focuses key areas or isn't typing in an input, process paste
      if (isFocusedInZone || !isInputFocused) {
        processClipboard(e);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [onChange]);

  // Helper to load File to Base64
  const fileToBase64 = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const processClipboard = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          fileToBase64(file);
          setPasteActive(true);
          setTimeout(() => setPasteActive(false), 1500);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileToBase64(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      fileToBase64(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    onChange('');
  };

  const isBase64 = value ? value.startsWith('data:image/') : false;

  return (
    <div className="space-y-2 text-left">
      <label className="text-zinc-400 font-bold block text-xs">{label}</label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Drag, Drop and Paste Interactive Zone */}
        <div
          ref={zoneRef}
          tabIndex={0}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`sm:col-span-2 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all outline-none focus:border-amber-500 hover:bg-zinc-900/60 min-h-[110px] ${
            dragActive 
              ? 'border-amber-500 bg-amber-500/10' 
              : pasteActive 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-zinc-800 bg-zinc-950/40'
          }`}
          title="Clique para anexar, arraste ou cole (Ctrl+V)"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-center gap-2.5 text-zinc-400">
            {pasteActive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
            ) : dragActive ? (
              <Upload className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              <div className="flex gap-2 text-zinc-500">
                <Upload className="w-4 h-4 text-zinc-400" />
                <Clipboard className="w-4 h-4 text-zinc-400" />
              </div>
            )}
            <span className={`text-[11px] font-medium leading-tight ${pasteActive ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
              {pasteActive 
                ? 'Imagem Colada com Sucesso!' 
                : dragActive 
                ? 'Solte a imagem aqui...' 
                : 'ANEXAR (Clique/Arraste) ou COLA (Ctrl+V)'}
            </span>
          </div>

          <p className="text-[9px] text-zinc-500 text-center leading-normal max-w-xs">
            Você pode colar capturas de tela, copiar imagens de sites e colar aqui usando o atalho de teclado tradicional do sistema operacional.
          </p>
        </div>

        {/* Thumbnail Preview and Control panel */}
        <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-2.5 flex items-center gap-3 sm:flex-col sm:justify-between sm:items-stretch min-h-[115px]">
          {value ? (
            <>
              <div className="relative w-16 h-16 sm:w-full sm:h-20 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 self-center shrink-0">
                <img
                  referrerPolicy="no-referrer"
                  src={value}
                  alt="Previa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // fallbacks
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100';
                  }}
                />
                <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-sm text-[8px] font-mono px-1 py-0.2 rounded text-zinc-400">
                  {isBase64 ? 'Local' : 'Web'}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center sm:flex-row sm:gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="max-sm:mt-1 bg-red-650/10 hover:bg-red-500 hover:text-white border border-red-900/30 text-red-400 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer w-full"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-2 text-zinc-650 border border-dashed border-zinc-900 rounded-xl">
              <ImageIcon className="w-6 h-6 mb-1 text-zinc-800" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Sem Prévia</span>
            </div>
          )}
        </div>
      </div>

      {/* URL textfield edit option */}
      <div className="flex gap-2 items-center bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-900">
        <Link className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <input
          type="text"
          placeholder="Alternativamente, cole a URL da imagem aqui..."
          value={isBase64 ? 'Imagem Anexada (Base64)' : value}
          onChange={(e) => {
            const val = e.target.value;
            // Only update if they write/paste an actual URL, let them clear it with the button
            if (val !== 'Imagem Anexada (Base64)') {
              onChange(val);
            }
          }}
          disabled={isBase64}
          className="bg-transparent w-full border-none text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none disabled:text-amber-500 disabled:font-bold"
        />
      </div>
    </div>
  );
}
