interface P {
  value: string;
  onChange: (v: string) => void;
  open: boolean;
  onToggle: () => void;
}

export function NotesPanel({ value, onChange, open, onToggle }: P) {
  return (
    <div className={'notes' + (open ? ' open' : '')}>
      <div className="notes-hd" onClick={onToggle}>
        <span>Заметки докладчика</span>
        <span className="notes-arrow">{open ? '▾' : '▸'}</span>
      </div>
      {open && (
        <textarea
          className="notes-area"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Заметки к слайду (видны только тебе)"
        />
      )}
    </div>
  );
}