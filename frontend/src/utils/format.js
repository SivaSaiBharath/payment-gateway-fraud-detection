export function asArray(data) {
  if (Array.isArray(data)) return data;
  if (data == null) return [];
  // Some Spring endpoints may return a single object; show it as one row.
  return [data];
}

export function prettyValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export function formatCurrency(amount, currency = 'INR') {
  const number = Number(amount);
  if (!Number.isFinite(number)) return prettyValue(amount);
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(number);
  } catch {
    return `${currency} ${number.toFixed(2)}`;
  }
}

export function statusClass(value) {
  return String(value ?? 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}