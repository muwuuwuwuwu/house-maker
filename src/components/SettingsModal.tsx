import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Globe, 
  Building2, 
  Calendar, 
  Wallet,
  FileJson
} from 'lucide-react';
import { ProjectSettings, Language } from '../types';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/calculations';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSettings;
  onSaveProject: (project: ProjectSettings) => void;
  onReloadSampleData: () => void;
  onClearToFresh: () => void;
  onDataImported: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProject,
  onReloadSampleData,
  onClearToFresh,
  onDataImported,
}) => {
  const t = translations[project.language];
  const isUrdu = project.language === 'ur';

  const [name, setName] = useState(project.name);
  const [location, setLocation] = useState(project.location || '');
  const [totalBudget, setTotalBudget] = useState(String(project.totalBudget));
  const [startDate, setStartDate] = useState(project.startDate);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(project.expectedCompletionDate || '');
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(String(project.budgetAlertThreshold || 85));
  const [language, setLanguage] = useState<Language>(project.language);

  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProjectSettings = {
      ...project,
      name: name.trim() || 'My House Project',
      location: location.trim() || undefined,
      totalBudget: Math.max(0, parseFloat(totalBudget) || 0),
      startDate,
      expectedCompletionDate: expectedCompletionDate || undefined,
      budgetAlertThreshold: Math.max(50, Math.min(100, parseInt(budgetAlertThreshold) || 85)),
      language,
    };
    onSaveProject(updated);
    onClose();
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ghar_Hisab_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const success = importBackupJSON(text);
        if (success) {
          setImportStatus('Backup restored successfully!');
          onDataImported();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Error: Invalid backup file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Header */}
        <div className="bg-[#143d2b] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-300" />
            <h2 id="settings-modal-title" className="text-base sm:text-lg font-bold">
              {t.settings}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-emerald-200 hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {importStatus && (
          <div className={`p-3 mx-5 mt-4 rounded-xl text-xs flex items-center gap-2 ${
            importStatus.includes('Error') ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.projectName} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.projectNamePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.projectLocation}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          {/* Overall Construction Budget */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.totalBudget} (PKR) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-500">
                Rs.
              </span>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-extrabold text-stone-900"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isUrdu ? 'بجٹ تبدیل کرنے سے پرانے درج شدہ اخراجات متاثر نہیں ہوں گے۔' : 'Changing the budget updates limits without modifying past expense records.'}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.startDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.targetDate}
              </label>
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.languageOption}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  language === 'en'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                English (Default)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition font-urdu ${
                  language === 'ur'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                اردو (Urdu)
              </button>
            </div>
          </div>

          {/* Budget Warning Threshold */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isUrdu ? 'بجٹ الرٹ حد (فیصد)' : 'Budget Warning Alert Threshold (%)'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={budgetAlertThreshold}
                onChange={(e) => setBudgetAlertThreshold(e.target.value)}
                className="flex-1 accent-emerald-700"
              />
              <span className="font-bold text-xs bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                {budgetAlertThreshold}%
              </span>
            </div>
          </div>

          {/* Data Backup & Restore Section */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              {isUrdu ? 'ڈیٹا بیک اپ و بحالی' : 'Data Backup & Restore'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.backupData}</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{t.restoreData}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Sample Data & Reset Project Section */}
          <div className="pt-2 border-t border-stone-200 space-y-2">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              {t.sampleData}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(isUrdu ? 'کیا آپ نمونہ ڈیٹا دوبارہ لوڈ کرنا چاہتے ہیں؟' : 'Reload sample house construction records?')) {
                    onReloadSampleData();
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition"
              >
                {t.loadSampleData}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(isUrdu ? 'کیا آپ تمام ڈیٹا صاف کر کے نیا صاف پروجیکٹ شروع کرنا چاہتے ہیں؟' : 'Clear all data to start fresh real house project?')) {
                    onClearToFresh();
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition"
              >
                {t.clearToReal}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
            >
              {t.saveSettings}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
