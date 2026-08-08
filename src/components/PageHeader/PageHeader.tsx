import type { ReactNode } from 'react'
import './PageHeader.css'
export default function PageHeader({eyebrow,title,subtitle,actions}:{eyebrow?:string;title:string;subtitle:string;actions?:ReactNode}){return <div className="page-header"><div>{eyebrow&&<span className="page-header__eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{subtitle}</p></div>{actions&&<div className="page-header__actions">{actions}</div>}</div>}
