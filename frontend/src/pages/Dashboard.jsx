import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Building2, CreditCard, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import Notice from '../components/common/Notice.jsx';
import DataTable from '../components/common/DataTable.jsx';
import SectionCard from '../components/layout/SectionCard.jsx';
import { accountsApi } from '../services/accountsApi.js';
import { merchantsApi } from '../services/merchantsApi.js';
import { transactionsApi } from '../services/transactionsApi.js';
import { alertsApi } from '../services/alertsApi.js';
import { asArray } from '../utils/format.js';
import { getErrorMessage } from '../services/api.js';

const metrics = [
  { key: 'transactions', label: 'Transactions', icon: Activity, tone: 'blue', path: '/transactions', hint: 'All transaction records' },
  { key: 'alerts', label: 'Fraud alerts', icon: AlertTriangle, tone: 'rose', path: '/alerts', hint: 'Risk events detected' },
  { key: 'payments', label: 'Payments', icon: CreditCard, tone: 'violet', path: '/payments', hint: 'Use merchant payment lookup' },
  { key: 'accounts', label: 'Accounts', icon: WalletCards, tone: 'teal', path: '/accounts', hint: 'Registered accounts' },
  { key: 'merchants', label: 'Merchants', icon: Building2, tone: 'amber', path: '/merchants', hint: 'Registered businesses' },
];

export default function Dashboard({ refreshKey }) {
  const [data, setData] = useState({ transactions: [], merchants: [], accounts: [], alerts: [] });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const jobs = [
      ['transactions', transactionsApi.list()],
      ['merchants', merchantsApi.list()],
      ['accounts', accountsApi.list()],
      ['alerts', alertsApi.list()],
    ];
    Promise.all(jobs.map(async ([key, request]) => {
      try { return { key, value: asArray((await request).data), error: null }; }
      catch (error) { return { key, value: [], error: `${key}: ${getErrorMessage(error)}` }; }
    })).then((results) => {
      if (!alive) return;
      const next = { transactions: [], merchants: [], accounts: [], alerts: [] };
      const nextErrors = [];
      results.forEach((item) => { next[item.key] = item.value; if (item.error) nextErrors.push(item.error); });
      setData(next); setErrors(nextErrors); setLoading(false);
    });
    return () => { alive = false; };
  }, [refreshKey, reload]);

  const flaggedCount = data.transactions.filter((item) => item?.flagged === true || String(item?.status || '').toUpperCase() === 'FLAGGED').length;
  const cards = metrics.map((metric) => ({ ...metric, value: metric.key === 'payments' ? '—' : data[metric.key].length }));

  return (
    <>
      <PageHeader eyebrow="OPERATIONS OVERVIEW" title="Good to see you." description="Monitor payment activity, manage records, and keep an eye on potential fraud." action={<button className="secondary-button refresh-button" onClick={() => setReload((value) => value + 1)} disabled={loading}><RefreshCw size={15} className={loading ? 'refreshing' : ''} /> Refresh data</button>} />
      {errors.length > 0 && <Notice type="error">Some dashboard data could not be loaded: {errors.join(' · ')}. Check that Spring Boot is running, the API URL is correct, and CORS is configured.</Notice>}

      <section className="welcome-panel">
        <div className="welcome-copy"><div className="welcome-kicker"><ShieldCheck size={14} /> PAYMENT & RISK CONTROL</div><h2>Your payment operations,<br /><span>all in one place.</span></h2><p>A clear view of the records returned by your connected backend APIs.</p><Link to="/transactions" className="welcome-link">Explore transactions <ArrowUpRight size={16} /></Link></div>
        <div className="welcome-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-core"><ShieldCheck size={48} strokeWidth={1.4} /></div><div className="art-chip chip-top"><Activity size={15} /> LIVE ACTIVITY</div><div className="art-chip chip-bottom"><span /> RISK MONITORING</div></div>
      </section>

      <div className="section-intro"><div><span className="section-kicker">YOUR WORKSPACE</span><h3>At a glance</h3></div><span className="data-caption">{loading ? 'Updating records…' : 'Counts based on API responses'}</span></div>
      <div className="metric-grid">
        {cards.map(({ key, label, value, icon: Icon, tone, path, hint }) => (
          <Link to={path} className="metric-card" key={key}>
            <div className="metric-top"><span className={`metric-icon ${tone}`}><Icon size={19} /></span><ArrowUpRight size={16} className="metric-arrow" /></div>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{loading ? '—' : value}</div>
            <div className="metric-foot">{hint}</div>
          </Link>
        ))}
      </div>

      <div className="risk-strip"><div className="risk-icon"><AlertTriangle size={18} /></div><div className="risk-copy"><strong>Fraud monitoring snapshot</strong><span>Transactions currently marked as flagged by the API</span></div><strong className="risk-count">{loading ? '—' : flaggedCount}</strong><Link to="/alerts" className="risk-link">View alerts <ArrowUpRight size={14} /></Link></div>

      <div className="dashboard-grid">
        <SectionCard title="Recent transactions" subtitle="Latest records returned by your transaction API">
          <DataTable rows={data.transactions.slice(0, 6)} loading={loading} emptyText="No transactions returned yet. Create a transaction or check the backend connection." />
          <div className="card-bottom-link"><Link to="/transactions">View all transactions <ArrowUpRight size={14} /></Link></div>
        </SectionCard>
        <SectionCard title="Recent fraud alerts" subtitle="Alert records returned by /Alerts">
          <DataTable rows={data.alerts.slice(0, 5)} loading={loading} emptyText="No fraud alerts returned." />
          <div className="card-bottom-link"><Link to="/alerts">Open fraud monitoring <ArrowUpRight size={14} /></Link></div>
        </SectionCard>
      </div>
      <p className="dashboard-note">Note: Payments are not counted here because the current backend exposes payment lookup by merchant ID, not a global payments list. No financial totals or success rates are estimated.</p>
    </>
  );
}
