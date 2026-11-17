import { useRef, useState, type DragEvent } from 'react';
import { FileUp, FileVideo, ShieldCheck, Gauge } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { ACCEPTED_EXTENSIONS } from './validateFile';

const ACCEPT = ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(',');

/** Área de arrastar e soltar (vários arquivos) com o botão de seleção. */
export function UploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  return (
    <div
      data-testid="dropzone"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
        dragging ? 'border-primary bg-primary/[0.03]' : 'border-line-strong bg-surface'
      }`}
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-tint text-primary-ink" aria-hidden>
        <FileVideo size={30} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">Arraste e solte seus vídeos aqui ou clique para selecionar</h2>
        <p className="text-sm text-muted">
          Formatos aceitos: <span className="font-mono text-xs">{ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(', ')}</span> • Tamanho máximo:{' '}
          <span className="font-mono text-xs">500 MB</span> por arquivo
        </p>
      </div>
      <Button icon={<FileUp size={18} aria-hidden />} onClick={() => input.current?.click()} size="lg">
        <span>
          Selecionar arquivos<span className="hidden sm:inline"> do computador</span>
        </span>
      </Button>
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        aria-label="Selecionar vídeos"
        data-testid="file-input"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
          event.target.value = '';
        }}
      />
      <div className="mt-2 flex flex-col items-center gap-2 text-xs text-muted sm:flex-row sm:gap-4">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600" aria-hidden /> Envio direto e seguro para o armazenamento
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Gauge size={14} className="text-primary" aria-hidden /> Processamento assíncrono a 1 frame por segundo
        </span>
      </div>
    </div>
  );
}
