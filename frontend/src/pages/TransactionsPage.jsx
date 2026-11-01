import { useCallback, useEffect, useMemo, useState } from 'react';

import PageHeader from '../components/common/PageHeader.jsx';
import Notice from '../components/common/Notice.jsx';
import SectionCard from '../components/layout/SectionCard.jsx';

import { transactionsApi } from '../services/transactionsApi.js';

import '../styles/TransactionsPage.css';

const initialForm = {
  accountId: '',
  amount: '',
  type: 'DEBIT',
  location: '',
  isPinCorrect: true,
};

function getTransactionId(transaction) {
  return (
    transaction.id ??
    transaction.Txn_ID ??
    transaction.txnId ??
    transaction.transactionId ??
    '-'
  );
}

function sortRecentFirst(transactions) {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.timestamp || 0).getTime();
    const dateB = new Date(b.timestamp || 0).getTime();

    if (dateA && dateB) {
      return dateB - dateA;
    }

    return Number(getTransactionId(b)) - Number(getTransactionId(a));
  });
}

function TransactionResult({ result }) {
  if (!result) {
    return (
      <div className="transaction-empty-response">
        Transaction response will appear here.
      </div>
    );
  }

  const status = String(result.status ?? 'UNKNOWN').toUpperCase();

  const message =
    result.reason ??
    result.message ??
    result.description ??
    result.rejectionReason ??
    '';

  return (
    <div className={`transaction-result result-${status.toLowerCase()}`}>
      <h3>
        {status === 'SUCCESS'
          ? 'Transaction Successful'
          : status === 'REJECTED'
            ? 'Transaction Rejected'
            : status === 'FLAGGED'
              ? 'Transaction Flagged'
              : `Transaction Status: ${status}`}
      </h3>

      {message && (
        <p className="transaction-result-reason">{message}</p>
      )}

      <div className="transaction-result-details">
        <div>
          <span>Transaction ID</span>
          <strong>{getTransactionId(result)}</strong>
        </div>

        <div>
          <span>Account ID</span>
          <strong>{result.accountId ?? '-'}</strong>
        </div>

        <div>
          <span>Amount</span>
          <strong>{result.amount ?? '-'}</strong>
        </div>

        <div>
          <span>Type</span>
          <strong>{result.type ?? '-'}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{status}</strong>
        </div>

        <div>
          <span>Location</span>
          <strong>{result.location ?? '-'}</strong>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage({ onChanged }) {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all');

  const [form, setForm] = useState(initialForm);
  const [lookupId, setLookupId] = useState('');

  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Load transactions
  const loadTransactions = useCallback(async (selectedFilter = filter) => {
    setLoading(true);

    try {
      let params = {};

      if (selectedFilter === 'true') {
        params = { flagged: true };
      } else if (selectedFilter === 'false') {
        params = { flagged: false };
      } else if (selectedFilter === 'rejected') {
        params = { status: 'REJECTED' };
      }

      const response = await transactionsApi.list(params);

      setRows(Array.isArray(response.data) ? response.data : []);

    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to load transactions.',
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTransactions(filter);
  }, [filter, loadTransactions]);

  // Sort transactions newest-first.
  const recentTransactions = useMemo(
    () => sortRecentFirst(rows),
    [rows]
  );

  // Form changes
  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  // Create transaction
  async function handleCreateTransaction(event) {
    event.preventDefault();

    setBusy(true);
    setNotice(null);
    setResult(null);

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

      const status = String(response.data?.status ?? '').toUpperCase();

      setNotice({
        type: status === 'REJECTED' ? 'error' : 'success',
        message:
          status === 'REJECTED'
            ? 'Transaction rejected. Check the response for details.'
            : 'Transaction request processed successfully.',
      });

      setForm(initialForm);

      await loadTransactions(filter);
      onChanged?.();
    } catch (error) {
      setResult(
        typeof error.response?.data === 'object'
          ? error.response.data
          : null
      );

      setNotice({
        type: 'error',
        message:
          error.response?.data?.message ||
          error.message ||
          'Transaction creation failed.',
      });
    } finally {
      setBusy(false);
    }
  }

  // Find transaction
  async function handleFindTransaction(event) {
    event.preventDefault();

    if (!lookupId.trim()) {
      setNotice({
        type: 'error',
        message: 'Please enter a transaction ID.',
      });
      return;
    }

    setLookupLoading(true);
    setNotice(null);
    setResult(null);

    try {
      const response = await transactionsApi.getById(lookupId.trim());

      setResult(response.data);

      setNotice({
        type: 'success',
        message: 'Transaction found successfully.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error.response?.data?.message ||
          error.message ||
          'Transaction not found.',
      });
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <div className="transactions-page">

      <PageHeader
        title="Transactions"
        subtitle="Create, search and monitor payment transactions."
      />

      {notice && (
        <Notice type={notice.type}>
          {notice.message}
        </Notice>
      )}

      {/* CREATE TRANSACTION + RESPONSE */}
      <div className="transaction-create-grid">

        <SectionCard
          title="Create Transaction"
          description="Submit a new transaction for fraud evaluation."
        >
          <form
            className="transaction-form"
            onSubmit={handleCreateTransaction}
          >
            <div className="transaction-form-grid">

              <div className="transaction-form-field">
                <label htmlFor="accountId">Account ID</label>
                <input
                  id="accountId"
                  name="accountId"
                  type="number"
                  min="1"
                  value={form.accountId}
                  onChange={handleFormChange}
                  placeholder="Enter account ID"
                  required
                />
              </div>

              <div className="transaction-form-field">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleFormChange}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="transaction-form-field">
                <label htmlFor="type">Transaction Type</label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                >
                  <option value="DEBIT">DEBIT</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>

              <div className="transaction-form-field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleFormChange}
                  placeholder="Enter location"
                  required
                />
              </div>

            </div>

            <label className="transaction-pin-field">
              <span>Is PIN correct?</span>
              <input
                name="isPinCorrect"
                type="checkbox"
                checked={form.isPinCorrect}
                onChange={handleFormChange}
              />
            </label>

            <button
              className="transaction-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Processing...' : 'Create Transaction'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Transaction Response"
          description="Result of your latest transaction."
        >
          <TransactionResult result={result} />
        </SectionCard>

      </div>

      {/* FIND TRANSACTION + FRAUD FILTER */}
      <div className="transaction-search-grid">

        <SectionCard
          title="Find Transaction"
          description="Search using a transaction ID."
        >
          <form
            className="transaction-lookup-form"
            onSubmit={handleFindTransaction}
          >
            <div className="transaction-form-field">
              <label htmlFor="lookupId">Transaction ID</label>
              <input
                id="lookupId"
                type="text"
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>

            <button
              className="transaction-submit"
              type="submit"
              disabled={lookupLoading}
            >
              {lookupLoading ? 'Searching...' : 'Find Transaction'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Fraud Filter"
          description="Filter transactions by fraud status."
        >
          <div className="transaction-form-field">
            <label htmlFor="fraudFilter">Transaction Filter</label>

            <select
              id="fraudFilter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="true">Flagged Transactions</option>
              <option value="false">Success Transactions</option>
              <option value="rejected">Rejected Transactions</option>
            </select>
          </div>
        </SectionCard>

      </div>

      {/* RECENT TRANSACTIONS - ALWAYS AT THE BOTTOM */}
      <SectionCard
        title="Recent Transactions"
        description="Latest transactions displayed first."
      >
        <div className="transaction-table-wrapper">

          {loading ? (
            <p className="transaction-table-message">
              Loading transactions...
            </p>
          ) : recentTransactions.length === 0 ? (
            <p className="transaction-table-message">
              No transactions found.
            </p>
          ) : (
            <table className="transaction-table">

              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Account ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Flagged</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={`${getTransactionId(transaction)}-${index}`}>
                    <td>{getTransactionId(transaction)}</td>
                    <td>{transaction.accountId ?? '-'}</td>
                    <td>{transaction.amount ?? '-'}</td>
                    <td>{transaction.type ?? '-'}</td>
                    <td>{transaction.location ?? '-'}</td>

                    <td>
                      <span
                        className={`transaction-status status-${String(
                          transaction.status ?? 'unknown'
                        ).toLowerCase()}`}
                      >
                        {transaction.status ?? '-'}
                      </span>
                    </td>

                    <td>
                      {transaction.flagged === true ? 'Yes' : 'No'}
                    </td>

                    <td>
                      {transaction.timestamp
                        ? new Date(transaction.timestamp).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>
      </SectionCard>

    </div>
  );
}