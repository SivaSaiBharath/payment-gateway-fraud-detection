import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Notice from '../components/common/Notice.jsx';
import DataTable from '../components/common/DataTable.jsx';
import JsonResult from '../components/common/JsonResult.jsx';
import SectionCard from '../components/layout/SectionCard.jsx';
import { paymentsApi } from '../services/paymentsApi.js';
import { getErrorMessage } from '../services/api.js';
import { asArray } from '../utils/format.js';

const initialPayment = { merchantId: '', accountId: '', amount: '', currency: 'INR' };

export default function PaymentsPage({ onChanged }) {
  const [form, setForm] = useState(initialPayment);
  const [lookupId, setLookupId] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(undefined);

  function update(e) { setForm((old) => ({ ...old, [e.target.name]: e.target.value })); }

  async function create(e) {
    e.preventDefault(); setBusy(true); setNotice(null); setResult(undefined);
    const payload = { merchantId: form.merchantId.trim(), accountId: Number(form.accountId), amount: Number(form.amount), currency: form.currency.trim().toUpperCase() };
    try {
      const response = await paymentsApi.create(payload);
      setResult(response.data); setNotice({ type: 'success', text: 'Payment request accepted by the backend.' });
      setForm(initialPayment); onChanged?.();
    } catch (error) { setNotice({ type: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  async function lookup(e) {
    e.preventDefault(); if (!lookupId.trim()) return;
    setBusy(true); setNotice(null); setResult(undefined);
    try { setResult((await paymentsApi.getById(lookupId.trim())).data); setNotice({ type: 'success', text: 'Payment found.' }); }
    catch (error) { setNotice({ type: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  const loadByMerchant = useCallback(async (e) => {
    e?.preventDefault();
    if (!merchantId.trim()) return;
    setLoading(true); setNotice(null);
    try { setRows(asArray((await paymentsApi.listByMerchant(merchantId.trim())).data)); }
    catch (error) { setRows([]); setNotice({ type: 'error', text: getErrorMessage(error) }); }
    finally { setLoading(false); }
  }, [merchantId]);

  return (
    <>
      <PageHeader eyebrow="PAYMENT PROCESSING" title="Payments" description="Create a payment, retrieve a payment, or list payments for a merchant." />
      {notice && <Notice type={notice.type} onClose={() => setNotice(null)}>{notice.text}</Notice>}
      <div className="two-column">
        <SectionCard title="Create payment" subtitle="POST /api/v1/Payments/payment">
          <form className="stack-form" onSubmit={create}>
            <label>Merchant ID<input name="merchantId" value={form.merchantId} onChange={update} placeholder="Merchant ID from your database" required /></label>
            <label>Account ID<input name="accountId" type="number" min="1" value={form.accountId} onChange={update} placeholder="Numeric account ID" required /></label>
            <div className="form-row"><label>Amount<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={update} placeholder="1000.00" required /></label><label>Currency<input name="currency" maxLength="3" value={form.currency} onChange={update} required /></label></div>
            <p className="field-help">Uses the fields accessed by PaymentService: merchantId, accountId, amount, currency. Use test data only.</p>
            <button className="primary-button" disabled={busy}>{busy ? 'Submitting…' : 'Create payment'}</button>
          </form>
        </SectionCard>
        <div className="vertical-stack">
          <SectionCard title="Find payment" subtitle="GET /api/v1/Payments/{paymentId}">
            <form className="inline-form" onSubmit={lookup}><label className="field-label" htmlFor="payment-id">Payment ID</label><input id="payment-id" type="number" min="1" value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="Enter payment ID" required /><button className="primary-button" disabled={busy}>Find payment</button></form>
          </SectionCard>
          <SectionCard title="Payments by merchant" subtitle="GET /api/v1/Payments/merchant/{merchantId}">
            <form className="inline-form" onSubmit={loadByMerchant}><label className="field-label" htmlFor="payments-merchant-id">Merchant ID (numeric per controller)</label><input id="payments-merchant-id" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} placeholder="Enter merchant ID" required /><button className="primary-button" disabled={loading}>Load payments</button></form>
          </SectionCard>
        </div>
      </div>
      <JsonResult title="Payment API response" data={result} />
      <SectionCard title="Payments for selected merchant" subtitle="Results from the merchant-specific payments endpoint">
        <DataTable rows={rows} loading={loading} emptyText="Enter a merchant ID above to load its payments." />
      </SectionCard>
    </>
  );
}