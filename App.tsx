import { useEffect, useMemo, useRef, useState } from 'react';
import { SlideCanvas } from './components/SlideCanvas';
import { SlidePanel } from './components/SlidePanel';
import { Present } from './components/Present';
import { NotesPanel } from './components/NotesPanel';
import { I } from './components/Icons';
import { useDoc } from './core/useDoc';
import type { El, Kind, Trans, ChartKind } from './core/types';
import * as io from './core/io';
import { THEMES, TEMPLATES, applyThemeToSlide } from './core/templates';
import { generateDemoPresentation } from './core/code-presets';

const nid = () => Math.random().toString(36).slice(2, 10);

function mkEl(k: Kind): El {
  const b = { id: nid(), x: 120, y: 100, w: 240, h: 130, rot: 0, anim: 'none' as any, delay: 0 };
  if (k === 'txt') return { ...b, kind: 'txt', s: 'Текст', fs: 28, col: '#111', list: 'none' };
  if (k === 'rect') return { ...b, kind: 'rect', fill: '#7c5cff', rad: 0 };
  if (k === 'oval') return { ...b, kind: 'oval', fill: '#22c1a6' };
  if (k === 'ln') return { ...b, kind: 'ln', pts: [0, 0, 220, 0], col: '#333', wd: 3 };
  if (k === 'img') return { ...b, kind: 'img', src: '' };
  return {
    ...b, kind: 'chart', ctype: 'bar' as ChartKind,
    data: [10, 20, 30], labels: ['A', 'B', 'C'],
    colors: ['#2563eb', '#e11d48', '#059669']
  };
}

export default function App() {
  const { doc, setDoc, undo, redo, reset, canUndo, canRedo } = useDoc();
  const [cur, setCur] = useState(0);
  const [selIds, setSelIds] = useState<string[]>([]);
  const [present, setPresent] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [snap, setSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [theme, setTheme] = useState(0);
  const [editing, setEditing] = useState<any>(null);
  const [warnOpen, setWarnOpen] = useState(true);
  
  const stageRef = useRef<any>(null);
  const clip = useRef<El | null>(null);

  const sld = doc.slides[cur] || doc.slides[0];
  const curEl = useMemo(() => sld.els.find((e) => e.id === selIds[0]) || null, [sld, selIds]);

  const updEls = (els: El[]) => {
    setDoc((d) => ({ ...d, slides: d.slides.map((s, i) => (i === cur ? { ...s, els } : s)) }));
  };

  const addSlide = () => {
    const t = THEMES[theme];
    setDoc((d) => ({ ...d, slides: [...d.slides, { id: nid(), bg: t.bg, els: [], trans: 'fade' }] }));
    setCur(doc.slides.length);
    setSelIds([]);
  };

  const dupSlide = (i: number) => {
    setDoc((d) => {
      const copy = JSON.parse(JSON.stringify(d.slides[i]));
      copy.id = nid();
      copy.els.forEach((e: any) => (e.id = nid()));
      const arr = d.slides.slice();
      arr.splice(i + 1, 0, copy);
      return { ...d, slides: arr };
    });
    setCur(i + 1);
  };

  const delSlide = (i: number) => {
    if (doc.slides.length <= 1) return;
    setDoc((d) => ({ ...d, slides: d.slides.filter((_, k) => k !== i) }));
    setCur((c) => Math.max(0, Math.min(c, doc.slides.length - 2)));
    setSelIds([]);
  };

  const moveSlide = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= doc.slides.length) return;
    setDoc((d) => {
      const arr = d.slides.slice();
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, slides: arr };
    });
    setCur(j);
  };

  const addEl = (k: Kind) => {
    if (k === 'img') return pickImg();
    updEls([...sld.els, mkEl(k)]);
  };

  const pickImg = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        const el = mkEl('img') as any;
        el.src = r.result; el.w = 320; el.h = 210;
        updEls([...sld.els, el]);
      };
      r.readAsDataURL(f);
    };
    inp.click();
  };

  const patchEl = (p: Partial<El>) => {
    if (!curEl) return;
    updEls(sld.els.map((e) => (e.id === curEl.id ? ({ ...e, ...p } as El) : e)));
  };

  const delEl = () => {
    if (!selIds.length) return;
    updEls(sld.els.filter((e) => !selIds.includes(e.id)));
    setSelIds([]);
  };

  const dupEl = () => {
    if (!curEl) return;
    const c: any = { ...curEl, id: nid(), x: curEl.x + 20, y: curEl.y + 20 };
    updEls([...sld.els, c]);
    setSelIds([c.id]);
  };

  const orderEl = (dir: 'up' | 'down' | 'front' | 'back') => {
    if (!curEl) return;
    const arr = sld.els.slice();
    const idx = arr.findIndex((e) => e.id === curEl.id);
    if (idx < 0) return;
    const [item] = arr.splice(idx, 1);
    if (dir === 'up') arr.splice(Math.min(arr.length, idx + 1), 0, item);
    else if (dir === 'down') arr.splice(Math.max(0, idx - 1), 0, item);
    else if (dir === 'front') arr.push(item);
    else arr.unshift(item);
    updEls(arr);
  };

  const alignEl = (a: 'l' | 'c' | 'r' | 't' | 'm' | 'b') => {
    if (!curEl) return;
    const W = 800, H = 450;
    const p: any = {};
    if (a === 'l') p.x = 0;
    if (a === 'c') p.x = (W - curEl.w) / 2;
    if (a === 'r') p.x = W - curEl.w;
    if (a === 't') p.y = 0;
    if (a === 'm') p.y = (H - curEl.h) / 2;
    if (a === 'b') p.y = H - curEl.h;
    patchEl(p);
  };

  const saveDoc = () => {
    const n = io.pickName(doc.name);
    if (n == null) return;
    setDoc((d) => ({ ...d, name: n }));
    io.saveJson({ ...doc, name: n }, n);
  };

  const openDoc = async () => {
    const d = await io.pickJson();
    if (d) { reset(d); setCur(0); setSelIds([]); }
  };

  const newDoc = () => {
    if (!window.confirm('Создать новый файл? Несохранённые изменения потеряются.')) return;
    const t = THEMES[theme];
    reset({ id: nid(), name: 'Презентация', slides: [{ id: nid(), bg: t.bg, els: [], trans: 'none' }] });
    setCur(0); setSelIds([]);
  };

  const applyTemplate = (idx: number) => {
    const t = THEMES[theme];
    const s = TEMPLATES[idx].build(t);
    s.trans = sld.trans || 'none';
    setDoc((d) => ({ ...d, slides: d.slides.map((sl, i) => (i === cur ? s : sl)) }));
    setSelIds([]);
  };

  const applyTheme = (idx: number) => {
    const newT = THEMES[idx];
    const oldT = THEMES[theme];
    setTheme(idx);
    setDoc((d) => ({ ...d, slides: d.slides.map((s) => applyThemeToSlide(s, oldT, newT)) }));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();

      if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && k === 'y') { e.preventDefault(); redo(); }
      else if (mod && k === 's') { e.preventDefault(); saveDoc(); }
      else if (mod && k === 'o') { e.preventDefault(); openDoc(); }
      else if (mod && k === 'n') { e.preventDefault(); addSlide(); }
      else if (mod && k === 'd') { e.preventDefault(); dupEl(); }
      else if (mod && k === 'c' && selIds.length) { clip.current = { ...curEl! }; }
      else if (mod && k === 'v' && clip.current) {
        const c: any = { ...clip.current, id: nid(), x: clip.current.x + 30, y: clip.current.y + 30 };
        updEls([...sld.els, c]);
        setSelIds([c.id]);
      }
      else if (e.key === 'F5') { e.preventDefault(); setPresent(true); }
      else if (e.key === 'Escape') { setSelIds([]); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selIds.length) { e.preventDefault(); delEl(); }
      else if (e.key === 'PageDown') { setCur((c) => Math.min(doc.slides.length - 1, c + 1)); }
      else if (e.key === 'PageUp') { setCur((c) => Math.max(0, c - 1)); }
      else if (selIds.length && curEl && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const map: any = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        const [dx, dy] = map[e.key];
        patchEl({ x: curEl.x + dx, y: curEl.y + dy });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="app">
      <header className="hdr">
        <div className="brand"><b>GPLab</b><span>слайды</span></div>
        <div className="menu">
          <button className="tb" onClick={newDoc}><I.New /> Новый</button>
          <button className="tb" onClick={openDoc}><I.Open /> Открыть</button>
          <button className="tb" onClick={saveDoc}><I.Save /> Сохранить</button>
          
          <button className="tb" onClick={() => reset(generateDemoPresentation())} title="Сгенерировать кодом">
            ⚡ Демо-код
          </button>

          <span className="sep" />
          <button className="tb" onClick={undo} disabled={!canUndo} title="Ctrl+Z"><I.Undo /></button>
          <button className="tb" onClick={redo} disabled={!canRedo} title="Ctrl+Y"><I.Redo /></button>
          
          <span className="sep" />
          <button className="tb" onClick={() => io.exportPng(stageRef.current, doc.name)}>PNG</button>
          <button className="tb" onClick={() => io.exportPngAll(doc, doc.name)}>PNG все</button>
          <button className="tb" onClick={() => io.exportPdf(doc, doc.name)}><I.Pdf /> PDF</button>
          <button className="tb" onClick={() => io.exportPptx(doc, doc.name)}><I.Pptx /> PPTX</button>
        </div>
        <span className="grow" />
        <select className="sel" value={theme} onChange={(e) => applyTheme(+e.target.value)} title="Тема">
          {THEMES.map((t, i) => <option key={i} value={i}>Тема: {t.name}</option>)}
        </select>
        <button className="tb primary" onClick={() => setPresent(true)} title="F5"><I.Play /> Показ</button>
      </header>

      {warnOpen && (
        <div className="warn">
          <span className="warn-ico">!</span>
          <span>Анимации и переходы <b>пока в разработке</b> - работают только в GPLab Slides. В PDF/PPTX они не переносятся.</span>
          <button className="warn-close" onClick={() => setWarnOpen(false)}>Понятно</button>
        </div>
      )}

      <div className="main">
        <SlidePanel
          doc={doc} cur={cur}
          onPick={(i) => { setCur(i); setSelIds([]); }}
          onAdd={addSlide} onDel={delSlide} onMove={moveSlide} onDup={dupSlide}
        />

        <section className="work">
          <div className="tools">
            <button className="tb" onClick={() => addEl('txt')} title="Текст"><I.Text /></button>
            <button className="tb" onClick={() => addEl('rect')} title="Фигура"><I.Rect /></button>
            <button className="tb" onClick={() => addEl('oval')} title="Круг"><I.Oval /></button>
            <button className="tb" onClick={() => addEl('ln')} title="Линия"><I.Line /></button>
            <button className="tb" onClick={() => addEl('img')} title="Картинка"><I.Image /></button>
            <button className="tb" onClick={() => addEl('chart')} title="График"><I.Chart /></button>

            <span className="sep" />
            <label className="color">
              <span>Фон</span>
              <input type="color" value={sld.bg} onChange={(e) => setDoc((d) => ({ ...d, slides: d.slides.map((s, i) => (i === cur ? { ...s, bg: e.target.value } : s)) }))} />
            </label>
            
            <select className="sel" value={sld.pat || 'none'} onChange={(e) => setDoc((d) => ({ ...d, slides: d.slides.map((s, i) => (i === cur ? { ...s, pat: e.target.value as any } : s)) }))}>
              <option value="none">Фон: чистый</option>
              <option value="dots">Фон: точки</option>
              <option value="lines">Фон: линии</option>
              <option value="grid">Фон: клетка</option>
            </select>
            <input type="color" value={sld.patCol || '#000000'} onChange={(e) => setDoc((d) => ({ ...d, slides: d.slides.map((s, i) => (i === cur ? { ...s, patCol: e.target.value } : s)) }))} title="Цвет узора" style={{ width: 36, height: 36, padding: 0, border: '1px solid #2a2d38', background: 'transparent' }} />

            <select className="sel" value={sld.trans || 'none'} onChange={(e) => setDoc((d) => ({ ...d, slides: d.slides.map((s, i) => (i === cur ? { ...s, trans: e.target.value as Trans } : s)) }))}>
              <option value="none">Переход: нет</option>
              <option value="fade">Переход: плавно</option>
              <option value="slide">Переход: сдвиг</option>
              <option value="zoom">Переход: зум</option>
            </select>

            <select className="sel" onChange={(e) => { if (e.target.value) { applyTemplate(+e.target.value); e.target.value = ''; } }} defaultValue="">
              <option value="" disabled>Шаблон...</option>
              {TEMPLATES.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
            </select>

            <span className="grow" />
            <button className={'tb' + (showGrid ? ' on' : '')} onClick={() => setShowGrid(!showGrid)}><I.Grid /></button>
            <button className={'tb' + (snap ? ' on' : '')} onClick={() => setSnap(!snap)}>snap</button>
            <button className="tb" onClick={dupEl} disabled={!curEl}><I.Copy2 /> Дубль</button>
            <button className="tb danger" onClick={delEl} disabled={!selIds.length}><I.Trash /> Удалить</button>
          </div>

          <div className="canvas-wrap">
            <div className="canvas-box" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <SlideCanvas
                slide={sld}
                selectedIds={selIds}
                onSelect={setSelIds}
                onChange={updEls}
                snap={snap}
                showGrid={showGrid}
                stageRef={(st) => { stageRef.current = st; }}
                onEditText={(el, rect) => setEditing({ el, rect, value: el.s })}
              />
            </div>
            
            {editing && (
              <textarea
                className="inline-edit" autoFocus value={editing.value}
                style={{ left: editing.rect.left, top: editing.rect.top, width: editing.rect.width, height: editing.rect.height, fontSize: editing.rect.fontSize, color: editing.rect.color, textAlign: editing.rect.align, fontWeight: editing.rect.bold ? 'bold' : 'normal', fontStyle: editing.rect.italic ? 'italic' : 'normal' }}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onBlur={() => { patchEl({ s: editing.value }); setEditing(null); }}
                onKeyDown={(e) => { if (e.key === 'Escape') setEditing(null); if (e.key === 'Enter' && e.ctrlKey) { patchEl({ s: editing.value }); setEditing(null); } }}
              />
            )}
          </div>

          <NotesPanel
            value={sld.note || ''}
            onChange={(v) => setDoc((d) => ({ ...d, slides: d.slides.map((s, i) => (i === cur ? { ...s, note: v } : s)) }))}
            open={notesOpen} onToggle={() => setNotesOpen(!notesOpen)}
          />

          <div className="statusbar">
            <span>Слайд {cur + 1} / {doc.slides.length}</span>
            <span className="sep-dot" />
            <span>Элементов: {sld.els.length}</span>
            <span className="grow" />
            <button className="tb small" onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.1).toFixed(2)))}><I.ZOut /></button>
            <span className="zoom">{Math.round(zoom * 100)}%</span>
            <button className="tb small" onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))}><I.ZIn /></button>
            <button className="tb small" onClick={() => setZoom(1)}>100%</button>
          </div>
        </section>

        <aside className="insp">
          <div className="insp-hd">Свойства</div>
          {!curEl && <div className="insp-empty">Ничего не выбрано</div>}
          
          {curEl && (
            <>
              {curEl.kind === 'txt' && (
                <>
                  <label>Текст</label>
                  <textarea value={curEl.s} onChange={(e) => patchEl({ s: e.target.value })} rows={3} />
                  <div className="row">
                    <div><label>Размер</label><input type="number" value={curEl.fs} onChange={(e) => patchEl({ fs: +e.target.value })} /></div>
                    <div><label>Цвет</label><input type="color" value={curEl.col} onChange={(e) => patchEl({ col: e.target.value })} /></div>
                  </div>
                  <div className="row btns">
                    <button className={'tb' + (curEl.bold ? ' on' : '')} onClick={() => patchEl({ bold: !curEl.bold })}><I.Bold /></button>
                    <button className={'tb' + (curEl.italic ? ' on' : '')} onClick={() => patchEl({ italic: !curEl.italic })}><I.Italic /></button>
                    <button className={'tb' + (curEl.align === 'center' ? ' on' : '')} onClick={() => patchEl({ align: 'center' })}><I.AlignC /></button>
                    <button className={'tb' + (curEl.align === 'right' ? ' on' : '')} onClick={() => patchEl({ align: 'right' })}><I.AlignR /></button>
                  </div>
                  <label>Обводка (цвет)</label>
                  <input type="color" value={curEl.stroke || '#000000'} onChange={(e) => patchEl({ stroke: e.target.value })} />
                  <label>Толщина обводки</label>
                  <input type="number" value={curEl.strokeW || 0} onChange={(e) => patchEl({ strokeW: +e.target.value })} />
                </>
              )}

              {curEl.kind === 'rect' && (
                <>
                  <label>Заливка</label>
                  <input type="color" value={curEl.fill} onChange={(e) => patchEl({ fill: e.target.value })} />
                  <label>Градиент (2-й цвет)</label>
                  <input type="color" value={curEl.grad2 || curEl.fill} onChange={(e) => patchEl({ grad2: e.target.value })} />
                  <button className="tb" onClick={() => patchEl({ grad2: undefined })} style={{ marginTop: 4 }}>Убрать градиент</button>
                  <label>Радиус</label>
                  <input type="number" value={curEl.rad || 0} onChange={(e) => patchEl({ rad: +e.target.value })} />
                  <label>Обводка (цвет)</label>
                  <input type="color" value={curEl.stroke || '#000000'} onChange={(e) => patchEl({ stroke: e.target.value })} />
                  <label>Толщина обводки</label>
                  <input type="number" value={curEl.strokeW || 0} onChange={(e) => patchEl({ strokeW: +e.target.value })} />
                </>
              )}

              {curEl.kind === 'oval' && (
                <>
                  <label>Заливка</label>
                  <input type="color" value={curEl.fill} onChange={(e) => patchEl({ fill: e.target.value })} />
                  <label>Градиент (2-й цвет)</label>
                  <input type="color" value={curEl.grad2 || curEl.fill} onChange={(e) => patchEl({ grad2: e.target.value })} />
                  <button className="tb" onClick={() => patchEl({ grad2: undefined })} style={{ marginTop: 4 }}>Убрать градиент</button>
                  <label>Обводка (цвет)</label>
                  <input type="color" value={curEl.stroke || '#000000'} onChange={(e) => patchEl({ stroke: e.target.value })} />
                  <label>Толщина обводки</label>
                  <input type="number" value={curEl.strokeW || 0} onChange={(e) => patchEl({ strokeW: +e.target.value })} />
                </>
              )}

              {curEl.kind === 'ln' && (
                <>
                  <label>Цвет</label>
                  <input type="color" value={curEl.col} onChange={(e) => patchEl({ col: e.target.value })} />
                  <label>Толщина</label>
                  <input type="number" value={curEl.wd} onChange={(e) => patchEl({ wd: +e.target.value })} />
                </>
              )}

              {curEl.kind === 'chart' && (
                <>
                  <label>Тип</label>
                  <select value={curEl.ctype} onChange={(e) => patchEl({ ctype: e.target.value as any })}>
                    <option value="bar">Столбцы</option>
                    <option value="pie">Круговая</option>
                    <option value="line">Линия</option>
                  </select>
                  <label>Значения</label>
                  <input type="text" value={curEl.data.join(', ')} onChange={(e) => patchEl({ data: e.target.value.split(',').map(Number) })} />
                  <label>Подписи</label>
                  <input type="text" value={curEl.labels.join(', ')} onChange={(e) => patchEl({ labels: e.target.value.split(',').map(s => s.trim()) })} />
                </>
              )}

              <hr />
              <label>Прозрачность</label>
              <input type="range" min="0" max="1" step="0.05" value={curEl.opa ?? 1} onChange={(e) => patchEl({ opa: +e.target.value })} />
              <label>
                <input type="checkbox" checked={!!curEl.shadow} onChange={(e) => patchEl({ shadow: e.target.checked })} /> Тень
              </label>

              <hr />
              <div className="grid2">
                <div><label>X</label><input type="number" value={Math.round(curEl.x)} onChange={(e) => patchEl({ x: +e.target.value })} /></div>
                <div><label>Y</label><input type="number" value={Math.round(curEl.y)} onChange={(e) => patchEl({ y: +e.target.value })} /></div>
                <div><label>Ш</label><input type="number" value={Math.round(curEl.w)} onChange={(e) => patchEl({ w: +e.target.value })} /></div>
                <div><label>В</label><input type="number" value={Math.round(curEl.h)} onChange={(e) => patchEl({ h: +e.target.value })} /></div>
                <div><label>Угол</label><input type="number" value={Math.round(curEl.rot)} onChange={(e) => patchEl({ rot: +e.target.value })} /></div>
              </div>

              <hr />
              <label>Выравнивание</label>
              <div className="row btns">
                <button className="tb" onClick={() => alignEl('l')}><I.AlignL /></button>
                <button className="tb" onClick={() => alignEl('c')}><I.AlignC /></button>
                <button className="tb" onClick={() => alignEl('r')}><I.AlignR /></button>
                <button className="tb" onClick={() => alignEl('t')}><I.AlignTop /></button>
                <button className="tb" onClick={() => alignEl('m')}><I.AlignMid /></button>
                <button className="tb" onClick={() => alignEl('b')}><I.AlignBot /></button>
              </div>

              <label>Слои</label>
              <div className="row btns">
                <button className="tb" onClick={() => orderEl('front')}><I.ToTop /></button>
                <button className="tb" onClick={() => orderEl('up')}><I.Up /></button>
                <button className="tb" onClick={() => orderEl('down')}><I.Down /></button>
                <button className="tb" onClick={() => orderEl('back')}><I.ToBottom /></button>
              </div>

              <hr />
              <label>Анимация <span className="dev-tag">beta</span></label>
              <select value={curEl.anim || 'none'} onChange={(e) => patchEl({ anim: e.target.value as any })}>
                <option value="none">нет</option>
                <option value="fade">появление</option>
                <option value="slide">выезд</option>
                <option value="zoom">зум</option>
              </select>
              <label>Задержка (сек)</label>
              <input type="number" step="0.1" value={curEl.delay || 0} onChange={(e) => patchEl({ delay: +e.target.value })} />
            </>
          )}
          
          <div className="insp-hint">
            <b>Горячие клавиши</b>
            <div>Ctrl+Z / Ctrl+Y - отмена/возврат</div>
            <div>Ctrl+S · Ctrl+O · Ctrl+N</div>
            <div>Ctrl+D дубль · Ctrl+C/V</div>
            <div>Delete · Esc · Стрелки</div>
            <div>PageUp / PageDown - слайды</div>
            <div>F5 - показ</div>
          </div>
        </aside>
      </div>

      {present && <Present doc={doc} onClose={() => setPresent(false)} />}
    </div>
  );
}