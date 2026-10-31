
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Notice from '../components/common/Notice.jsx';
import DataTable from '../components/common/DataTable.jsx';
import JsonResult from '../components/common/JsonResult.jsx';
import SectionCard from '../components/layout/SectionCard.jsx';
import { transactionsApi } from '../services/transactionsApi.js';
import { getErrorMessage } from '../services/api.js';
import { asArray } from '../utils/format.js';
import '../styles/TransactionsPage.css';

export default function TransactionsPage({ onChanged }) {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [lookupId, setLookupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(undefined);

  // Transaction form
  const [form, setForm] = useState({
    accountId: '',
    amount: '',
    type: 'DEBIT',
    location: '',
    isPinCorrect: true,
  });

  const load = useCallback(async (selectedFilter = filter) => {
    setLoading(true);
    setNotice(null);

    try {
      setRows(asArray((await transactionsApi.list(selectedFilter)).data));
    } catch (e) {
      setRows([]);
      setNotice({ type: 'error', text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load('');
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  // Create transaction
  async function create(e) {
    e.preventDefault();

    setBusy(true);
    setNotice(null);
    setResult(undefined);

    const payload = {
      accountId: Number(form.accountId),
      amount: Number(form.amount),
      type: form.type,
      location: form.location.trim(),
      isPinCorrect: form.isPinCorrect,
    };

    try {
      const response = await transactionsApi.create(payload);

      setResult(response.data);
      setNotice({
        type: 'success',
        text: 'Transaction create request succeeded.',
      });

      setForm({
        accountId: '',
        amount: '',
        type: 'DEBIT',
        location: '',
        isPinCorrect: true,
      });

      await load(filter);
      onChanged?.();
    } catch (e) {
      setNotice({
        type: 'error',
        text: getErrorMessage(e),
      });
    } finally {
      setBusy(false);
    }
  }

  // Find transaction - unchanged
  async function lookup(e) {
    e.preventDefault();
    if (!lookupId.trim()) return;

    setBusy(true);
    setNotice(null);
    setResult(undefined);

    try {
      setResult(
        (await transactionsApi.getById(lookupId.trim())).data
      );

      setNotice({
        type: 'success',
        text: 'Transaction found.',
      });
    } catch (e) {
      setNotice({
        type: 'error',
        text: getErrorMessage(e),
      });
    } finally {
      setBusy(false);
    }
  }

  function changeFilter(value) {
    setFilter(value);
    load(value);
  }

  return (
    <>
      <PageHeader
        eyebrow="TRANSACTION MONITORING"
        title="Transactions"
        description="Create transactions, retrieve by ID, and filter flagged or unflagged records."
        action={
          <button
            className="secondary-button"
            onClick={() => load(filter)}
          >
            Refresh list
          </button>
        }
      />

      {notice && (
        <Notice type={notice.type} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      <div className="two-column">

        {/* Create Transaction - Form */}
        <SectionCard
          title="Create transaction"
          subtitle="POST /Api/transaction"
        >
          <form
            className="transaction-form"
            onSubmit={create}
          >
            <div className="transaction-form-field">
              <label htmlFor="accountId">Account ID</label>
              <input
                id="accountId"
                name="accountId"
                type="number"
                min="1"
                placeholder="Enter account ID"
                value={form.accountId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="transaction-form-field">
              <label htmlFor="amount">Transaction Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="transaction-form-field">
              <label htmlFor="type">Transaction Type</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="DEBIT">DEBIT</option>
                <option value="CREDIT">CREDIT</option>
              </select>
            </div>

            <div className="transaction-form-field">
              <label htmlFor="location">Transaction Location</label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Enter location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="transaction-pin-field">
              <label htmlFor="isPinCorrect">
                Is PIN correct?
              </label>
              <input
                id="isPinCorrect"
                name="isPinCorrect"
                type="checkbox"
                checked={form.isPinCorrect}
                onChange={handleChange}
              />
              <span>
                {form.isPinCorrect ? 'Correct PIN' : 'Incorrect PIN'}
              </span>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Creating...' : 'Create transaction'}
            </button>
          </form>

          <JsonResult
            title="Transaction response"
            data={result}
          />
        </SectionCard>

        {/* RIGHT SIDE - PRESERVED */}
        <div className="vertical-stack">

          <SectionCard
            title="Find transaction"
            subtitle="GET /Api/transaction/{id}"
          >
            <form className="inline-form" onSubmit={lookup}>
              <label className="field-label" htmlFor="transaction-id">
                Transaction ID
              </label>

              <input
                id="transaction-id"
                type="number"
                min="1"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter transaction ID"
                required
              />

              <button className="primary-button" disabled={busy}>
                Find transaction
              </button>
            </form>
          </SectionCard>

          <SectionCard
            title="Fraud filter"
            subtitle="GET /Api/transaction?flagged=true|false"
          >
            <label className="field-label" htmlFor="flag-filter">
              Show transactions
            </label>

            <select
              id="flag-filter"
              value={filter}
              onChange={(e) => changeFilter(e.target.value)}
              className="select-input"
            >
              <option value="">All transactions</option>
              <option value="true">Flagged only</option>
              <option value="false">Not flagged</option>
            </select>
          </SectionCard>

        </div>
      </div>

      {/* Transaction Records - PRESERVED */}
      <SectionCard
        title="Transaction records"
        subtitle={
          filter === ''
            ? 'All transactions'
            : `Filter: flagged = ${filter}`
        }
      >
        <DataTable
          rows={rows}
          loading={loading}
          emptyText="No transactions found, or the API is not reachable."
        />
      </SectionCard>
    </>
  );
}
