import type { ChartEl } from './types';

export function chartToDataURL(el: ChartEl): string {
  const w = el.w, h = el.h;
  const c = document.createElement('canvas');
  c.width = w * 2; c.height = h * 2;
  const ctx = c.getContext('2d')!;
  ctx.scale(2, 2);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const pad = 28;
  const cw = w - pad * 2;
  const ch = h - pad * 2;
  const data = el.data.length ? el.data : [1];
  const labels = el.labels.length === data.length ? el.labels : data.map((_, i) => String(i + 1));
  const colors = el.colors.length ? el.colors : ['#2563eb', '#e11d48', '#059669', '#f59e0b', '#7c3aed'];

  ctx.font = '12px system-ui, sans-serif';

  if (el.ctype === 'bar') {
    const max = Math.max(...data, 1);
    const n = data.length;
    const slot = cw / n;
    const bw = slot * 0.65;
    const gap = slot * 0.35;
    // оси
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + ch); ctx.lineTo(pad + cw, pad + ch); ctx.stroke();
    data.forEach((v, i) => {
      const bh = (v / max) * ch;
      const x = pad + i * slot + gap / 2;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, pad + ch - bh, bw, bh);
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + bw / 2, pad + ch + 16);
    });
  } else if (el.ctype === 'pie') {
    const total = data.reduce((a, b) => a + b, 0) || 1;
    const cx = w / 2, cy = h / 2;
    const r = Math.min(cw, ch) / 2;
    let start = -Math.PI / 2;
    data.forEach((v, i) => {
      const angle = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      start += angle;
    });
  } else {
    const max = Math.max(...data, 1);
    const n = data.length;
    const step = n > 1 ? cw / (n - 1) : cw;
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + ch); ctx.lineTo(pad + cw, pad + ch); ctx.stroke();
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad + i * step;
      const y = pad + ch - (v / max) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = colors[0]; ctx.lineWidth = 3; ctx.stroke();
    data.forEach((v, i) => {
      const x = pad + i * step;
      const y = pad + ch - (v / max) * ch;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors[0]; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#334155'; ctx.textAlign = 'center';
      ctx.fillText(labels[i], x, pad + ch + 16);
    });
  }

  return c.toDataURL();
}