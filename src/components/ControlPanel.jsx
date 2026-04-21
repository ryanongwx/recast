import { Play, Pause, RotateCcw, Sparkles, Volume2 } from 'lucide-react'

export default function ControlPanel({
  onTransform,
  onPlayOriginal,
  onPlayTransformed,
  onTryExample,
  onClear,
  isTransforming,
  isPlaying,
  hasInput,
  hasOutput
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {/* Transform Button */}
      <button
        onClick={onTransform}
        disabled={!hasInput || isTransforming}
        className={`btn btn-primary ${(!hasInput || isTransforming) ? 'btn:disabled' : ''}`}
      >
        {isTransforming ? (
          <>
            <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
            Transforming...
          </>
        ) : (
          <>
            <Sparkles style={{ width: '16px', height: '16px' }} />
            Transform Text
          </>
        )}
      </button>

      {/* Play Original Button */}
      <button
        onClick={onPlayOriginal}
        disabled={!hasInput}
        className={`btn btn-blue ${!hasInput ? 'btn:disabled' : ''}`}
      >
        {isPlaying ? <Pause style={{ width: '16px', height: '16px' }} /> : <Play style={{ width: '16px', height: '16px' }} />}
        Play Original
      </button>

      {/* Play Transformed Button */}
      <button
        onClick={onPlayTransformed}
        disabled={!hasOutput}
        className={`btn btn-green ${!hasOutput ? 'btn:disabled' : ''}`}
      >
        <Volume2 style={{ width: '16px', height: '16px' }} />
        Play Transformed
      </button>

      {/* Try Example Button */}
      <button
        onClick={onTryExample}
        className="btn btn-orange"
      >
        <Sparkles style={{ width: '16px', height: '16px' }} />
        Try Example
      </button>

      {/* Clear Button */}
      <button
        onClick={onClear}
        disabled={!hasInput && !hasOutput}
        className={`btn btn-gray ${(!hasInput && !hasOutput) ? 'btn:disabled' : ''}`}
      >
        <RotateCcw style={{ width: '16px', height: '16px' }} />
        Clear
      </button>
    </div>
  )
}