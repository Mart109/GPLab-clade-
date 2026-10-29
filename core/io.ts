import type { Doc, Sld } from './types';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import Konva from 'konva';
import { chartToDataURL } from './chart';

const W = 800, H = 450;

function download(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function saveJson(doc: Doc, name?: string) {
  const n = (name || doc.name || 'presentation').replace(/[\\/:*?"<>|]/g, '_');
  download(new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }), `${n}.gplab.json`);
}

export function loadJson(file: File): Promise<Doc> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { try { res(JSON.parse(r.result as string)); } catch (e) { rej(e); } };
    r.onerror = () => rej(r.error);
    r.readAsText(file);
  });
}

export function pickJson(): Promise<Doc | null> {
  return new Promise((res) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,.gplab,application/json';
    inp.onchange = async () => {
      const f = inp.files?.[0]; if (!f) return res(null);
      try { res(await loadJson(f)); } catch { res(null); }
    };
    inp.click();
  });
}

export function pickName(current: string): string | null {
  const v = window.prompt('Имя файла:', current || 'Презентация');
  if (v == null) return null;
  return v.trim() || 'Презентация';
}

export function exportPng(stage: any, name = 'slide') {
  if (!stage) return;
  const url = stage.toDataURL({ pixelRatio: 2 });
  const a = document.createElement('a');
  a.href = url; a.download = `${name}.png`; a.click();
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
}

function displayText(el: any): string {
  if (!el.list || el.list === 'none') return el.s;
  return el.s.split('\n').map((ln: string, i: number) =>
    el.list === 'bullet' ? `• ${ln}` : `${i + 1}. ${ln}`
  ).join('\n');
}

async function renderSlide(slide: Sld, pixelRatio = 2): Promise<string> {
  const box = document.createElement('div');
  box.style.position = 'fixed'; box.style.left = '-10000px'; box.style.top = '0';
  document.body.appendChild(box);
  const stage = new Konva.Stage({ container: box, width: W, height: H });
  const layer = new Konva.Layer(); stage.add(layer);

  layer.add(new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: slide.bg }));

  // Паттерн
  const pat = slide.pat || 'none';
  const pc = slide.patCol || 'rgba(0,0,0,.08)';
  if (pat === 'dots') {
    for (let x = 20; x < W; x += 40)
      for (let y = 20; y < H; y += 40)
        layer.add(new Konva.Circle({ x, y, radius: 2, fill: pc }));
  } else if (pat === 'lines') {
    for (let y = 20; y < H; y += 30)
      layer.add(new Konva.Line({ points: [0, y, W, y], stroke: pc, strokeWidth: 1 }));
  } else if (pat === 'grid') {
    for (let x = 0; x < W; x += 40)
      layer.add(new Konva.Line({ points: [x, 0, x, H], stroke: pc, strokeWidth: 1 }));
    for (let y = 0; y < H; y += 40)
      layer.add(new Konva.Line({ points: [0, y, W, y], stroke: pc, strokeWidth: 1 }));
  }

  for (const el of slide.els) {
    let node: any = null;
    const shadow = el.shadow ? { shadowColor: 'rgba(0,0,0,.35)', shadowBlur: 18, shadowOffsetY: 6 } : {};
    const opa = el.opa ?? 1;

    if (el.kind === 'txt') {
      node = new Konva.Text({
        text: displayText(el), x: el.x, y: el.y, width: el.w,
        fontSize: el.fs, fill: el.col,
        stroke: el.stroke || undefined, strokeWidth: el.strokeW || 0,
        fillAfterStrokeEnabled: true,
        fontStyle: [el.bold && 'bold', el.italic && 'italic'].filter(Boolean).join(' ') || 'normal',
        align: el.align || 'left', rotation: el.rot, opacity: opa, ...shadow,
      });
    } else if (el.kind === 'rect') {
      const props: any = { x: el.x, y: el.y, width: el.w, height: el.h, cornerRadius: el.rad || 0, rotation: el.rot, opacity: opa, ...shadow };
      if (el.grad2) {
        props.fillLinearGradientStartPoint = { x: 0, y: 0 };
        props.fillLinearGradientEndPoint = { x: el.w, y: el.h };
        props.fillLinearGradientColorStops = [0, el.fill, 1, el.grad2];
      } else props.fill = el.fill;
      if (el.stroke) { props.stroke = el.stroke; props.strokeWidth = el.strokeW || 1; }
      node = new Konva.Rect(props);
    } else if (el.kind === 'oval') {
      const props: any = { x: el.x + el.w / 2, y: el.y + el.h / 2, radiusX: el.w / 2, radiusY: el.h / 2, rotation: el.rot, opacity: opa, ...shadow };
      if (el.grad2) {
        props.fillLinearGradientStartPoint = { x: -el.w / 2, y: -el.h / 2 };
        props.fillLinearGradientEndPoint = { x: el.w / 2, y: el.h / 2 };
        props.fillLinearGradientColorStops = [0, el.fill, 1, el.grad2];
      } else props.fill = el.fill;
      if (el.stroke) { props.stroke = el.stroke; props.strokeWidth = el.strokeW || 1; }
      node = new Konva.Ellipse(props);
    } else if (el.kind === 'ln') {
      node = new Konva.Line({ x: el.x, y: el.y, points: el.pts, stroke: el.col, strokeWidth: el.wd, rotation: el.rot, opacity: opa });
    } else if (el.kind === 'img' && el.src) {
      try { const im = await loadImg(el.src); node = new Konva.Image({ image: im, x: el.x, y: el.y, width: el.w, height: el.h, rotation: el.rot, opacity: opa, ...shadow }); } catch {}
    } else if (el.kind === 'chart') {
      try { const im = await loadImg(chartToDataURL(el)); node = new Konva.Image({ image: im, x: el.x, y: el.y, width: el.w, height: el.h, rotation: el.rot, opacity: opa, ...shadow }); } catch {}
    }
    if (node) layer.add(node);
  }
  const url = stage.toDataURL({ pixelRatio });
  stage.destroy(); document.body.removeChild(box);
  return url;
}

export async function exportPdf(doc: Doc, name = 'presentation') {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [W, H] });
  for (let i = 0; i < doc.slides.length; i++) {
    if (i) pdf.addPage([W, H], 'landscape');
    const url = await renderSlide(doc.slides[i]);
    pdf.addImage(url, 'PNG', 0, 0, W, H);
  }
  pdf.save(`${name}.pdf`);
}

export async function exportPptx(doc: Doc, name = 'presentation') {
  const pptx: any = new PptxGenJS();
  pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
  pptx.layout = 'CUSTOM';
  const kx = 10 / W, ky = 5.625 / H;

  for (const s of doc.slides) {
    const sl: any = pptx.addSlide();
    sl.background = { color: s.bg.replace('#', '') };
    for (const el of s.els) {
      const x = el.x * kx, y = el.y * ky, w = el.w * kx, h = el.h * ky;
      const opa = el.opa ?? 1;
      const transparency = Math.round((1 - opa) * 100);

      if (el.kind === 'txt') {
        sl.addText(displayText(el), {
          x, y, w, h, fontSize: el.fs * 0.75,
          color: el.col.replace('#', ''),
          bold: !!el.bold, italic: !!el.italic, align: el.align || 'left',
        });
      } else if (el.kind === 'rect') {
        const shapeOpts: any = { x, y, w, h, fill: { color: el.fill.replace('#', '') }, transparency };
        if (el.grad2) {
          shapeOpts.fill = { color: el.fill.replace('#', ''), transparency };
        }
        if (el.stroke) shapeOpts.line = { color: el.stroke.replace('#', ''), width: (el.strokeW || 1) * 0.5 };
        sl.addShape('rect', shapeOpts);
      } else if (el.kind === 'oval') {
        const shapeOpts: any = { x, y, w, h, fill: { color: el.fill.replace('#', '') }, transparency };
        if (el.stroke) shapeOpts.line = { color: el.stroke.replace('#', ''), width: (el.strokeW || 1) * 0.5 };
        sl.addShape('ellipse', shapeOpts);
      } else if (el.kind === 'ln') {
        sl.addShape('rect', { x, y: y + h / 2, w, h: Math.max(1, el.wd * 0.5), fill: { color: el.col.replace('#', '') } });
      } else if (el.kind === 'img' && el.src) {
        sl.addImage({ data: el.src, x, y, w, h, transparency });
      } else if (el.kind === 'chart') {
        try {
          const CT = (pptx.ChartType) || {};
          const t = el.ctype === 'pie' ? CT.pie : el.ctype === 'line' ? CT.line : CT.bar;
          sl.addChart(t, [{ name: 'Данные', labels: el.labels, values: el.data }], {
            x, y, w, h, showLegend: false,
            chartColors: el.colors.map((c) => c.replace('#', '')),
          });
        } catch {
          sl.addImage({ data: chartToDataURL(el), x, y, w, h });
        }
      }
    }
    if (s.note) sl.addNotes(s.note);
  }
  await pptx.writeFile({ fileName: `${name}.pptx` });
}

export async function exportPngAll(doc: Doc, name = 'presentation') {
  for (let i = 0; i < doc.slides.length; i++) {
    const url = await renderSlide(doc.slides[i], 2);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-${String(i + 1).padStart(2, '0')}.png`;
    a.click();
    await new Promise((r) => setTimeout(r, 200));
  }
}