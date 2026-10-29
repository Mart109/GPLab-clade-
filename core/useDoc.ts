import { useCallback, useState } from 'react';
import type { Doc } from './types';

const emptyDoc = (): Doc => ({
  id: crypto.randomUUID(),
  name: 'Без имени',
  slides: [{ id: crypto.randomUUID(), bg: '#ffffff', els: [] }],
});

export function useDoc() {
  const [doc, setDocRaw] = useState<Doc>(emptyDoc);
  const [past, setPast] = useState<Doc[]>([]);
  const [future, setFuture] = useState<Doc[]>([]);

  const setDoc = useCallback(
    (up: Doc | ((d: Doc) => Doc)) => {
      setDocRaw((cur) => {
        const nxt = typeof up === 'function' ? (up as any)(cur) : up;
        if (nxt === cur) return cur;
        setPast((p) => [...p.slice(-49), cur]);
        setFuture([]);
        return nxt;
      });
    },
    []
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const last = p[p.length - 1];
      setDocRaw((cur) => {
        setFuture((f) => [cur, ...f].slice(0, 50));
        return last;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const nx = f[0];
      setDocRaw((cur) => {
        setPast((p) => [...p, cur]);
        return nx;
      });
      return f.slice(1);
    });
  }, []);

  const reset = useCallback((d: Doc) => {
    setDocRaw(d);
    setPast([]);
    setFuture([]);
  }, []);

  return { doc, setDoc, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 };
}