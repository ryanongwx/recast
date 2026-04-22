import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const PLACEHOLDERS = {
  'corporate-genz':         'Paste formal business text...',
  'angry-passive':          'Paste an angry message...',
  'meeting-sports':         'Paste boring meeting notes...',
  'rant-bbc':               'Paste an unhinged rant...',
  'customer-professional':  'Paste an angry customer message...',
}

export default function TextEditor({ inputText, outputText, onInputChange, isTransforming, selectedMode }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="editor-panes">
      {/* Input */}
      <div className="pane">
        <div className="pane-header">
          <span>Original</span>
          <span className="char-count">{inputText.length}/2000</span>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={PLACEHOLDERS[selectedMode]}
          className="pane-textarea"
          maxLength={2000}
        />
      </div>

      {/* Output */}
      <div className="pane">
        <div className="pane-header">
          <span>Transformed</span>
          {outputText && (
            <button onClick={handleCopy} className="copy-btn" title="Copy">
              {copied
                ? <Check style={{ width: 13, height: 13, color: '#10b981' }} />
                : <Copy style={{ width: 13, height: 13 }} />}
            </button>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={outputText}
            readOnly
            placeholder={isTransforming ? 'Transforming...' : 'Result appears here...'}
            className="pane-textarea"
          />
          {isTransforming && (
            <div className="transform-overlay">
              <div className="spinner" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}