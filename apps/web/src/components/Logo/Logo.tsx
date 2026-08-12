import './Logo.css'

export default function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><div className="logo__mark"><span className="material-symbols-rounded">account_balance</span></div>{!compact && <div><strong>Shule<span>Finance</span></strong><small>Smart school finances</small></div>}</div>
}
