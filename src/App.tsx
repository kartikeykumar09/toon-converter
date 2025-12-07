import { useState, useEffect } from 'react';
import { FileJson, FileText, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { toTOON } from './utils/toon';
import './index.css';

const SAMPLE_JSON = [
  { "id": 1, "name": "Alice Johnson", "role": "admin", "active": true, "tags": ["dev", "lead"] },
  { "id": 2, "name": "Bob Smith", "role": "user", "active": true, "tags": ["design"] },
  { "id": 3, "name": "Charlie Brown", "role": "user", "active": false, "tags": ["marketing"] },
  { "id": 4, "name": "Diana Ross", "role": "moderator", "active": true, "tags": ["support"] }
];

function App() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_JSON, null, 2));
  const [toonOutput, setToonOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (!jsonInput.trim()) {
        setToonOutput('');
        setError(null);
        return;
      }
      const parsed = JSON.parse(jsonInput);
      const converted = toTOON(parsed);
      setToonOutput(converted);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [jsonInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(toonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStats = (text: string) => {
    const chars = text.length;
    // Rough token estimate (1 token ~= 4 chars)
    const tokens = Math.ceil(chars / 4);
    return { chars, tokens };
  };

  const jsonStats = getStats(jsonInput);
  const toonStats = getStats(toonOutput);
  const reduction = jsonStats.chars > 0 
    ? Math.round(((jsonStats.chars - toonStats.chars) / jsonStats.chars) * 100) 
    : 0;

  return (
    <div className="container">
      <header className="header">
        <div className="header-badge">
          <ArrowRightLeft size={14} />
          <span>Free Tool</span>
        </div>
        <h1>
          JSON to TOON Converter
        </h1>
        <p>
          Compress your JSON data directly into Token-Oriented Object Notation.
          <br />
          Reduce token usage for LLM prompts by up to 60%.
        </p>
        
        {reduction > 0 && (
          <div className="savings-badge">
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            <span>{reduction}% Reduction</span>
          </div>
        )}
      </header>

      <div className="converter-grid">
        {/* JSON Input */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <FileJson size={18} className="text-muted-foreground" />
              <span>JSON Input</span>
              {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Error in JSON</span>}
            </div>
            <div className="panel-stats">
              {jsonStats.chars} chars (~{jsonStats.tokens} tokens)
            </div>
          </div>
          <textarea
            className="editor-area"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON here..."
            spellCheck={false}
          />
        </div>

        {/* TOON Output */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <FileText size={18} className="text-muted-foreground" />
              <span>TOON Output</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="panel-stats">
                <span className="stat-value">{toonStats.chars}</span> chars (~{toonStats.tokens} tokens)
              </div>
              <button className="btn" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            className="editor-area"
            value={toonOutput}
            readOnly
            placeholder="TOON output will appear here..."
            spellCheck={false}
            style={{ color: '#a5f3fc' }} // Light cyan for output
          />
        </div>
      </div>

      <footer className="footer">
        <p>
          Built by <a href="https://kartikeykumar.com" target="_blank" rel="noopener noreferrer">Kartikey Kumar</a> · 
          More tools at <a href="https://kartikeykumar.com/tools" target="_blank" rel="noopener noreferrer">kartikeykumar.com/tools</a>
        </p>
        <a href="https://github.com/kartikeykumar09/toon-converter" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          View Source Code
        </a>
      </footer>
    </div>
  );
}

export default App;
