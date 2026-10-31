import { prettyValue, statusClass } from '../../utils/format.js';

function columnsFromRows(rows) {
  const keys = [];
  rows.forEach((row) => {
    if (row && typeof row === 'object') {
      Object.keys(row).forEach((key) => { if (!keys.includes(key)) keys.push(key); });
    }
  });
  return keys.slice(0, 8);
}

function displayCell(key, value) {
  if (value == null || value === '') return <span className="muted">—</span>;
  if (typeof value === 'object') return <code className="inline-json">{JSON.stringify(value)}</code>;
  if (/status|state|result|severity/i.test(key)) {
    return <span className={`status-pill ${statusClass(value)}`}>{String(value)}</span>;
  }
  return String(value);
}

export default function DataTable({ rows = [], loading = false, emptyText = 'No records found.' }) {
  const columns = columnsFromRows(rows);
  if (loading) return <div className="table-message"><span className="spinner" /> Loading data from backend…</div>;
  if (!rows.length) return <div className="table-message">{emptyText}</div>;
  if (!columns.length) return <pre className="json-output">{JSON.stringify(rows, null, 2)}</pre>;

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>{columns.map((key) => <th key={key}>{key.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row?.id ?? row?.paymentId ?? row?.paymentReference ?? row?.merchantId ?? index}>
              {columns.map((key) => <td key={key}>{displayCell(key, row?.[key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}