import React, { useState } from 'react';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Download,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const DataManagementView: React.FC = () => {
  const {
    datasets,
    activeDataset,
    activeDatasetId,
    setActiveDatasetId,
    uploadDataset,
    deleteDataset,
    cleanActiveDataset,
    showToast,
  } = useFinancial();

  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const name = datasetName.trim() || file.name.replace(/\.[^/.]+$/, '');
    const company = companyName.trim() || activeDataset.companyName || 'Enterprise Corp';
    const success = await uploadDataset(file, name, company);
    if (success) {
      setDatasetName('');
      setCompanyName('');
    }
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadCleanedCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Category', 'Type', 'Amount', 'Account', 'Status'];
    const rows = activeDataset.transactions.map(t => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.type,
      t.amount,
      `"${t.account}"`,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cleaned-${activeDataset.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Cleaned dataset downloaded (${activeDataset.transactions.length} rows).`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Financial Dataset Ingestion & Automated Cleaning Engine
            </h2>
          </div>
          <p className="text-xs text-[#8B9AA8] mt-1">
            Upload CSV/XLSX ledgers with automated column mapping, deduplication, timestamp normalization, and forensic audit logging.
          </p>
        </div>

        <button
          onClick={cleanActiveDataset}
          className="px-4 py-2.5 rounded-xl bg-[#153C43] hover:bg-[#153C43]/80 text-[#42D6C0] border border-[#42D6C0]/30 font-semibold text-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Re-Run Data Cleaning Audit</span>
        </button>
      </div>

      {/* Drag and Drop Upload Zone */}
      <div
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? 'border-[#42D6C0] bg-[#153C43]/30 scale-[1.01]'
            : 'border-[#42D6C0]/30 bg-[#132232]/80 hover:border-[#42D6C0]/60'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#153C43] border border-[#42D6C0]/30 flex items-center justify-center text-[#42D6C0] shadow-lg shadow-[#42D6C0]/10">
            {isUploading ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              {isUploading ? 'Ingesting and Sanitizing Ledger...' : 'Drag and Drop CSV or XLSX Dataset'}
            </h3>
            <p className="text-xs text-[#8B9AA8] mt-1">
              Supports QuickBooks, Stripe, Xero, NetSuite, Excel financial statements, or custom CSV exports.
            </p>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <div>
              <label className="text-[10px] text-[#8B9AA8] font-semibold block mb-1">
                Dataset Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Financial Ledger"
                value={datasetName}
                onChange={e => setDatasetName(e.target.value)}
                className="w-full bg-[#101D2B] text-xs text-white px-3 py-2 rounded-lg border border-[#42D6C0]/20 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8B9AA8] font-semibold block mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Tech Inc."
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-[#101D2B] text-xs text-white px-3 py-2 rounded-lg border border-[#42D6C0]/20 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] text-xs font-bold cursor-pointer hover:opacity-95 shadow-md shadow-[#42D6C0]/20 transition-all">
              <FolderOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Browse Local Files</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                disabled={isUploading}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Active Dataset Inspection & Cleaning Logs Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cleaning Audit Trail */}
        <div className="lg:col-span-2 bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#42D6C0]/15">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#42D6C0]" />
                <span>Forensic Cleaning Log & Audit Trail</span>
              </h3>
              <p className="text-xs text-[#8B9AA8]">
                Deterministic data modifications executed on <strong>{activeDataset.name}</strong>
              </p>
            </div>
            <button
              onClick={handleDownloadCleanedCSV}
              className="px-3 py-1.5 rounded-lg bg-[#101D2B] text-[#42D6C0] border border-[#42D6C0]/30 hover:border-[#42D6C0] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Cleaned CSV</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#101D2B] border border-[#42D6C0]/10">
              <span className="text-[10px] text-[#8B9AA8] uppercase font-semibold block">Validated Rows</span>
              <span className="text-lg font-mono font-bold text-[#42D6C0] mt-1 block">
                {activeDataset.validRowCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#101D2B] border border-[#42D6C0]/10">
              <span className="text-[10px] text-[#8B9AA8] uppercase font-semibold block">Duplicates Removed</span>
              <span className="text-lg font-mono font-bold text-[#F43F5E] mt-1 block">
                {activeDataset.duplicatesRemoved}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#101D2B] border border-[#42D6C0]/10">
              <span className="text-[10px] text-[#8B9AA8] uppercase font-semibold block">Missing Values Fixed</span>
              <span className="text-lg font-mono font-bold text-[#D4B36A] mt-1 block">
                {activeDataset.missingValuesFixed}
              </span>
            </div>
          </div>

          {/* Cleaning Logs List */}
          <div className="space-y-2.5 pt-2">
            {(!activeDataset.cleaningLogs || activeDataset.cleaningLogs.length === 0) ? (
              <div className="text-center py-6 text-xs text-[#8B9AA8]">
                No anomalies or data cleaning operations recorded for this dataset.
              </div>
            ) : (
              activeDataset.cleaningLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#101D2B] border border-[#42D6C0]/15 flex items-start gap-3 text-xs"
                >
                  {log.severity === 'resolved' && (
                    <CheckCircle2 className="w-4 h-4 text-[#42D6C0] shrink-0 mt-0.5" />
                  )}
                  {log.severity === 'info' && (
                    <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                  )}
                  {log.severity === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-[#D4B36A] shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span className="uppercase tracking-wider text-[10px] text-[#42D6C0]">
                        {log.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-[#8B9AA8] font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#8B9AA8] mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Dataset Switcher & History */}
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Dataset Library ({datasets.length})
            </h3>
            <p className="text-xs text-[#8B9AA8]">
              Switch active financial ledgers or remove redundant datasets
            </p>
          </div>

          <div className="space-y-2.5">
            {datasets.map(ds => {
              const isActive = ds.id === activeDatasetId;
              return (
                <div
                  key={ds.id}
                  onClick={() => setActiveDatasetId(ds.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#153C43]/60 border-[#42D6C0] shadow-md shadow-[#42D6C0]/10'
                      : 'bg-[#101D2B] border-[#42D6C0]/15 hover:border-[#42D6C0]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">
                      {ds.name}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#42D6C0] text-[#101D2B]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#8B9AA8] mt-1">
                    {ds.companyName} • {ds.transactions.length} rows ({ds.currency})
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#42D6C0]/10 text-[10px]">
                    <span className="text-[#8B9AA8]">
                      Uploaded: {new Date(ds.uploadedAt).toLocaleDateString()}
                    </span>
                    {datasets.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`Delete dataset "${ds.name}"?`)) {
                            deleteDataset(ds.id);
                          }
                        }}
                        className="text-[#F43F5E] hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
