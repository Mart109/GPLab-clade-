import { useEffect, useState } from 'react';
import { SlideCanvas } from './SlideCanvas';
import type { Doc } from '../core/types';

export function Present({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [sw, setSw] = useState(window.innerWidth);
  const [sh, setSh] = useState(window.innerHeight);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
    };
    const r = () => { setSw(window.innerWidth); setSh(window.innerHeight); };
    window.addEventListener('keydown', k);
    window.addEventListener('resize', r);
    return () => { window.removeEventListener('keydown', k); window.removeEventListener('resize', r); };
  });

  const next = () => { setI((x) => Math.min(doc.slides.length - 1, x + 1)); setAnimKey((k) => k + 1); };
  const prev = () => { setI((x) => Math.max(0, x - 1)); setAnimKey((k) => k + 1); };

  const scl = Math.min(sw / 800, sh / 450);
  const trans = doc.slides[i]?.trans || 'none';

  return (
    <div className="pres" onClick={next}>
      <div key={animKey} className={'pres-anim ' + 'tr-' + trans}>
        <SlideCanvas
          slide={doc.slides[i]}
          scale={scl}
          selectedId={null}
          onSelect={() => {}}
          onChange={() => {}}
          readOnly
          animate
          snap={false}
        />
      </div>
      <div className="pres-info">← → слайды · Esc - выйти · {i + 1} / {doc.slides.length}</div>
    </div>
  );
}