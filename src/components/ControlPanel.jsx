import { Play, Pause, RotateCcw, Sparkles, Volume2 } from 'lucide-react'

export default function ControlPanel({
  onTransform,
  onPlayOriginal,
  onPlayTransformed,
  onTryExample,
  onClear,
  isTransforming,
  isPlayingOriginal,
  isPlayingTransformed,
  hasInput,
  hasOutput,
}) {
  return (
    <div className="control-panel">
      <button
        onClick={onTransform}
        disabled={!hasInput || isTransforming}
        className="btn btn-primary"
      >
        {isTransforming ? (
          <><div className="spinner" style={{ width: 14, height: 14 }} /> Transforming...</>
        ) : (
          <><Sparkles style={{ width: 14, height: 14 }} /> Transform</>
        )}
      </button>

      <button
        onClick={onPlayOriginal}
        disabled={!hasInput}
        className="btn btn-blue"
        title="Play original text"
      >
        {isPlayingOriginal
          ? <Pause style={{ width: 14, height: 14 }} />
          : <Play style={{ width: 14, height: 14 }} />}
        Original
      </button>

      <button
        onClick={onPlayTransformed}
        disabled={!hasOutput}
        className="btn btn-green"
        title="Play transformed text"
      >
        {isPlayingTransformed
          ? <Pause style={{ width: 14, height: 14 }} />
          : <Volume2 style={{ width: 14, height: 14 }} />}
        Transformed
      </button>

      <button onClick={onTryExample} className="btn btn-orange">
        <Sparkles style={{ width: 14, height: 14 }} /> Example
      </button>

      <button
        onClick={onClear}
        disabled={!hasInput && !hasOutput}
        className="btn btn-gray"
      >
        <RotateCcw style={{ width: 14, height: 14 }} /> Clear
      </button>
    </div>
  )
}