import { useState } from 'react';

export default function JsonEditor({ label = 'Request JSON', initialValue, onSubmit, submitLabel = 'Submit request', busy = false, help }) {
  const [value, setValue] = useState(() => JSON.stringify(initialValue ?? {}, null, 2));
  const [parseError, setParseError] = useState('');

  function submit(event) {
    event.preventDefault();
    try {
      const parsed = JSON.parse(value);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        setParseError('Enter a JSON object, for example: { "field": "value" }');
        return;
      }
      setParseError('');
      onSubmit(parsed);
    } catch {
      setParseError('JSON is invalid. Check commas, quotes, braces, and field values.');
    }
  }

  return (
    <form className="json-form" onSubmit={submit}>
      <label className="field-label">{label}</label>
      {help && <p className="field-help">{help}</p>}
      <textarea className="json-editor" value={value} onChange={(e) => setValue(e.target.value)} spellCheck="false" rows={9} />
      {parseError && <p className="field-error">{parseError}</p>}
      <button className="primary-button" disabled={busy}>{busy ? 'Sending…' : submitLabel}</button>
    </form>
  );
}