import type { Doc } from '../core/types';
import { I } from './Icons';

interface P {
  doc: Doc;
  cur: number;
  onPick: (i: number) => void;
  onAdd: () => void;
  onDel: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onDup: (i: number) => void;
}

export function SlidePanel({ doc, cur, onPick, onAdd, onDel, onMove, onDup }: P) {
  return (
    <aside className="slides">
      <div className="slides-hd">
        <span>Слайды</span>
        <button className="tb small" onClick={onAdd} title="Ctrl+N"><I.Plus /></button>
      </div>
      <div className="slides-list">
        {doc.slides.map((s, i) => (
          <div key={s.id} className={'slide-it' + (i === cur ? ' on' : '')} onClick={() => onPick(i)}>
            <span className="slide-num">{i + 1}</span>
            <div className="slide-mini" style={{ background: s.bg }}>
              {s.els.length === 0 && <span className="slide-mini-empty">пусто</span>}
              <div className="slide-mini" style={{ background: s.bg }}>
                {s.els.length === 0 && <span className="slide-mini-empty">пусто</span>}
              </div>
            </div>
            <div className="slide-btns">
              <button className="tb mini" onClick={(e) => { e.stopPropagation(); onMove(i, -1); }}><I.Up /></button>
              <button className="tb mini" onClick={(e) => { e.stopPropagation(); onMove(i, 1); }}><I.Down /></button>
              <button className="tb mini" onClick={(e) => { e.stopPropagation(); onDup(i); }}><I.Copy2 /></button>
              <button className="tb mini danger" onClick={(e) => { e.stopPropagation(); onDel(i); }}><I.Trash /></button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}