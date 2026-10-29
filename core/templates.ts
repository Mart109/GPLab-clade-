import type { El, Sld, TxtEl, RectEl, OvalEl, LnEl } from './types';

const uid = () => Math.random().toString(36).slice(2, 10);

export interface Theme {
  name: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
  sub: string;
  isDark: boolean;
  decor: () => El[];
}

// ==========================================
// ГЕНЕРАТОРЫ КРАСИВЫХ ФОНОВ
// ==========================================

// 1. Круглые пятна в углах
const circleDecor = (color: string, opacity: number = 0.1): El[] => [
  {
    id: uid(),
    kind: 'oval',
    x: -150,
    y: -150,
    w: 500,
    h: 500,
    rot: 0,
    fill: color,
    opa: opacity,
    isDecor: true,
  },
  {
    id: uid(),
    kind: 'oval',
    x: 650,
    y: 250,
    w: 400,
    h: 400,
    rot: 0,
    fill: color,
    opa: opacity * 1.5,
    isDecor: true,
  },
];

// 2. Строгая сетка (линии)
const gridDecor = (color: string): El[] => {
  const lines: El[] = [];
  for (let x = 0; x <= 800; x += 40) {
    lines.push({ id: uid(), kind: 'ln', x, y: 0, w: 1, h: 450, rot: 0, pts: [0, 0, 0, 450], col: color, wd: 1, opa: 0.05, isDecor: true });
  }
  for (let y = 0; y <= 450; y += 40) {
    lines.push({ id: uid(), kind: 'ln', x: 0, y, w: 800, h: 1, rot: 0, pts: [0, 0, 800, 0], col: color, wd: 1, opa: 0.05, isDecor: true });
  }
  return lines;
};

// 3. Точечный паттерн (как в Figma)
const dotsDecor = (color: string): El[] => {
  const dots: El[] = [];
  for (let x = 20; x < 800; x += 40) {
    for (let y = 20; y < 450; y += 40) {
      dots.push({ id: uid(), kind: 'oval', x, y, w: 4, h: 4, rot: 0, fill: color, opa: 0.1, isDecor: true });
    }
  }
  return dots;
};

// 4. Плавные волны (наложение больших овалов)
const waveDecor = (color: string, opacity: number = 0.08): El[] => [
  { id: uid(), kind: 'oval', x: -200, y: 300, w: 1200, h: 400, rot: 0, fill: color, opa: opacity, isDecor: true },
  { id: uid(), kind: 'oval', x: -300, y: 350, w: 1400, h: 400, rot: 0, fill: color, opa: opacity * 0.5, isDecor: true },
];

// 5. Диагональный сплит
const diagonalDecor = (color: string, opacity: number = 0.05): El[] => [
  {
    id: uid(),
    kind: 'rect',
    x: -200,
    y: -100,
    w: 1200,
    h: 300,
    rot: 15,
    fill: color,
    opa: opacity,
    isDecor: true,
  },
];

// 6. Горизонтальные линии (полосы)
const linesDecor = (color: string): El[] => {
  const lines: El[] = [];
  for (let y = 20; y < 450; y += 50) {
    lines.push({ id: uid(), kind: 'rect', x: 0, y, w: 800, h: 2, rot: 0, fill: color, opa: 0.04, isDecor: true });
  }
  return lines;
};

// ==========================================
// 20 ТЕМ
// ==========================================
export const THEMES: Theme[] = [
  { 
    name: 'Корпоративный', 
    bg: '#ffffff', card: '#f8fafc', accent: '#2563eb', text: '#0f172a', sub: '#64748b', isDark: false, 
    decor: () => circleDecor('#2563eb', 0.05) 
  },
  { 
    name: 'Тёмная ночь', 
    bg: '#0f172a', card: '#1e293b', accent: '#3b82f6', text: '#f8fafc', sub: '#94a3b8', isDark: true, 
    decor: () => circleDecor('#3b82f6', 0.15) 
  },
  { 
    name: 'Изумрудный', 
    bg: '#ecfdf5', card: '#ffffff', accent: '#059669', text: '#064e3b', sub: '#047857', isDark: false, 
    decor: () => waveDecor('#059669', 0.1) 
  },
  { 
    name: 'Закат', 
    bg: '#fff1f2', card: '#ffffff', accent: '#e11d48', text: '#4c0519', sub: '#9f1239', isDark: false, 
    decor: () => diagonalDecor('#e11d48', 0.06) 
  },
  { 
    name: 'Космос', 
    bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f0f9ff', sub: '#7dd3fc', isDark: true, 
    decor: () => dotsDecor('#38bdf8') 
  },
  { 
    name: 'Графит', 
    bg: '#18181b', card: '#27272a', accent: '#a1a1aa', text: '#fafafa', sub: '#d4d4d8', isDark: true, 
    decor: () => gridDecor('#ffffff') 
  },
  { 
    name: 'Пергамент', 
    bg: '#fef3c7', card: '#fffbeb', accent: '#d97706', text: '#451a03', sub: '#78350f', isDark: false, 
    decor: () => linesDecor('#451a03') 
  },
  { 
    name: 'Океан', 
    bg: '#f0f9ff', card: '#ffffff', accent: '#0284c7', text: '#082f49', sub: '#0369a1', isDark: false, 
    decor: () => waveDecor('#0284c7', 0.08) 
  },
  { 
    name: 'Минимализм', 
    bg: '#ffffff', card: '#ffffff', accent: '#000000', text: '#000000', sub: '#666666', isDark: false, 
    decor: () => [] 
  },
  { 
    name: 'Кофе', 
    bg: '#fdf8f5', card: '#ffffff', accent: '#9a3412', text: '#431407', sub: '#7c2d12', isDark: false, 
    decor: () => circleDecor('#9a3412', 0.06) 
  },
  { 
    name: 'Неон', 
    bg: '#18181b', card: '#27272a', accent: '#22d3ee', text: '#fafafa', sub: '#a1a1aa', isDark: true, 
    decor: () => diagonalDecor('#22d3ee', 0.1) 
  },
  { 
    name: 'Пастель', 
    bg: '#fdf4ff', card: '#ffffff', accent: '#c026d3', text: '#4a044e', sub: '#86198f', isDark: false, 
    decor: () => dotsDecor('#c026d3') 
  },
  { 
    name: 'Киберпанк', 
    bg: '#1a0b2e', card: '#2d1b4e', accent: '#facc15', text: '#fdf4ff', sub: '#d8b4fe', isDark: true, 
    decor: () => gridDecor('#facc15') 
  },
  { 
    name: 'Лес', 
    bg: '#022c22', card: '#064e3b', accent: '#34d399', text: '#ecfdf5', sub: '#6ee7b7', isDark: true, 
    decor: () => waveDecor('#34d399', 0.1) 
  },
  { 
    name: 'Лаванда', 
    bg: '#f5f3ff', card: '#ffffff', accent: '#8b5cf6', text: '#2e1065', sub: '#6d28d9', isDark: false, 
    decor: () => circleDecor('#8b5cf6', 0.08) 
  },
  { 
    name: 'Монокром', 
    bg: '#111827', card: '#1f2937', accent: '#9ca3af', text: '#f3f4f6', sub: '#9ca3af', isDark: true, 
    decor: () => linesDecor('#ffffff') 
  },
  { 
    name: 'Терракота', 
    bg: '#fff7ed', card: '#ffffff', accent: '#ea580c', text: '#431407', sub: '#9a3412', isDark: false, 
    decor: () => diagonalDecor('#ea580c', 0.05) 
  },
  { 
    name: 'Глубоководье', 
    bg: '#083344', card: '#164e63', accent: '#22d3ee', text: '#ecfeff', sub: '#67e8f9', isDark: true, 
    decor: () => waveDecor('#22d3ee', 0.15) 
  },
  { 
    name: 'Ретро', 
    bg: '#fffbeb', card: '#ffffff', accent: '#b45309', text: '#451a03', sub: '#92400e', isDark: false, 
    decor: () => dotsDecor('#b45309') 
  },
  { 
    name: 'Строгий', 
    bg: '#f3f4f6', card: '#ffffff', accent: '#374151', text: '#111827', sub: '#4b5563', isDark: false, 
    decor: () => gridDecor('#111827') 
  }
];

export function getContrastColor(hex: string): string {
  if (!hex || hex.length < 6) return '#000000';
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f172a' : '#ffffff';
}

export interface Template {
  name: string;
  build: (t: Theme) => Sld;
}

// ==========================================
// ХЕЛПЕРЫ ДЛЯ ШАБЛОНОВ
// ==========================================
const txt = (o: any): TxtEl => ({
  id: uid(),
  kind: 'txt',
  x: o.x,
  y: o.y,
  w: o.w,
  h: o.h ?? o.fs * 1.4,
  rot: 0,
  s: o.s,
  fs: o.fs,
  col: o.col,
  bold: o.bold,
  italic: o.italic,
  align: o.align || 'left',
  list: o.list || 'none',
  anim: 'none',
  delay: 0,
});

const rect = (o: any): RectEl => ({
  id: uid(),
  kind: 'rect',
  x: o.x,
  y: o.y,
  w: o.w,
  h: o.h,
  rot: 0,
  fill: o.fill,
  grad2: o.grad2,
  rad: o.rad,
  stroke: o.stroke,
  strokeW: o.strokeW,
  shadow: o.shadow,
  opa: o.opa,
  anim: 'none',
  delay: 0,
});

const circ = (o: any): OvalEl => ({
  id: uid(),
  kind: 'oval',
  x: o.x,
  y: o.y,
  w: o.w,
  h: o.w,
  rot: 0,
  fill: o.fill,
  opa: o.opa,
  anim: 'none',
  delay: 0,
});

// ==========================================
// 24 ШАБЛОНА СЛАЙДОВ
// ==========================================
export const TEMPLATES: Template[] = [
  {
    name: 'Титульный (Классика)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        ...t.decor(),
        txt({ s: 'ЗАГОЛОВОК ПРЕЗЕНТАЦИИ', fs: 48, col: t.text, x: 60, y: 160, w: 680, bold: true, align: 'center' }),
        txt({ s: 'Подзаголовок или имя автора', fs: 22, col: t.sub, x: 60, y: 240, w: 680, align: 'center' }),
        rect({ x: 340, y: 220, w: 120, h: 4, fill: t.accent }),
      ],
    }),
  },
  {
    name: 'Титульный (Сплит)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        rect({ x: 0, y: 0, w: 400, h: 450, fill: t.accent }),
        txt({ s: 'ЗАГОЛОВОК', fs: 54, col: getContrastColor(t.accent), x: 40, y: 150, w: 320, bold: true }),
        txt({ s: 'Подзаголовок', fs: 24, col: t.text, x: 440, y: 180, w: 320, bold: true }),
        txt({ s: 'Описание проекта', fs: 16, col: t.sub, x: 440, y: 220, w: 320 }),
      ],
    }),
  },
  {
    name: 'Титульный (Тёмный)',
    build: (t) => ({
      id: uid(),
      bg: t.text,
      trans: 'fade',
      els: [
        txt({ s: 'ПРЕЗЕНТАЦИЯ', fs: 60, col: t.bg, x: 60, y: 180, w: 680, bold: true, align: 'center' }),
        txt({ s: '2026 ГОД', fs: 20, col: t.sub, x: 60, y: 260, w: 680, align: 'center' }),
      ],
    }),
  },
  {
    name: 'Раздел (С цифрой)',
    build: (t) => ({
      id: uid(),
      bg: t.text,
      trans: 'slide',
      els: [
        txt({ s: '01', fs: 140, col: t.bg, x: 60, y: 80, w: 680, bold: true, align: 'center', opa: 0.1 } as any),
        txt({ s: 'НАЗВАНИЕ РАЗДЕЛА', fs: 40, col: t.bg, x: 60, y: 240, w: 680, bold: true, align: 'center' }),
      ],
    }),
  },
  {
    name: 'Раздел (Минимализм)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'slide',
      els: [
        rect({ x: 60, y: 200, w: 80, h: 6, fill: t.accent }),
        txt({ s: 'НОВАЯ ГЛАВА', fs: 44, col: t.text, x: 60, y: 240, w: 680, bold: true }),
      ],
    }),
  },
  {
    name: 'План встречи',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Повестка дня', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        txt({ s: '1. Введение\n2. Текущие результаты\n3. Проблемы\n4. Следующие шаги\n5. Вопросы', fs: 24, col: t.sub, x: 80, y: 120, w: 640, list: 'none' }),
      ],
    }),
  },
  {
    name: 'Важные пункты',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Ключевые выводы', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        txt({ s: '• Первый важный пункт\n• Второй важный пункт\n• Третий важный пункт', fs: 24, col: t.sub, x: 80, y: 120, w: 640, list: 'bullet' }),
      ],
    }),
  },
  {
    name: 'Два столбца (Плюсы/Минусы)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Плюсы', fs: 32, col: t.text, x: 60, y: 50, w: 320, bold: true }),
        txt({ s: '• Быстро\n• Удобно\n• Надёжно', fs: 20, col: t.sub, x: 60, y: 110, w: 320 }),
        txt({ s: 'Минусы', fs: 32, col: t.text, x: 420, y: 50, w: 320, bold: true }),
        txt({ s: '• Долго\n• Сложно\n• Дорого', fs: 20, col: t.sub, x: 420, y: 110, w: 320 }),
      ],
    }),
  },
  {
    name: 'Три карточки (Метрики)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Ключевые метрики', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        rect({ x: 60, y: 120, w: 210, h: 220, fill: t.card, rad: 12, shadow: true }),
        txt({ s: '120%', fs: 48, col: t.accent, x: 60, y: 150, w: 210, bold: true, align: 'center' }),
        txt({ s: 'Рост', fs: 16, col: t.sub, x: 60, y: 230, w: 210, align: 'center' }),
        rect({ x: 295, y: 120, w: 210, h: 220, fill: t.card, rad: 12, shadow: true }),
        txt({ s: '3.5k', fs: 48, col: t.accent, x: 295, y: 150, w: 210, bold: true, align: 'center' }),
        txt({ s: 'Клиентов', fs: 16, col: t.sub, x: 295, y: 230, w: 210, align: 'center' }),
        rect({ x: 530, y: 120, w: 210, h: 220, fill: t.card, rad: 12, shadow: true }),
        txt({ s: '24/7', fs: 48, col: t.accent, x: 530, y: 150, w: 210, bold: true, align: 'center' }),
        txt({ s: 'Поддержка', fs: 16, col: t.sub, x: 530, y: 230, w: 210, align: 'center' }),
      ],
    }),
  },
  {
    name: 'Bento Сетка',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        ...t.decor(),
        txt({ s: 'Наши достижения', fs: 36, col: t.text, x: 40, y: 30, w: 720, bold: true }),
        rect({ x: 40, y: 100, w: 340, h: 150, fill: t.card, rad: 12, shadow: true }),
        txt({ s: '99.9%', fs: 44, col: t.accent, x: 60, y: 120, w: 300, bold: true }),
        txt({ s: 'Время работы', fs: 16, col: t.sub, x: 60, y: 180, w: 300 }),
        rect({ x: 400, y: 100, w: 360, h: 150, fill: t.accent, rad: 12, shadow: true }),
        txt({ s: '2.5 млн', fs: 44, col: getContrastColor(t.accent), x: 420, y: 120, w: 320, bold: true }),
        txt({ s: 'Клиентов', fs: 16, col: getContrastColor(t.accent), x: 420, y: 180, w: 320 }),
      ],
    }),
  },
  {
    name: 'Таймлайн',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'slide',
      els: [
        txt({ s: 'История', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        rect({ x: 100, y: 180, w: 600, h: 4, fill: t.accent }),
        circ({ x: 120, y: 160, w: 40, fill: t.accent }),
        txt({ s: '2020', fs: 20, col: t.text, x: 100, y: 210, w: 80, align: 'center', bold: true }),
        circ({ x: 380, y: 160, w: 40, fill: t.accent }),
        txt({ s: '2023', fs: 20, col: t.text, x: 360, y: 210, w: 80, align: 'center', bold: true }),
        circ({ x: 640, y: 160, w: 40, fill: t.accent }),
        txt({ s: '2026', fs: 20, col: t.text, x: 620, y: 210, w: 80, align: 'center', bold: true }),
      ],
    }),
  },
  {
    name: 'Цитата (Крупная)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'zoom',
      els: [
        ...t.decor(),
        txt({ s: '«', fs: 160, col: t.accent, x: 40, y: -20, w: 150, bold: true, opa: 0.2 } as any),
        txt({ s: 'Лучший способ предсказать будущее — создать его.', fs: 40, col: t.text, x: 80, y: 140, w: 640, italic: true, bold: true }),
        txt({ s: '— Питер Друкер', fs: 22, col: t.sub, x: 80, y: 280, w: 640, align: 'right' }),
      ],
    }),
  },
  {
    name: 'Цитата (Минимализм)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'zoom',
      els: [
        rect({ x: 60, y: 100, w: 4, h: 200, fill: t.accent }),
        txt({ s: 'Простота — это высшая степень изощренности.', fs: 32, col: t.text, x: 100, y: 140, w: 600, italic: true }),
        txt({ s: '— Леонардо да Винчи', fs: 18, col: t.sub, x: 100, y: 240, w: 600 }),
      ],
    }),
  },
  {
    name: 'График (Столбцы)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Аналитика', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        { id: uid(), kind: 'chart', x: 100, y: 120, w: 600, h: 280, rot: 0, ctype: 'bar', data: [45, 78, 32, 91, 60], labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май'], colors: [t.accent, '#e11d48', '#059669', '#f59e0b', '#7c3aed'], anim: 'none', delay: 0 },
      ],
    }),
  },
  {
    name: 'График (Круговая)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Распределение', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        { id: uid(), kind: 'chart', x: 200, y: 100, w: 400, h: 300, rot: 0, ctype: 'pie', data: [40, 30, 20, 10], labels: ['A', 'B', 'C', 'D'], colors: [t.accent, t.sub, '#059669', '#f59e0b'], anim: 'none', delay: 0 },
      ],
    }),
  },
  {
    name: 'Картинка справа',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Заголовок', fs: 40, col: t.text, x: 60, y: 80, w: 350, bold: true }),
        txt({ s: 'Описание', fs: 18, col: t.sub, x: 60, y: 150, w: 350 }),
        rect({ x: 440, y: 60, w: 300, h: 330, fill: t.sub, rad: 16, shadow: true, opa: 0.2 }),
        txt({ s: 'Фото', fs: 20, col: t.text, x: 440, y: 210, w: 300, align: 'center' }),
      ],
    }),
  },
  {
    name: 'Картинка слева',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        rect({ x: 60, y: 60, w: 300, h: 330, fill: t.sub, rad: 16, shadow: true, opa: 0.2 }),
        txt({ s: 'Фото', fs: 20, col: t.text, x: 60, y: 210, w: 300, align: 'center' }),
        txt({ s: 'Заголовок', fs: 40, col: t.text, x: 400, y: 80, w: 350, bold: true }),
        txt({ s: 'Описание', fs: 18, col: t.sub, x: 400, y: 150, w: 350 }),
      ],
    }),
  },
  {
    name: 'Команда (3 человека)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Наша команда', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true, align: 'center' }),
        circ({ x: 110, y: 130, w: 140, fill: t.accent, opa: 0.15 }),
        circ({ x: 125, y: 145, w: 110, fill: t.accent }),
        txt({ s: 'Иван', fs: 22, col: t.text, x: 100, y: 300, w: 160, align: 'center', bold: true }),
        txt({ s: 'CEO', fs: 14, col: t.sub, x: 100, y: 330, w: 160, align: 'center' }),
        circ({ x: 330, y: 130, w: 140, fill: t.accent, opa: 0.15 }),
        circ({ x: 345, y: 145, w: 110, fill: t.accent }),
        txt({ s: 'Мария', fs: 22, col: t.text, x: 320, y: 300, w: 160, align: 'center', bold: true }),
        txt({ s: 'Дизайнер', fs: 14, col: t.sub, x: 320, y: 330, w: 160, align: 'center' }),
        circ({ x: 550, y: 130, w: 140, fill: t.accent, opa: 0.15 }),
        circ({ x: 565, y: 145, w: 110, fill: t.accent }),
        txt({ s: 'Алексей', fs: 22, col: t.text, x: 540, y: 300, w: 160, align: 'center', bold: true }),
        txt({ s: 'Разработчик', fs: 14, col: t.sub, x: 540, y: 330, w: 160, align: 'center' }),
      ],
    }),
  },
  {
    name: 'Сравнение (Сплит)',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'slide',
      els: [
        rect({ x: 0, y: 0, w: 400, h: 450, fill: t.accent }),
        txt({ s: 'ДО', fs: 40, col: getContrastColor(t.accent), x: 50, y: 50, w: 300, bold: true }),
        txt({ s: 'Старый подход', fs: 20, col: getContrastColor(t.accent), x: 50, y: 110, w: 300 }),
        txt({ s: 'ПОСЛЕ', fs: 40, col: t.text, x: 450, y: 50, w: 300, bold: true }),
        txt({ s: 'Новый подход', fs: 20, col: t.sub, x: 450, y: 110, w: 300 }),
      ],
    }),
  },
  {
    name: 'Статистика',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Статистика', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        txt({ s: '90%', fs: 72, col: t.accent, x: 60, y: 130, w: 300, bold: true }),
        txt({ s: 'Довольных клиентов', fs: 20, col: t.sub, x: 60, y: 220, w: 300 }),
        txt({ s: '15x', fs: 72, col: t.accent, x: 440, y: 130, w: 300, bold: true }),
        txt({ s: 'Рост прибыли', fs: 20, col: t.sub, x: 440, y: 220, w: 300 }),
      ],
    }),
  },
  {
    name: 'Контакты',
    build: (t) => ({
      id: uid(),
      bg: t.accent,
      trans: 'zoom',
      els: [
        txt({ s: 'Спасибо!', fs: 48, col: getContrastColor(t.accent), x: 60, y: 150, w: 680, bold: true, align: 'center' }),
        txt({ s: 'Свяжитесь с нами: hello@gplab.ru', fs: 22, col: getContrastColor(t.accent), x: 60, y: 250, w: 680, align: 'center' }),
      ],
    }),
  },
  {
    name: 'Проблема и решение',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'fade',
      els: [
        txt({ s: 'Проблема', fs: 32, col: t.text, x: 60, y: 50, w: 680, bold: true }),
        txt({ s: 'Клиенты уходят, потому что им неудобно.', fs: 20, col: t.sub, x: 60, y: 100, w: 680 }),
        rect({ x: 60, y: 180, w: 680, h: 2, fill: t.accent }),
        txt({ s: 'Решение', fs: 32, col: t.text, x: 60, y: 220, w: 680, bold: true }),
        txt({ s: 'Мы сделали интерфейс интуитивно понятным.', fs: 20, col: t.sub, x: 60, y: 270, w: 680 }),
      ],
    }),
  },
  {
    name: 'Цели на год',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'slide',
      els: [
        txt({ s: 'Наши цели', fs: 36, col: t.text, x: 60, y: 40, w: 680, bold: true }),
        txt({ s: '01', fs: 28, col: t.accent, x: 60, y: 120, w: 60, bold: true }),
        txt({ s: 'Увеличить выручку в 2 раза', fs: 24, col: t.text, x: 120, y: 120, w: 600 }),
        txt({ s: '02', fs: 28, col: t.accent, x: 60, y: 200, w: 60, bold: true }),
        txt({ s: 'Выйти на международный рынок', fs: 24, col: t.text, x: 120, y: 200, w: 600 }),
        txt({ s: '03', fs: 28, col: t.accent, x: 60, y: 280, w: 60, bold: true }),
        txt({ s: 'Нанять 10 новых сотрудников', fs: 24, col: t.text, x: 120, y: 280, w: 600 }),
      ],
    }),
  },
  {
    name: 'Пустой',
    build: (t) => ({
      id: uid(),
      bg: t.bg,
      trans: 'none',
      els: [],
    }),
  },
];

// ==========================================
// УМНАЯ СМЕНА ТЕМЫ
// ==========================================
export const applyThemeToSlide = (slide: Sld, oldT: Theme, newT: Theme): Sld => {
  // 1. Удаляем старый декор
  const cleanEls = slide.els.filter((e) => !e.isDecor);
  
  // 2. Добавляем новый декор
  const newDecor = newT.decor();

  // 3. Перекрашиваем оставшиеся элементы
  const newEls = cleanEls.map((el) => {
    // Фоны
    if (el.kind === 'rect' && el.w >= 790 && el.h >= 440) {
      return { ...el, fill: newT.bg };
    }
    // Карточки
    if (el.kind === 'rect' && (el.rad || el.shadow || el.fill === oldT.card)) {
      return { ...el, fill: newT.card };
    }
    // Акценты
    if (el.kind === 'rect' || el.kind === 'oval') {
      if (el.fill === oldT.accent) return { ...el, fill: newT.accent };
      if (el.fill === oldT.text) return { ...el, fill: newT.text };
    }
    // Текст
    if (el.kind === 'txt') {
      if (el.col === oldT.text) return { ...el, col: newT.text };
      if (el.col === oldT.sub) return { ...el, col: newT.sub };
      if (el.col === getContrastColor(oldT.accent)) {
        return { ...el, col: getContrastColor(newT.accent) };
      }
    }
    return el;
  });

  return { ...slide, bg: newT.bg, els: [...newDecor, ...newEls] };
};