import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import {
  LogOut,
  User,
  Layers,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Loader2,
  Edit2,
  Save,
  Check,
} from 'lucide-react';

export const UserSettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    createWorkspace,
    updateActiveWorkspace,
  } = useWorkspace();

  // Create Workspace Form
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState<'PERSONAL' | 'SHARED'>('PERSONAL');
  const [newWsCurrency, setNewWsCurrency] = useState('INR');
  const [isSubmittingWs, setIsSubmittingWs] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit Active Workspace Form
  const [isEditingActiveWs, setIsEditingActiveWs] = useState(false);
  const [editWsName, setEditWsName] = useState('');
  const [editWsCurrency, setEditWsCurrency] = useState('INR');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeWorkspace) {
      setEditWsName(activeWorkspace.name);
      setEditWsCurrency(activeWorkspace.defaultCurrency || 'INR');
    }
  }, [activeWorkspace]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) {
      setErrorMsg('Workspace name is required');
      return;
    }

    setIsSubmittingWs(true);
    setErrorMsg(null);
    try {
      await createWorkspace(newWsName.trim(), newWsType, newWsCurrency);
      setNewWsName('');
      setIsCreatingWorkspace(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create workspace');
    } finally {
      setIsSubmittingWs(false);
    }
  };

  const handleUpdateActiveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWsName.trim()) return;

    setIsSavingEdit(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
    try {
      await updateActiveWorkspace({
        name: editWsName.trim(),
        defaultCurrency: editWsCurrency,
      });
      setSaveSuccessMsg('Workspace updated successfully!');
      setIsEditingActiveWs(false);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update workspace');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* User Profile Card */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-14 w-14 rounded-full border border-brand-500/30 object-cover shadow"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
            <User size={28} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white truncate">{user?.name || 'User'}</h4>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={10} /> Active
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
            <Mail size={12} className="text-slate-500" />
            {user?.email}
          </p>
        </div>
      </div>

      {/* Active Workspace Settings / Currency Modifier */}
      {activeWorkspace && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600/20 text-brand-400 text-xs font-bold">
                {activeWorkspace.defaultCurrency || 'INR'}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Active Workspace Currency
                </h4>
                <p className="text-[11px] text-slate-400">{activeWorkspace.name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingActiveWs(!isEditingActiveWs)}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              <Edit2 size={12} />
              {isEditingActiveWs ? 'Cancel' : 'Edit Currency'}
            </button>
          </div>

          {saveSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-400">
              <Check size={14} /> {saveSuccessMsg}
            </div>
          )}

          {isEditingActiveWs ? (
            <form onSubmit={handleUpdateActiveWorkspace} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={editWsName}
                  onChange={(e) => setEditWsName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Default Currency
                </label>
                <select
                  value={editWsCurrency}
                  onChange={(e) => setEditWsCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none font-medium"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="SGD">SGD ($) - Singapore Dollar</option>
                  <option value="AED">AED (د.إ) - UAE Dirham</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSavingEdit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2 text-xs font-bold text-white hover:bg-brand-500 disabled:opacity-50 transition"
              >
                {isSavingEdit ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800/60 px-3 py-2 text-xs">
              <span className="text-slate-400">Current Base Currency</span>
              <span className="font-bold text-brand-400 font-mono">
                {activeWorkspace.defaultCurrency || 'USD'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Workspaces Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-brand-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Switch Workspace ({workspaces.length})
            </h4>
          </div>
          <button
            onClick={() => setIsCreatingWorkspace(!isCreatingWorkspace)}
            className="inline-flex items-center gap-1 rounded-xl bg-brand-600/20 border border-brand-500/30 px-2.5 py-1 text-xs font-semibold text-brand-300 hover:bg-brand-600/30 transition"
          >
            <Plus size={14} />
            {isCreatingWorkspace ? 'Cancel' : 'New Workspace'}
          </button>
        </div>

        {/* Create Workspace Inline Form */}
        {isCreatingWorkspace && (
          <form
            onSubmit={handleCreateWorkspace}
            className="space-y-3 rounded-2xl border border-brand-500/30 bg-slate-950/90 p-4 animate-in fade-in"
          >
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Create New Workspace
            </h5>

            {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                placeholder="e.g. Personal Finances, House Expenses"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Type</label>
                <select
                  value={newWsType}
                  onChange={(e) => setNewWsType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="PERSONAL">Personal</option>
                  <option value="SHARED">Shared (Group)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Currency
                </label>
                <select
                  value={newWsCurrency}
                  onChange={(e) => setNewWsCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="SGD">SGD ($)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingWs}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2 text-xs font-bold text-white hover:bg-brand-500 disabled:opacity-50 transition"
            >
              {isSubmittingWs ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Create & Switch'
              )}
            </button>
          </form>
        )}

        {/* Workspace List */}
        <div className="space-y-2">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            return (
              <div
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition ${
                  isActive
                    ? 'border-brand-500 bg-brand-950/20 shadow-md'
                    : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                      isActive ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">{ws.name}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{ws.type}</span>
                      <span>&bull;</span>
                      <span className="font-mono font-bold text-brand-400">
                        {ws.defaultCurrency}
                      </span>
                      {ws.role && (
                        <>
                          <span>&bull;</span>
                          <span className="text-brand-400 font-semibold">{ws.role}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {isActive && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-brand-400">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 py-3 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
        >
          <LogOut size={16} />
          Sign Out of DeriveCount
        </button>
      </div>
    </div>
  );
};
