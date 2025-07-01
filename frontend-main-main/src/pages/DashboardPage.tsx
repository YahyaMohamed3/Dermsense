import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Filter, Calendar, AlertTriangle, CheckCircle, Clock, Save, Loader, X } from 'lucide-react';

// --- Helper Utility ---
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// --- TYPE DEFINITIONS ---
// FIX: Update the Case interface to match the actual API response from the database.
interface Case {
  id: number;
  submitted_at: string;
  predictions: { label: string; confidence: number }[]; // Expect a 'predictions' array
  status: 'new' | 'reviewed' | 'flagged';
  profiles?: { full_name?: string };
  patient_id?: string;
  image_url?: string;
  heatmap_image_url?: string;
  notes?: string;
}

const statusOptions: Array<{ value: Case['status']; label: string; icon: React.ElementType; color: string }> = [
  { value: 'new', label: 'New', icon: Clock, color: 'text-primary-600' },
  { value: 'reviewed', label: 'Reviewed', icon: CheckCircle, color: 'text-success-600' },
  { value: 'flagged', label: 'Flagged', icon: AlertTriangle, color: 'text-warning-600' }
];

const statusStyles = {
  new: { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-800 dark:text-primary-300', icon: Clock, label: 'New' },
  reviewed: { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success-800 dark:text-success-300', icon: CheckCircle, label: 'Reviewed' },
  flagged: { bg: 'bg-warning-100 dark:bg-warning-900/30', text: 'text-warning-800 dark:text-warning-300', icon: AlertTriangle, label: 'Flagged' }
};

const riskLevelColors = {
  'Melanoma': 'text-error-600 dark:text-error-400', 'Basal Cell Carcinoma': 'text-warning-600 dark:text-warning-400', 'Actinic Keratosis': 'text-warning-600 dark:text-warning-400',
  'Benign Mole': 'text-success-600 dark:text-success-400', 'Seborrheic Keratosis': 'text-primary-600 dark:text-primary-400', 'Dermatofibroma': 'text-primary-600 dark:text-primary-400',
  'Vascular Lesion': 'text-primary-600 dark:text-primary-400'
};

// --- MAIN COMPONENT ---
const DashboardPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'reviewed' | 'flagged'>('all');
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState<Case['status']>('new');
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Modal for viewing images
  const [modal, setModal] = useState<{ open: boolean; url: string; label: string } | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://dermsense-1067130927657.us-central1.run.app/api/cases');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to fetch clinical cases.');
        }
        const data: Case[] = await response.json();
        setCases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(c => c.status === activeFilter));
    }
  }, [activeFilter, cases]);

  // Status and note editing logic
  const handleCaseClick = (caseItem: Case) => {
    if (expandedCase === caseItem.id) {
      setExpandedCase(null);
      setCurrentNotes('');
      setCurrentStatus('new');
    } else {
      setExpandedCase(caseItem.id);
      setCurrentNotes(caseItem.notes || '');
      setCurrentStatus(caseItem.status);
    }
  };

  // Update case (status/notes)
  const handleUpdateCase = async (caseId: number) => {
    setIsUpdating(caseId);
    try {
      const response = await fetch(`https://dermsense-1067130927657.us-central1.run.app/api/cases/${caseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus, notes: currentNotes })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to update case status.');
      }
      const updatedCaseResponse = await response.json();
      const updatedCase: Case = updatedCaseResponse.updatedCase;
      setCases(prevCases =>
        prevCases.map(c => c.id === caseId ? updatedCase : c)
      );
      setExpandedCase(null);
    } catch (err) {
      alert(`Error updating case: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Modal logic
  useEffect(() => {
    if (modal?.open) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setModal(null);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [modal]);

  // FIX: Update stats calculation to use the correct data structure.
  const stats = {
    total: cases.length,
    new: cases.filter(c => c.status === 'new').length,
    reviewed: cases.filter(c => c.status === 'reviewed').length,
    flagged: cases.filter(c => c.status === 'flagged').length,
    highRisk: cases.filter(c => {
      const topLabel = c.predictions?.[0]?.label;
      return topLabel && ['Melanoma', 'Basal Cell Carcinoma'].includes(topLabel);
    }).length
  };

  return (
    <>
      <Helmet>
        <title>Clinical Dashboard | DermaSense</title>
        <meta name="description" content="Professional dermatologist dashboard for AI-assisted case triage and review" />
      </Helmet>

      <div className="container pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-500 dark:to-secondary-400 text-transparent bg-clip-text mb-2">
              Clinical Dashboard
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              AI-assisted dermatological case triage and review system
            </p>
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <motion.div className="card p-4 hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -5 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Cases</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary-600 dark:text-secondary-400" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
            <motion.div className="card p-4 hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -5 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">New Cases</p>
                  <p className="text-2xl font-bold text-primary-600">{stats.new}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-600" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
            <motion.div className="card p-4 hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -5 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Reviewed</p>
                  <p className="text-2xl font-bold text-success-600">{stats.reviewed}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success-600" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
            <motion.div className="card p-4 hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ y: -5 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Flagged</p>
                  <p className="text-2xl font-bold text-warning-600">{stats.flagged}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning-600" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
            <motion.div className="card p-4 hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileHover={{ y: -5 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">High Risk</p>
                  <p className="text-2xl font-bold text-error-600">{stats.highRisk}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-error-600" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filter Buttons and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-primary-600 dark:bg-secondary-400 text-white dark:text-black shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Cases ({stats.total})
                </button>
                <button
                  onClick={() => setActiveFilter('new')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'new'
                      ? 'bg-primary-600 dark:bg-secondary-400 text-white dark:text-black shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  New Cases ({stats.new})
                </button>
                <button
                  onClick={() => setActiveFilter('reviewed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    activeFilter === 'reviewed'
                      ? 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-success-50 dark:hover:bg-success-900/20'
                  }`}
                >
                  Reviewed ({stats.reviewed})
                </button>
                <button
                  onClick={() => setActiveFilter('flagged')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'flagged'
                      ? 'bg-warning-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Flagged ({stats.flagged})
                </button>
              </div>
            </div>
          </div>

          {/* Loading and Error States */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-secondary-400"></div>
              <span className="ml-3">Loading cases...</span>
            </div>
          )}
          {error && (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4 mb-6">
              <p className="text-error-800 dark:text-error-400">{error}</p>
            </div>
          )}

          {/* Case List Table */}
          {!isLoading && !error && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Prediction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confidence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredCases.map((caseItem, index) => {
                      // FIX: Safely access the top prediction from the 'predictions' array.
                      const topPrediction = caseItem.predictions?.[0] || { label: 'N/A', confidence: 0 };
                      const StatusIcon = statusStyles[caseItem.status].icon;
                      const isExpanded = expandedCase === caseItem.id;
                      return (
                        <React.Fragment key={caseItem.id}>
                          <motion.tr
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                            onClick={() => handleCaseClick(caseItem)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <img className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm" src={caseItem.image_url} alt="Case thumbnail" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Case #{caseItem.id}</div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">{caseItem.profiles?.full_name || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {/* FIX: Use the safely accessed topPrediction object */}
                              <span className={`text-sm font-medium ${riskLevelColors[topPrediction.label as keyof typeof riskLevelColors] || 'text-slate-900 dark:text-slate-100'}`}>{topPrediction.label}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* FIX: Use the safely accessed topPrediction object */}
                                <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{topPrediction.confidence.toFixed(1)}%</div>
                                <div className="ml-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div className="bg-primary-600 dark:bg-secondary-400 h-2 rounded-full" style={{ width: `${topPrediction.confidence}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[caseItem.status].bg} ${statusStyles[caseItem.status].text}`}>
                                <StatusIcon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                                {statusStyles[caseItem.status].label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                {formatDate(caseItem.submitted_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCaseClick(caseItem);
                                }}
                                className="text-primary-600 dark:text-secondary-400 hover:text-primary-900 dark:hover:text-secondary-300 px-3 py-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </button>
                            </td>
                          </motion.tr>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <td colSpan={6} className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                                  <div className="p-6 rounded-xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3">Original Image</h3>
                                        <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 shadow-md group">
                                          <img src={caseItem.image_url} alt="Patient skin lesion" className="w-full h-64 object-cover" />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                            <button
                                              className="btn btn-sm btn-primary"
                                              onClick={e => { e.stopPropagation(); setModal({ open: true, url: caseItem.image_url || '', label: 'Original Lesion Image' }); }}>
                                              View Full Size
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3">AI Focus Area (Heatmap)</h3>
                                        <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 shadow-md group">
                                          <img src={caseItem.heatmap_image_url} alt="AI analysis heatmap" className="w-full h-64 object-cover" />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                            <button
                                              className="btn btn-sm btn-primary"
                                              onClick={e => { e.stopPropagation(); setModal({ open: true, url: caseItem.heatmap_image_url || '', label: 'AI Heatmap' }); }}>
                                              View Full Size
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-6">
                                      <h3 className="text-lg font-semibold mb-3">Clinical Notes</h3>
                                      <textarea
                                        value={currentNotes}
                                        onChange={e => setCurrentNotes(e.target.value)}
                                        className="w-full h-24 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Add your clinical observations and diagnosis..."
                                      />
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3 items-center">
                                      <label className="mr-2 font-medium text-slate-600 dark:text-slate-300">Status:</label>
                                      <select
                                        value={currentStatus}
                                        onChange={e => setCurrentStatus(e.target.value as Case['status'])}
                                        className="rounded-lg border px-3 py-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-600"
                                      >
                                        {statusOptions.map(option =>
                                          <option key={option.value} value={option.value}>{option.label}</option>
                                        )}
                                      </select>
                                      <button
                                        onClick={() => handleUpdateCase(caseItem.id)}
                                        disabled={isUpdating === caseItem.id}
                                        className="btn btn-success px-4 py-2"
                                      >
                                        {isUpdating === caseItem.id
                                          ? <Loader className="w-4 h-4 mr-2 animate-spin" />
                                          : <Save className="w-4 h-4 mr-2" />}
                                        Save Changes
                                      </button>
                                      <button className="btn btn-ghost ml-auto" onClick={() => setExpandedCase(null)}>
                                        Close
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredCases.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">No cases found for the selected filter.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Full Size Image Modal */}
      <AnimatePresence>
        {modal?.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 relative max-w-full max-h-full flex flex-col items-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                onClick={() => setModal(null)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="mb-4 text-xl font-semibold">{modal.label}</h3>
              <img src={modal.url} alt={modal.label} className="rounded-lg max-h-[75vh] max-w-full object-contain shadow" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardPage;