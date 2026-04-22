const MODES = [
  { id: 'corporate-genz',       label: 'Corporate → Gen Z',       emoji: '💼' },
  { id: 'angry-passive',        label: 'Angry → Passive Aggressive', emoji: '😤' },
  { id: 'meeting-sports',       label: 'Meeting → Sports Commentary', emoji: '🏆' },
  { id: 'rant-bbc',             label: 'Rant → BBC News Anchor',   emoji: '📺' },
  { id: 'customer-professional',label: 'Angry Customer → Professional', emoji: '🤝' },
]

export default function ModeSelector({ selectedMode, onModeChange }) {
  return (
    <div className="mode-selector">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`mode-pill ${selectedMode === mode.id ? 'mode-pill-active' : ''}`}
          title={mode.label}
        >
          <span>{mode.emoji}</span>
          <span className="mode-pill-label">{mode.label}</span>
        </button>
      ))}
    </div>
  )
}