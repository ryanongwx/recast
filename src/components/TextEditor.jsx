import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

const MODE_PLACEHOLDERS = {
  'corporate-genz': 'Enter your formal business text here... (e.g., "Please be advised that we need to schedule a meeting...")',
  'angry-passive': 'Enter your angry message here... (e.g., "This is completely unacceptable!")',
  'meeting-sports': 'Enter your boring meeting notes here... (e.g., "We reviewed the budget allocations...")',
  'rant-bbc': 'Enter your unhinged rant here... (e.g., "I CAN\'T BELIEVE THEY CANCELLED MY FAVORITE SHOW!!!")',
  'customer-professional': 'Enter the angry customer message here... (e.g., "Your service is terrible!")'
}

export default function TextEditor({ 
  inputText, 
  outputText, 
  onInputChange, 
  isTransforming, 
  selectedMode 
}) {
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)

  const handleCopy = async (text, isInput = true) => {
    try {
      await navigator.clipboard.writeText(text)
      if (isInput) {
        setCopiedInput(true)
        setTimeout(() => setCopiedInput(false), 2000)
      } else {
        setCopiedOutput(true)
        setTimeout(() => setCopiedOutput(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const inputWordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length
  const outputWordCount = outputText.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white text-shadow">
            Original Text
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white-70">
              {inputText.length} chars, {inputWordCount} words
            </span>
            {inputText && (
              <button
                onClick={() => handleCopy(inputText, true)}
                className="p-1"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                title="Copy original text"
              >
                {copiedInput ? (
                  <Check style={{ width: '16px', height: '16px', color: '#10b981' }} />
                ) : (
                  <Copy style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.7)' }} />
                )}
              </button>
            )}
          </div>
        </div>
        
        <textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={MODE_PLACEHOLDERS[selectedMode]}
          className="form-textarea"
          maxLength={2000}
        />
      </div>

      {/* Output Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white text-shadow">
            Transformed Text
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white-70">
              {outputText.length} chars, {outputWordCount} words
            </span>
            {outputText && (
              <button
                onClick={() => handleCopy(outputText, false)}
                className="p-1"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                title="Copy transformed text"
              >
                {copiedOutput ? (
                  <Check style={{ width: '16px', height: '16px', color: '#10b981' }} />
                ) : (
                  <Copy style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.7)' }} />
                )}
              </button>
            )}
          </div>
        </div>
        
        <div style={{ position: 'relative' }}>
          <textarea
            value={outputText}
            readOnly
            placeholder={isTransforming ? "Transforming your text..." : "Your transformed text will appear here..."}
            className="form-textarea"
          />
          
          {isTransforming && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px'
            }}>
              <div className="flex items-center gap-3 text-white">
                <div className="spinner"></div>
                <span>Transforming...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}