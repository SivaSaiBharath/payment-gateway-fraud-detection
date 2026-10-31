import { NavLink, Route, Routes } from 'react-router-dom';
import {
  Activity, AlertTriangle, Building2, CreditCard, LayoutDashboard, WalletCards,
} from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import MerchantsPage from './pages/MerchantsPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import { useState } from 'react';
import './styles/app.css';
import './styles/readability.css';
const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/accounts', label: 'Accounts', icon: WalletCards },
  { to: '/merchants', label: 'Merchants', icon: Building2 },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/transactions', label: 'Transactions', icon: Activity },
  { to: '/alerts', label: 'Fraud alerts', icon: AlertTriangle },
];

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((v) => v + 1);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><WalletCards size={21} /></div>
          <div><strong>PayGuard</strong><span>Payment operations</span></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="live-dot" />
          <div><strong>Backend connection</strong><small>Configured by environment</small></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div><span className="top-eyebrow">PAYMENT GATEWAY</span><h1>Operations console</h1></div>
          <div className="top-right"><span className="environment-tag">API connected by config</span><div className="avatar">PG</div></div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard refreshKey={refreshKey} />} />
            <Route path="/accounts" element={<AccountsPage onChanged={refresh} />} />
            <Route path="/merchants" element={<MerchantsPage onChanged={refresh} />} />
            <Route path="/payments" element={<PaymentsPage onChanged={refresh} />} />
            <Route path="/transactions" element={<TransactionsPage onChanged={refresh} />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="*" element={<Dashboard refreshKey={refreshKey} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}