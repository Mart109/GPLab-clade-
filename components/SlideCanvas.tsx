import { Stage, Layer, Text, Rect, Ellipse, Image as KImage, Line, Circle, Transformer } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import type { Sld, El } from '../core/types';
import { chartToDataURL } from '../core/chart';

const W = 800, H = 450;

function useImg(src: string) {
  const [im, setIm] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setIm(null); return; }
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => setIm(i);
    i.src = src;
  }, [src]);
  return im;
}

function ImgNode({ el, ...rest }: any) {
  const im = useImg(el.src);
  if (!im) return null;
  return <KImage {...rest} image={im} x={el.x} y={el.y} width={el.w} height={el.h} rotation={el.rot} opacity={el.opa ?? 1} shadowEnabled={!!el.shadow} shadowBlur={18} shadowColor="rgba(0,0,0,.35)" shadowOffsetY={6} />;
}

function ChartNode({ el, ...rest }: any) {
  const key = el.ctype + '|' + JSON.stringify(el.data) + '|' + JSON.stringify(el.labels) + '|' + JSON.stringify(el.colors) + '|' + el.w + '|' + el.h;
  const [src, setSrc] = useState('');
  useEffect(() => { setSrc(chartToDataURL(el)); }, [key]);
  const im = useImg(src);
  if (!im) return null;
  return <KImage {...rest} image={im} x={el.x} y={el.y} width={el.w} height={el.h} rotation={el.rot} opacity={el.opa ?? 1} />;
}

function displayText(el: any): string {
  if (!el.list || el.list === 'none') return el.s;
  return el.s.split('\n').map((ln: string, i: number) =>
    el.list === 'bullet' ? `• ${ln}` : `${i + 1}. ${ln}`
  ).join('\n');
}

function fillProps(el: any) {
  if (el.grad2) {
    return {
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: el.w || 200, y: el.h || 100 },
      fillLinearGradientColorStops: [0, el.fill, 1, el.grad2],
    };
  }
  return { fill: el.fill };
}

function strokeProps(el: any) {
  if (!el.stroke || !el.strokeW) return {};
  return { stroke: el.stroke, strokeWidth: el.strokeW };
}

function ElNode({ el, readOnly, setRef, onDragMove, onDragEnd, onTransformEnd, onSelect, onDbl }: any) {
  const common: any = {
    draggable: !readOnly,
    onDragMove, onDragEnd, onTransformEnd,
    onMouseDown: (e: any) => { e.cancelBubble = true; onSelect(); },
    onTouchStart: (e: any) => { e.cancelBubble = true; onSelect(); },
    onDblClick: onDbl,
    ref: setRef,
    opacity: el.opa ?? 1,
    shadowEnabled: !!el.shadow,
    shadowBlur: 18,
    shadowColor: 'rgba(0,0,0,.35)',
    shadowOffsetY: 6,
  };

  if (el.kind === 'txt') {
    return (
      <Text {...common} text={displayText(el)} x={el.x} y={el.y} width={el.w}
        rotation={el.rot} fontSize={el.fs} fill={el.col}
        stroke={el.stroke || undefined}
        strokeWidth={el.strokeW || 0}
        fillAfterStrokeEnabled
        fontStyle={[el.bold && 'bold', el.italic && 'italic'].filter(Boolean).join(' ') || 'normal'}
        align={el.align || 'left'} />
    );
  }
  if (el.kind === 'rect') {
    return <Rect {...common} x={el.x} y={el.y} width={el.w} height={el.h}
      {...fillProps(el)} {...strokeProps(el)}
      cornerRadius={el.rad || 0} rotation={el.rot} />;
  }
  if (el.kind === 'oval') {
    return <Ellipse {...common} x={el.x + el.w / 2} y={el.y + el.h / 2}
      radiusX={el.w / 2} radiusY={el.h / 2}
      {...fillProps(el)} {...strokeProps(el)}
      rotation={el.rot} />;
  }
  if (el.kind === 'img') return <ImgNode {...common} el={el} />;
  if (el.kind === 'chart') return <ChartNode {...common} el={el} />;
  if (el.kind === 'ln') return <Line {...common} x={el.x} y={el.y} points={el.pts}
    stroke={el.col} strokeWidth={el.wd} rotation={el.rot} />;
  return null;
}

function applyAnim(node: any, kind: string, delay: number) {
  const ox = node.x(); const op = node.opacity();
  if (kind === 'fade') { node.opacity(0); node.to({ opacity: op, duration: 0.5, delay }); }
  else if (kind === 'slide') { node.x(ox + 120); node.opacity(0.2); node.to({ x: ox, opacity: op, duration: 0.5, delay }); }
  else if (kind === 'zoom') { node.scaleX(0.4); node.scaleY(0.4); node.opacity(0); node.to({ scaleX: 1, scaleY: 1, opacity: op, duration: 0.45, delay }); }
}

function BgPattern({ pat, color }: { pat: string; color: string }) {
  if (!pat || pat === 'none') return null;
  const c = color || 'rgba(0,0,0,.08)';
  const items: any[] = [];
  if (pat === 'dots') {
    for (let x = 20; x < W; x += 40)
      for (let y = 20; y < H; y += 40)
        items.push(<Circle key={x + '_' + y} x={x} y={y} radius={2} fill={c} listening={false} />);
  } else if (pat === 'lines') {
    for (let y = 20; y < H; y += 30)
      items.push(<Line key={y} points={[0, y, W, y]} stroke={c} strokeWidth={1} listening={false} />);
  } else if (pat === 'grid') {
    for (let x = 0; x < W; x += 40)
      items.push(<Line key={'v' + x} points={[x, 0, x, H]} stroke={c} strokeWidth={1} listening={false} />);
    for (let y = 0; y < H; y += 40)
      items.push(<Line key={'h' + y} points={[0, y, W, y]} stroke={c} strokeWidth={1} listening={false} />);
  }
  return <>{items}</>;
}

function Guides({ lines }: { lines: any[] }) {
  return <>{lines.map((l, i) => <Line key={i} points={l.points} stroke="#ff3b81" strokeWidth={1} dash={[6, 4]} listening={false} />)}</>;
}

interface Props {
  slide: Sld;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onChange: (els: El[]) => void;
  scale?: number;
  readOnly?: boolean;
  stageRef?: (st: any) => void;
  snap?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  onEditText?: (el: any, screenRect: any) => void;
}

export function SlideCanvas({
  slide, selectedIds, onSelect, onChange, scale = 1, readOnly, stageRef,
  snap = true, showGrid = false, animate = false, onEditText,
}: Props) {
  const trRef = useRef<any>(null);
  const stage = useRef<any>(null);
  const nodes = useRef<Record<string, any>>({});
  const cb = useRef(stageRef); cb.current = stageRef;
  const [selBox, setSelBox] = useState<any>(null);
  const [guides, setGuides] = useState<any[]>([]);
  const dragStart = useRef<any>(null);

  useEffect(() => { cb.current?.(stage.current); });

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    if (!readOnly && selectedIds.length) {
      const ns = selectedIds.map((id) => nodes.current[id]).filter(Boolean);
      tr.nodes(ns);
    } else tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedIds, slide, readOnly]);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => {
      slide.els.forEach((el) => {
        const node = nodes.current[el.id];
        if (!node) return;
        if (el.anim && el.anim !== 'none') applyAnim(node, el.anim, el.delay || 0);
      });
    }, 60);
    return () => clearTimeout(t);
  }, [slide.id, animate]);

  const commit = (id: string, patch: Partial<El>) => {
    onChange(slide.els.map((e) => (e.id === id ? ({ ...e, ...patch } as El) : e)));
  };

  const snapVal = (v: number) => (snap ? Math.round(v / 10) * 10 : v);

  const getBounds = (el: El) => ({ l: el.x, t: el.y, r: el.x + el.w, b: el.y + el.h, cx: el.x + el.w / 2, cy: el.y + el.h / 2 });

  const computeGuides = (moving: El, exclude: string[]) => {
    const g: any[] = [];
    const m = getBounds(moving);
    slide.els.forEach((o) => {
      if (exclude.includes(o.id)) return;
      const b = getBounds(o);
      if (Math.abs(m.l - b.l) < 6) g.push({ points: [b.l, 0, b.l, H] });
      if (Math.abs(m.r - b.r) < 6) g.push({ points: [b.r, 0, b.r, H] });
      if (Math.abs(m.cx - b.cx) < 6) g.push({ points: [b.cx, 0, b.cx, H] });
      if (Math.abs(m.t - b.t) < 6) g.push({ points: [0, b.t, W, b.t] });
      if (Math.abs(m.b - b.b) < 6) g.push({ points: [0, b.b, W, b.b] });
      if (Math.abs(m.cy - b.cy) < 6) g.push({ points: [0, b.cy, W, b.cy] });
    });
    if (Math.abs(m.cx - W / 2) < 6) g.push({ points: [W / 2, 0, W / 2, H] });
    if (Math.abs(m.cy - H / 2) < 6) g.push({ points: [0, H / 2, W, H / 2] });
    return g;
  };

  const handleDragEnd = (el: El, e: any) => {
    setGuides([]);
    const node = e.target;
    const nx = snapVal(node.x());
    const ny = snapVal(node.y());
    if (el.kind === 'oval') commit(el.id, { x: nx - el.w / 2, y: ny - el.h / 2 });
    else commit(el.id, { x: nx, y: ny });
  };

  const handleDragMove = (el: El, e: any) => {
    const node = e.target;
    const fake: El = { ...el, x: node.x(), y: node.y() } as any;
    if (el.kind === 'oval') { fake.x = node.x() - el.w / 2; fake.y = node.y() - el.h / 2; }
    setGuides(computeGuides(fake, selectedIds));
  };

  const handleTransformEnd = (el: El, e: any) => {
    const n = e.target;
    const sx = n.scaleX(), sy = n.scaleY();
    n.scaleX(1); n.scaleY(1);
    const newW = Math.max(4, el.w * sx);
    const newH = Math.max(4, el.h * sy);
    if (el.kind === 'oval') {
      commit(el.id, { x: n.x() - newW / 2, y: n.y() - newH / 2, w: newW, h: newH, rot: n.rotation() } as any);
    } else {
      commit(el.id, { x: n.x(), y: n.y(), w: newW, h: newH, rot: n.rotation() } as any);
    }
  };

  const onStageMouseDown = (e: any) => {
    if (readOnly) return;
    const onEmpty = e.target === e.target.getStage() || e.target.attrs['data-bg'];
    if (!onEmpty) return;
    onSelect([]);
    const pos = stage.current.getPointerPosition();
    dragStart.current = { x: pos.x / scale, y: pos.y / scale };
    setSelBox({ x: pos.x / scale, y: pos.y / scale, w: 0, h: 0 });
  };

  const onStageMouseMove = () => {
    if (!dragStart.current) return;
    const pos = stage.current.getPointerPosition();
    const x = pos.x / scale, y = pos.y / scale;
    const s = dragStart.current;
    setSelBox({ x: Math.min(s.x, x), y: Math.min(s.y, y), w: Math.abs(x - s.x), h: Math.abs(y - s.y) });
  };

  const onStageMouseUp = () => {
    if (!dragStart.current || !selBox) { dragStart.current = null; setSelBox(null); return; }
    const box = selBox;
    const hits: string[] = [];
    slide.els.forEach((el) => {
      const b = getBounds(el);
      if (b.r > box.x && b.l < box.x + box.w && b.b > box.y && b.t < box.y + box.h) hits.push(el.id);
    });
    if (hits.length) onSelect(hits);
    dragStart.current = null;
    setSelBox(null);
  };

  return (
    <Stage
      ref={stage}
      width={W * scale} height={H * scale}
      scaleX={scale} scaleY={scale}
      onMouseDown={onStageMouseDown}
      onMouseMove={onStageMouseMove}
      onMouseUp={onStageMouseUp}
      onTouchStart={onStageMouseDown}
      onTouchMove={onStageMouseMove}
      onTouchEnd={onStageMouseUp}
      style={{ background: slide.bg, boxShadow: '0 10px 40px rgba(0,0,0,.5)' }}
    >
      <Layer>
        <Rect x={0} y={0} width={W} height={H} fill={slide.bg} data-bg="1" />
        <BgPattern pat={slide.pat || 'none'} color={slide.patCol || ''} />
        {showGrid && (
          <>
            {Array.from({ length: 16 }).map((_, i) => (
              <Line key={'v' + i} points={[i * 50, 0, i * 50, H]} stroke="rgba(124,92,255,.12)" strokeWidth={1} listening={false} />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <Line key={'h' + i} points={[0, i * 50, W, i * 50]} stroke="rgba(124,92,255,.12)" strokeWidth={1} listening={false} />
            ))}
          </>
        )}
        {slide.els.map((el) => (
          <ElNode
            key={el.id}
            el={el}
            readOnly={!!readOnly}
            setRef={(n: any) => { if (n) nodes.current[el.id] = n; }}
            onDragMove={(e: any) => handleDragMove(el, e)}
            onDragEnd={(e: any) => handleDragEnd(el, e)}
            onTransformEnd={(e: any) => handleTransformEnd(el, e)}
            onSelect={() => {
              if (readOnly) return;
              if (selectedIds.includes(el.id) && selectedIds.length > 1) return;
              onSelect([el.id]);
            }}
            onDbl={() => {
              if (readOnly) return;
              if (el.kind === 'txt' && onEditText && stage.current) {
                const box = stage.current.container().getBoundingClientRect();
                onEditText(el, {
                  left: box.left + el.x * scale,
                  top: box.top + el.y * scale,
                  width: el.w * scale,
                  height: Math.max(30, el.h * scale),
                  fontSize: el.fs * scale,
                  color: el.col,
                  align: el.align || 'left',
                  bold: !!el.bold, italic: !!el.italic,
                });
              }
            }}
          />
        ))}
        {!readOnly && (
          <Transformer ref={trRef} rotateEnabled
            borderStroke="#7c5cff" anchorStroke="#7c5cff" anchorFill="#ffffff"
            anchorSize={9} anchorCornerRadius={0}
            boundBoxFunc={(o, n) => (n.width < 6 || n.height < 6 ? o : n)} />
        )}
        <Guides lines={guides} />
        {selBox && <Rect x={selBox.x} y={selBox.y} width={selBox.w} height={selBox.h} stroke="#7c5cff" strokeWidth={1} dash={[6, 4]} fill="rgba(124,92,255,.08)" listening={false} />}
      </Layer>
    </Stage>
  );
}