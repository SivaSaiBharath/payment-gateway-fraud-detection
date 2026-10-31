import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Notice from '../components/common/Notice.jsx';
import DataTable from '../components/common/DataTable.jsx';
import JsonEditor from '../components/common/JsonEditor.jsx';
import JsonResult from '../components/common/JsonResult.jsx';
import SectionCard from '../components/layout/SectionCard.jsx';
import { accountsApi } from '../services/accountsApi.js';
import { getErrorMessage } from '../services/api.js';
import { asArray } from '../utils/format.js';

export default function AccountsPage({ onChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(undefined);

  const load = useCallback(async () => {
    setLoading(true); setNotice(null);
    try { setRows(asArray((await accountsApi.list()).data)); }
    catch (e) { setNotice({ type: 'error', text: getErrorMessage(e) }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(payload) {
    setBusy(true); setNotice(null); setResult(undefined);
    try {
      const response = await accountsApi.create(payload);
      setResult(response.data); setNotice({ type: 'success', text: 'Account create request succeeded.' });
      await load(); onChanged?.();
    } catch (e) { setNotice({ type: 'error', text: getErrorMessage(e) }); }
    finally { setBusy(false); }
  }

  async function lookup(e) {
    e.preventDefault(); if (!lookupId.trim()) return;
    setBusy(true); setNotice(null); setResult(undefined);
    try { setResult((await accountsApi.getById(lookupId.trim())).data); setNotice({ type: 'success', text: 'Account found.' }); }
    catch (e) { setNotice({ type: 'error', text: getErrorMessage(e) }); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader eyebrow="ACCOUNT MANAGEMENT" title="Accounts" description="Create accounts, view the account list, or look up an account by ID." action={<button className="secondary-button" onClick={load}>Refresh list</button>} />
      {notice && <Notice type={notice.type} onClose={() => setNotice(null)}>{notice.text}</Notice>}
      <div className="two-column">
        <SectionCard title="Create account" subtitle="Request body is the Accounts entity. Use fields from your Java class.">
          <JsonEditor label="Account JSON" initialValue={{}} help='Example format only: enter the exact property names defined by your Accounts entity.' onSubmit={create} busy={busy} submitLabel="Create account" />
        </SectionCard>
        <SectionCard title="Find account" subtitle="GET /getAccById/{id}">
          <form className="inline-form" onSubmit={lookup}><label className="field-label" htmlFor="account-id">Account ID</label><input id="account-id" value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="Enter account ID" required /><button className="primary-button" disabled={busy}>Find account</button></form>
          <JsonResult title="Account response" data={result} />
        </SectionCard>
      </div>
      <SectionCard title="All accounts" subtitle="GET /listOfAcc">
        <DataTable rows={rows} loading={loading} emptyText="No accounts found, or the API is not reachable." />
      </SectionCard>
    </>
  );
}