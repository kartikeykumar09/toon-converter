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
      <header>
        <div>
          <h1>
            <ArrowRightLeft className="text-primary" />
            JSON to TOON Converter
          </h1>
          <p className="description">
            Compress your JSON data for LLM inputs. Format maps to "Token-Oriented Object Notation".
          </p>
        </div>
        
        {reduction > 0 && (
          <div className="savings-badge">
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            <span>{reduction}% Reduction in Tokens</span>
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
          {error && (
            <div style={{ padding: '1rem', color: 'var(--danger)', fontSize: '0.9rem', borderTop: '1px solid var(--border)' }}>
              Error: {error}
            </div>
          )}
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
    </div>
  );
}

export default App;
