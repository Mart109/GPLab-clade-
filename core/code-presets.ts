import type { Doc, Sld, TxtEl, RectEl, OvalEl, ChartEl, BgPat } from './types';
import { THEMES, TEMPLATES } from './templates';
import type { Theme } from './templates';

let counter = 0;
const id = () => `c_${Date.now()}_${counter++}`;

export class PresBuilder {
  doc: Doc;
  currentSlide: Sld | null = null;
  theme: Theme;

  constructor(name: string = 'Новая презентация', themeName: string = 'Корпоративный') {
    this.doc = { id: id(), name, slides: [] };
    this.theme = THEMES.find((t) => t.name === themeName) || THEMES[0];
  }

  addSlide(bg?: string, pat: BgPat = 'none', patCol: string = '#000000') {
    const slideBg = bg || this.theme.bg;
    const decor = this.theme.decor();
    
    const slide: Sld = { 
      id: id(), 
      bg: slideBg, 
      pat, 
      patCol, 
      els: [...decor],
      trans: 'fade' 
    };
    this.doc.slides.push(slide);
    this.currentSlide = slide;
    return this;
  }

  useTemplate(templateNameOrIndex: string | number) {
    const t = typeof templateNameOrIndex === 'number' 
      ? TEMPLATES[templateNameOrIndex] 
      : TEMPLATES.find(x => x.name === templateNameOrIndex);
      
    if (t) {
      const s = t.build(this.theme);
      this.doc.slides.push(s);
      this.currentSlide = s;
    }
    return this;
  }

  text(content: string, x: number, y: number, w: number, fs: number = 24, opts: Partial<TxtEl> = {}) {
    if (!this.currentSlide) this.addSlide();
    const el: TxtEl = {
      id: id(), kind: 'txt', x, y, w, h: fs * 1.4, rot: 0, s: content, fs, 
      col: this.theme.text, ...opts
    };
    this.currentSlide!.els.push(el);
    return this;
  }

  rect(x: number, y: number, w: number, h: number, opts: Partial<RectEl> = {}) {
    if (!this.currentSlide) this.addSlide();
    const el: RectEl = { 
      id: id(), kind: 'rect', x, y, w, h, rot: 0, 
      fill: this.theme.card, rad: 12, shadow: true, ...opts 
    };
    this.currentSlide!.els.push(el);
    return this;
  }

  circle(x: number, y: number, size: number, opts: Partial<OvalEl> = {}) {
    if (!this.currentSlide) this.addSlide();
    const el: OvalEl = { 
      id: id(), kind: 'oval', x, y, w: size, h: size, rot: 0, 
      fill: this.theme.accent, ...opts 
    };
    this.currentSlide!.els.push(el);
    return this;
  }

  chart(ctype: 'bar' | 'pie' | 'line', data: number[], labels: string[], x: number, y: number, w: number, h: number) {
    if (!this.currentSlide) this.addSlide();
    const el: ChartEl = {
      id: id(), kind: 'chart', x, y, w, h, rot: 0, ctype, data, labels,
      colors: [this.theme.accent, this.theme.sub, '#059669', '#f59e0b', '#7c3aed']
    };
    this.currentSlide!.els.push(el);
    return this;
  }

  build(): Doc {
    return this.doc;
  }
}

// ==========================================
// ПРИМЕРЫ СЦЕНАРИЕВ
// ==========================================

export function generateDemoPresentation(): Doc {
  const b = new PresBuilder('Презентация кодом', 'Тёмная ночь');

  b.useTemplate('Титульный (Сплит)')
   .text('Мой стартап', 40, 150, 320, 54, { bold: true, col: '#fff' })
   .text('Создано на GPLab', 440, 200, 320, 24, { bold: true });

  b.addSlide()
   .text('Наши результаты', 60, 40, 680, 36, { bold: true })
   .rect(60, 120, 210, 220)
   .text('99%', 60, 150, 210, 48, { bold: true, align: 'center', col: b.theme.accent })
   .text('Довольных клиентов', 60, 230, 210, 16, { align: 'center', col: b.theme.sub })
   .rect(295, 120, 210, 220)
   .text('24/7', 295, 150, 210, 48, { bold: true, align: 'center', col: b.theme.accent })
   .text('Поддержка', 295, 230, 210, 16, { align: 'center', col: b.theme.sub })
   .chart('bar', [10, 30, 20, 50], ['Q1', 'Q2', 'Q3', 'Q4'], 530, 120, 200, 200);

  b.addSlide()
   .text('«', 40, -20, 150, 160, { bold: true, col: b.theme.accent, opa: 0.2 })
   .text('Код — это поэзия будущего.', 80, 140, 640, 40, { italic: true, bold: true })
   .text('— Стив Джобс', 80, 280, 640, 22, { align: 'right', col: b.theme.sub });

  return b.build();
}

export function generateBlankPresentation(): Doc {
  const b = new PresBuilder('Чистый лист', 'Минимализм');
  
  b.addSlide('#ffffff')
   .text('Просто заголовок', 100, 100, 600, 48, { col: '#000', bold: true })
   .text('И немного текста', 100, 160, 600, 24, { col: '#333' });

  return b.build();
}