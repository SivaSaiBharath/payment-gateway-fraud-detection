export default function JsonResult({ title = 'API response', data }) {
  if (data === undefined) return null;
  return (
    <section className="response-card">
      <div className="response-heading"><span className="success-dot" />{title}</div>
      <pre className="json-output">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}