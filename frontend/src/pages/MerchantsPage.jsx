
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Notice from '../components/common/Notice.jsx';
import DataTable from '../components/common/DataTable.jsx';
import JsonResult from '../components/common/JsonResult.jsx';
import SectionCard from '../components/layout/SectionCard.jsx';
import { merchantsApi } from '../services/merchantsApi.js';
import { getErrorMessage } from '../services/api.js';
import { asArray } from '../utils/format.js';
import '../styles/MerchantsPage.css';

export default function MerchantsPage({ onChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [merchantId, setMerchantId] = useState('');
  const [notice, setNotice] = useState(null);

  const [registrationResult, setRegistrationResult] = useState(undefined);
  const [lookupResult, setLookupResult] = useState(undefined);

  const [form, setForm] = useState({
    businessName: '',
    email: '',
    phone: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(asArray((await merchantsApi.list()).data));
    } catch (e) {
      setNotice({ type: 'error', text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Register merchant
  async function register(e) {
    e.preventDefault();

    setBusy(true);
    setNotice(null);
    setRegistrationResult(undefined);

    try {
      const response = await merchantsApi.register(form);

      setRegistrationResult(response.data);

      setNotice({
        type: 'success',
        text: 'Merchant registration request succeeded.',
      });

      setForm({
        businessName: '',
        email: '',
        phone: '',
      });

      await load();
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

  // Find merchant by ID
  async function lookup(e) {
    e.preventDefault();

    if (!merchantId.trim()) return;

    setBusy(true);
    setNotice(null);
    setLookupResult(undefined);

    try {
      const response = await merchantsApi.getById(merchantId.trim());

      setLookupResult(response.data);

      setNotice({
        type: 'success',
        text: 'Merchant found.',
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

  return (
    <>
      <PageHeader
        eyebrow="MERCHANT MANAGEMENT"
        title="Merchants"
        description="Register a merchant, view all merchants, or search by merchant ID."
        action={
          <button className="secondary-button" onClick={load}>
            Refresh list
          </button>
        }
      />

      {notice && (
        <Notice
          type={notice.type}
          onClose={() => setNotice(null)}
        >
          {notice.text}
        </Notice>
      )}

      <div className="two-column">

        {/* Register Merchant */}
        <SectionCard
          title="Register merchant"
          subtitle="POST /api/v1/merchants/register"
        >
          <form
            className="merchant-registration-form"
            onSubmit={register}
          >
            <div className="merchant-registration-field">
              <label htmlFor="businessName">Business Name</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Enter business name"
                value={form.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="merchant-registration-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter business email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="merchant-registration-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Registering...' : 'Register merchant'}
            </button>
          </form>

          <JsonResult
            title="Registration response"
            data={registrationResult}
          />
        </SectionCard>

        {/* Find Merchant */}
        <SectionCard
          title="Find merchant"
          subtitle="GET /api/v1/merchants/{merchantId}"
        >
          <form className="inline-form" onSubmit={lookup}>
            <label className="field-label" htmlFor="merchant-id">
              Merchant ID
            </label>

            <input
              id="merchant-id"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="Enter merchant ID"
              required
            />

            <button className="primary-button" disabled={busy}>
              {busy ? 'Searching...' : 'Find merchant'}
            </button>
          </form>

          <JsonResult
            title="Merchant response"
            data={lookupResult}
          />
        </SectionCard>

      </div>

      {/* All Merchants */}
      <SectionCard
        title="All merchants"
        subtitle="GET /api/v1/merchants"
      >
        <DataTable
          rows={rows}
          loading={loading}
          emptyText="No merchants found, or the API is not reachable."
        />
      </SectionCard>
    </>
  );
}
