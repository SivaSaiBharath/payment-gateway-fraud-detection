import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function Notice({ type = 'info', children, onClose }) {
  if (!children) return null;
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;
  return (
    <div className={`notice notice-${type}`} role="status">
      <Icon size={17} />
      <div>{children}</div>
      {onClose && <button className="notice-close" onClick={onClose} aria-label="Dismiss message">×</button>}
    </div>
  );
}