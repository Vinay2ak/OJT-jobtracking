type Props = {
  label: string;
  onClick?: () => void;
  progress?: number; // 0-100
  title?: string;
};

export function FeatureButton({ label, onClick, progress = 0, title }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progress || 0)));

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 relative text-sm font-medium"
      style={{
        minWidth: 72,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <span>{label}</span>

      {/* small progress bar at bottom of the button */}
      <span style={{
        position: 'absolute',
        left: 6,
        right: 6,
        bottom: 6,
        height: 6,
        background: 'var(--progress-track)',
        borderRadius: 6,
        overflow: 'hidden'
      }}>
        <span style={{
          display: 'block',
          height: '100%',
          width: `${pct}%`,
          background: 'var(--progress-fill)',
          transition: 'width 240ms ease'
        }} />
      </span>
    </button>
  );
}

export default FeatureButton;
