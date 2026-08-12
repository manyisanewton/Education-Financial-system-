import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import Logo from '../../components/Logo/Logo'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { apiRequest, schoolCode } from '../../services/api'
import './Login.css'

export default function Login() {
  const { user, login, loading } = useAuth()
  const { language, setLanguage } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('c.njeri@greenfield.ac.ke')
  const [password, setPassword] = useState('Greenfield@2026')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const from = (location.state as { from?: string } | null)?.from || '/'
  if (user) return <Navigate to="/" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    if (!email.trim() || !password) { setError(language === 'sw' ? 'Barua pepe na nenosiri zinahitajika.' : 'Email and password are required.'); return }
    const result = await login(email, password, remember)
    if (result.success) navigate(from, { replace: true }); else setError(result.message || 'Unable to sign in.')
  }
  const useAccount = (account: 'accountant' | 'principal' | 'admin') => { setEmail({ accountant: 'c.njeri@greenfield.ac.ke', principal: 'principal@greenfield.ac.ke', admin: 'p.ochieng@greenfield.ac.ke' }[account]); setPassword('Greenfield@2026'); setError('') }
  const copyPassword = () => navigator.clipboard?.writeText('Greenfield@2026').then(() => Swal.fire({ toast: true, position: 'top-end', timer: 1800, showConfirmButton: false, icon: 'success', title: 'Demo password copied' }))
  const forgotPassword = () => Swal.fire({
    title: language === 'sw' ? 'Weka upya nenosiri' : 'Reset your password', input: 'email', inputValue: email, inputPlaceholder: 'Work email', showCancelButton: true,
    confirmButtonText: language === 'sw' ? 'Tuma maelekezo' : 'Send reset link', confirmButtonColor: '#1f6b50', showLoaderOnConfirm: true,
    preConfirm: async value => { try { return await apiRequest<{ message: string; developmentToken?: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: value, schoolCode }) }) } catch (requestError) { Swal.showValidationMessage(requestError instanceof Error ? requestError.message : 'Unable to request a reset.') } },
  }).then(result => { if (result.isConfirmed) Swal.fire({ title: language === 'sw' ? 'Angalia barua pepe yako' : 'Check your email', text: result.value?.developmentToken ? 'Development reset token generated. Email delivery will be connected before production.' : result.value?.message, icon: 'success', confirmButtonColor: '#1f6b50' }) })

  return <main className="login-page">
    <section className="login-showcase">
      <div className="showcase-pattern"/><div className="showcase-top"><Logo/><span>STAFF PORTAL</span></div>
      <div className="showcase-content"><span className="showcase-eyebrow">SMART SCHOOL FINANCE</span><h1>Every shilling.<br/>Clearly accounted for.</h1><p>One secure workspace for fees, payments, expenses, budgets and trustworthy financial reporting.</p><div className="showcase-metrics"><div><strong>KSh 3.92M</strong><span>Fees collected</span></div><div><strong>80.8%</strong><span>Collection rate</span></div><div><strong>642</strong><span>Student accounts</span></div></div></div>
      <div className="showcase-quote"><span className="material-symbols-rounded">format_quote</span><p>ShuleFinance gives our leadership the clarity to make better decisions for every learner.</p><div><span>JM</span><div><b>Dr. James Mwangi</b><small>Principal, Greenfield Academy</small></div></div></div><footer>© 2026 Greenfield Academy · Nairobi, Kenya</footer>
    </section>
    <section className="login-panel">
      <div className="login-mobile-logo"><Logo/></div><div className="login-language"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button><button className={language === 'sw' ? 'active' : ''} onClick={() => setLanguage('sw')}>Kiswahili</button></div>
      <div className="login-card"><div className="login-heading"><span className="material-symbols-rounded">lock</span><h2>{language === 'sw' ? 'Karibu tena' : 'Welcome back'}</h2><p>{language === 'sw' ? 'Ingia kwenye akaunti yako ya wafanyakazi.' : 'Sign in to your Greenfield Academy staff account.'}</p></div>
        <form onSubmit={submit} noValidate>
          <label>{language === 'sw' ? 'Barua pepe ya kazi' : 'Work email'}<div className="login-input"><span className="material-symbols-rounded">mail</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@greenfield.ac.ke" autoComplete="email"/></div></label>
          <label>{language === 'sw' ? 'Nenosiri' : 'Password'}<div className="login-input"><span className="material-symbols-rounded">key</span><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password"/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}><span className="material-symbols-rounded">{showPassword ? 'visibility_off' : 'visibility'}</span></button></div></label>
          <div className="login-options"><label><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/><span/>{language === 'sw' ? 'Nikumbuke' : 'Remember me'}</label><button type="button" onClick={forgotPassword}>{language === 'sw' ? 'Umesahau nenosiri?' : 'Forgot password?'}</button></div>
          {error && <div className="login-error" role="alert"><span className="material-symbols-rounded">error</span><p>{error}</p></div>}
          <button className="login-submit" type="submit" disabled={loading}>{loading ? <><i/>Signing in…</> : <>{language === 'sw' ? 'Ingia' : 'Sign in'}<span className="material-symbols-rounded">arrow_forward</span></>}</button>
        </form>
        <div className="demo-divider"><span>OR USE A DEMO ACCOUNT</span></div><div className="demo-accounts"><button onClick={() => useAccount('accountant')}><span className="account-avatar green">CN</span><span><b>Accountant</b><small>Daily finance operations</small></span><span className="material-symbols-rounded">arrow_forward</span></button><button onClick={() => useAccount('principal')}><span className="account-avatar gold">JM</span><span><b>Principal</b><small>Approvals and oversight</small></span><span className="material-symbols-rounded">arrow_forward</span></button><button onClick={() => useAccount('admin')}><span className="account-avatar blue">PO</span><span><b>Administrator</b><small>Full system access</small></span><span className="material-symbols-rounded">arrow_forward</span></button></div>
        <div className="demo-password"><span className="material-symbols-rounded">info</span><p>Demo password: <code>Greenfield@2026</code></p><button onClick={copyPassword}><span className="material-symbols-rounded">content_copy</span></button></div>
      </div><footer className="login-help"><span className="material-symbols-rounded">help</span>Need help signing in? <button onClick={() => Swal.fire({ title: 'Contact your administrator', text: 'Email admin@greenfield.ac.ke or call +254 709 440 200.', icon: 'info', confirmButtonColor: '#1f6b50' })}>Contact support</button></footer>
    </section>
  </main>
}
