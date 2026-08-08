import './StatusBadge.css'
export default function StatusBadge({status}:{status:string}){return <span className={`status status--${status.toLowerCase()}`}><i/>{status}</span>}
