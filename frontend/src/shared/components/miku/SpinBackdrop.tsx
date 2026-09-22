import { Sparkles } from 'lucide-react';
import { MikuSilhouette } from './MikuSilhouette';

export function SpinBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="animate-spin-slow absolute top-1/2 left-1/2 h-[75vmin] w-[75vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed [border-color:color-mix(in_srgb,var(--accent-pop)_18%,transparent)]" />
      <div className="animate-spin-xslow absolute top-1/2 left-1/2 h-[45vmin] w-[45vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed [border-color:color-mix(in_srgb,var(--accent)_35%,transparent)]" />
      <MikuSilhouette className="text-accent absolute top-1/2 left-1/2 h-[42vmin] w-auto -translate-x-1/2 -translate-y-1/2 opacity-10" />
      <Sparkles className="text-accent-pop animate-spin-xslow absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 opacity-50" />
    </div>
  );
}
