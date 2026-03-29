import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useApplications } from '../hooks/useApplications'
import ApplicationForm from '../components/ApplicationForm'
import Modal from '../components/ui/Modal'
import StatusMessage, { useStatusMessage } from '../components/ui/StatusMessage'
import ApplicationsPanel from '../components/dashboard/ApplicationsPanel'
import StatisticsPanel from '../components/dashboard/StatisticsPanel'
import SettingsPanel from '../components/dashboard/SettingsPanel'

const STATUSES = ['Sendt', 'Til vurdering', 'Intervju', 'Tilbud']
const OUTCOMES = ['Avslag', 'Fått jobben', 'Trukket søknad']

const TABS = [
  { id: 'soknader',      label: 'Søknader',      icon: '📋' },
  { id: 'statistikk',   label: 'Statistikk',    icon: '📊' },
  { id: 'innstillinger', label: 'Innstillinger', icon: '⚙️' },
]

export default function DashboardPage() {
  useEffect(() => { document.title = 'Dashboard — soknadsoversikt.no' }, [])
  const { session, signOut } = useAuth()
  const { applications, loading, error, addApplication, updateApplication, deleteApplication } = useApplications(session?.user?.id)

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'soknader'
  function setActiveTab(tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (tab === 'soknader') next.delete('tab')
      else next.set('tab', tab)
      return next
    })
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const { ref: liveRef, announce } = useStatusMessage()

  const counts = useMemo(() => {
    const c = { total: applications.length, active: 0 }
    STATUSES.forEach(s => { c[s] = 0 })
    OUTCOMES.forEach(o => { c[o] = 0 })
    applications.forEach(a => {
      const statKey = (a.status === 'Til vurdering' && a.outcome) ? 'Sendt' : a.status
      if (c[statKey] !== undefined) c[statKey]++
      if (a.outcome) c[a.outcome] = (c[a.outcome] ?? 0) + 1
      else c.active++
    })
    return c
  }, [applications])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(app) {
    setEditing(app)
    setModalOpen(true)
  }

  async function handleSave(fields) {
    setSaving(true)
    try {
      if (editing) {
        await updateApplication(editing.id, fields)
        announce(`Søknad hos ${fields.company} oppdatert`)
      } else {
        await addApplication(fields)
        announce(`Søknad hos ${fields.company} lagret`)
      }
      setModalOpen(false)
    } catch {
      announce('Kunne ikke lagre søknaden — prøv igjen')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteApplication(deleteTarget.id)
      announce(`Søknad hos ${deleteTarget.company} slettet`)
      setDeleteTarget(null)
    } catch {
      announce('Kunne ikke slette søknaden — prøv igjen')
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteAll() {
    try {
      await Promise.all(applications.map(app => deleteApplication(app.id)))
      await signOut()
    } catch {
      announce('Noe gikk galt under sletting — prøv igjen')
      setDeleteAllOpen(false)
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    try {
      const { error } = await supabase.functions.invoke('delete-account')
      if (error) throw error
      await signOut()
    } catch {
      announce('Kunne ikke slette kontoen — prøv igjen')
      setDeleteAccountOpen(false)
    } finally {
      setDeletingAccount(false)
    }
  }

  function exportData() {
    const json = JSON.stringify(applications, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `soknadsoversikt-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    announce('Data eksportert som JSON')
  }

  return (
    <>
      <StatusMessage liveRef={liveRef} />

      <a
        href="#main-content"
        className="absolute -top-full left-4 focus:top-3 z-50 bg-[#1E3A6B] text-white px-5 py-3 rounded-lg font-semibold text-sm no-underline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        Hopp til innhold
      </a>

      <header role="banner" className="sticky top-0 z-40">
        <nav className="bg-[#1E3A6B] flex items-center px-6 h-16 justify-between gap-6" aria-label="Appnavigasjon">
          <a
            href="/"
            className="flex items-center gap-2 text-white font-bold text-base shrink-0 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded"
            aria-label="soknadsoversikt.no — tilbake til forsiden"
          >
            <span aria-hidden="true">📋</span>
            soknadsoversikt.no
          </a>

          {/* Hamburger — mobil */}
          <button
            className="sm:hidden p-2 text-white rounded-lg hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            aria-expanded={menuOpen}
            aria-controls="app-nav-menu"
            aria-label={menuOpen ? 'Lukk meny' : 'Åpne meny'}
            onClick={() => setMenuOpen(o => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect y="3" width="22" height="2" rx="1" fill="currentColor"/>
              <rect y="10" width="22" height="2" rx="1" fill="currentColor"/>
              <rect y="17" width="22" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>

          {/* Desktop-tabs */}
          <div className="hidden sm:flex items-center gap-1 flex-1" role="tablist" aria-label="Seksjoner">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                  activeTab === tab.id
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop-knapper */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <span aria-hidden="true">🚪</span>
              Logg ut
            </button>
          </div>
        </nav>

        {/* Mobil-dropdown */}
        <div
          id="app-nav-menu"
          className={`${menuOpen ? 'flex' : 'hidden'} sm:hidden flex-col bg-white border-b border-[#E2E8F0] px-4 py-3 gap-1`}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => { setActiveTab(tab.id); setMenuOpen(false) }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 ${
                activeTab === tab.id
                  ? 'bg-[#EFF6FF] text-[#1E3A6B] font-semibold'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E3A6B]'
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <div className="border-t border-[#E2E8F0] mt-1 pt-1">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E3A6B] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              <span aria-hidden="true">🚪</span>
              Logg ut
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
        <ApplicationsPanel
          hidden={activeTab !== 'soknader'}
          counts={counts}
          applications={applications}
          loading={loading}
          error={error}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
        <StatisticsPanel
          hidden={activeTab !== 'statistikk'}
          counts={counts}
          applications={applications}
        />
        <SettingsPanel
          hidden={activeTab !== 'innstillinger'}
          session={session}
          onExport={exportData}
          onDeleteAll={() => setDeleteAllOpen(true)}
          onDeleteAccount={() => setDeleteAccountOpen(true)}
        />
      </main>

      {/* Modal: Legg til / Rediger søknad */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Rediger søknad' : 'Legg til søknad'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="h-10 px-5 border-[1.5px] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              Avbryt
            </button>
            <button
              onClick={() => document.getElementById('application-form')?.requestSubmit()}
              disabled={saving}
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              {saving ? 'Lagrer…' : 'Lagre søknad'}
            </button>
          </>
        }
      >
        <ApplicationForm
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          saving={saving}
        />
      </Modal>

      {/* Modal: Bekreft sletting */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Slett søknad?"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-10 px-5 border-[1.5px] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              Avbryt
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-10 px-5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#DC2626] focus-visible:outline-offset-2"
            >
              {deleting ? 'Sletter…' : 'Slett søknad'}
            </button>
          </>
        }
      >
        <p className="text-sm text-[#475569]">
          Er du sikker på at du vil slette søknaden hos <strong>{deleteTarget?.company}</strong>?
          Denne handlingen kan ikke angres.
        </p>
      </Modal>

      {/* Modal: Slett konto */}
      <Modal
        isOpen={deleteAccountOpen}
        onClose={() => !deletingAccount && setDeleteAccountOpen(false)}
        title="Slett konto permanent?"
        footer={
          <>
            <button
              onClick={() => setDeleteAccountOpen(false)}
              disabled={deletingAccount}
              className="h-10 px-5 border-[1.5px] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50 font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              Avbryt
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="h-10 px-5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#DC2626] focus-visible:outline-offset-2"
            >
              {deletingAccount ? 'Sletter konto…' : 'Ja, slett kontoen min'}
            </button>
          </>
        }
      >
        <p className="text-sm text-[#475569]">
          Dette sletter kontoen din og alle søknadene dine permanent. Du kan opprette en ny konto med samme e-postadresse senere. <strong>Handlingen kan ikke angres.</strong>
        </p>
      </Modal>

      {/* Modal: Slett alle data */}
      <Modal
        isOpen={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        title="Slett alle søknadsdata?"
        footer={
          <>
            <button
              onClick={() => setDeleteAllOpen(false)}
              className="h-10 px-5 border-[1.5px] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              Avbryt
            </button>
            <button
              onClick={handleDeleteAll}
              className="h-10 px-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#DC2626] focus-visible:outline-offset-2"
            >
              Slett alt og logg ut
            </button>
          </>
        }
      >
        <p className="text-sm text-[#475569]">
          Dette sletter alle søknadene dine og logger deg ut. Handlingen kan ikke angres.
          Last ned data først hvis du vil beholde en kopi.
        </p>
      </Modal>
    </>
  )
}
