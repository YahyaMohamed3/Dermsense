import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Filter, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '../lib/utils';

// --- TYPE DEFINITIONS (for TypeScript) ---
interface Case {
  id: number;
  created_at: string;
  prediction: string;
  confidence: number;
  status: 'new' | 'reviewed' | 'flagged';
  patient_id?: string;
  image_url?: string;
  heatmap_url?: string;
}

// --- DUMMY DATA (for immediate UI development) ---
const DUMMY_CASES: Case[] = [
  { 
    id: 101, 
    created_at: '2025-01-15T10:00:00Z', 
    prediction: 'Melanoma', 
    confidence: 0.81, 
    status: 'new',
    patient_id: 'PT-2025-001',
    image_url: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=300',
    heatmap_url: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  { 
    id: 102, 
    created_at: '2025-01-15T09:30:00Z', 
    prediction: 'Benign Mole', 
    confidence: 0.99, 
    status: 'new',
    patient_id: 'PT-2025-002',
    image_url: 'https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg?auto=compress&cs=tinysrgb&w=300',
    heatmap_url: 'https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  { 
    id: 103, 
    created_at: '2025-01-14T15:00:00Z', 
    prediction: 'Actinic Keratosis', 
    confidence: 0.92, 
    status: 'reviewed',
    patient_id: 'PT-2025-003',
    image_url: 'https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=300',
    heatmap_url: 'https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  { 
    id: 104, 
    created_at: '2025-01-14T11:00:00Z', 
    prediction: 'Basal Cell Carcinoma', 
    confidence: 0.95, 
    status: 'flagged',
    patient_id: 'PT-2025-004',
    image_url: 'https://images.pexels.com/photos/5726799/pexels-photo-5726799.jpeg?auto=compress&cs=tinysrgb&w=300',
    heatmap_url: 'https://images.pexels.com/photos/5726799/pexels-photo-5726799.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  { 
    id: 105, 
    created_at: '2025-01-14T08:45:00Z', 
    prediction: 'Seborrheic Keratosis', 
    confidence: 0.88, 
    status: 'new',
    patient_id: 'PT-2025-005',
    image_url: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=300',
    heatmap_url: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  { 
    id: 106, 
    created_at: '2025-01-13T16:20:00Z', 
    prediction: 'Dermatofibroma', 
    confidence: 0.76, 
    status: 'reviewed',
    patient_id: 'PT-2025-006',
    image_url: 'https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg?auto=compress&cs=tinysrgb&w=300',
    heatmap_url: 'https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

// --- STYLING (using Tailwind CSS) ---
const statusStyles = {
  new: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    text: 'text-primary-800 dark:text-primary-300',
    icon: Clock,
    label: 'New'
  },
  reviewed: {
    bg: 'bg-success-100 dark:bg-success-900/30',
    text: 'text-success-800 dark:text-success-300',
    icon: CheckCircle,
    label: 'Reviewed'
  },
  flagged: {
    bg: 'bg-warning-100 dark:bg-warning-900/30',
    text: 'text-warning-800 dark:text-warning-300',
    icon: AlertTriangle,
    label: 'Flagged'
  },
};

const riskLevelColors = {
  'Melanoma': 'text-error-600 dark:text-error-400',
  'Basal Cell Carcinoma': 'text-warning-600 dark:text-warning-400',
  'Actinic Keratosis': 'text-warning-600 dark:text-warning-400',
  'Benign Mole': 'text-success-600 dark:text-success-400',
  'Seborrheic Keratosis': 'text-primary-600 dark:text-primary-400',
  'Dermatofibroma': 'text-primary-600 dark:text-primary-400',
  'Vascular Lesion': 'text-primary-600 dark:text-primary-400'
};

// --- MAIN COMPONENT ---
const DashboardPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'flagged'>('all');
  const [expandedCase, setExpandedCase] = useState<number | null>(null);

  // --- DATA FETCHING (Using dummy data for now) ---
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setCases(DUMMY_CASES);
      setFilteredCases(DUMMY_CASES);
      setIsLoading(false);
    }, 1000);
  }, []);

  // --- FILTERING LOGIC ---
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(c => c.status === activeFilter));
    }
  }, [activeFilter, cases]);

  // --- STATISTICS ---
  const stats = {
    total: cases.length,
    new: cases.filter(c => c.status === 'new').length,
    reviewed: cases.filter(c => c.status === 'reviewed').length,
    flagged: cases.filter(c => c.status === 'flagged').length,
    highRisk: cases.filter(c => ['Melanoma', 'Basal Cell Carcinoma'].includes(c.prediction)).length
  };

  // --- CASE DETAIL VIEW (EXPANDED ROW) ---
  const handleCaseClick = (caseId: number) => {
    setExpandedCase(expandedCase === caseId ? null : caseId);
  };

  // --- UI RENDER ---
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
            <h1 className="text-4xl font-bold text-primary-600 dark:text-secondary-400 mb-2">
              Clinical Dashboard
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              AI-assisted dermatological case triage and review system
            </p>
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <motion.div 
              className="card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Cases</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Eye className="w-8 h-8 text-primary-600 dark:text-secondary-400" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            <motion.div 
              className="card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">New Cases</p>
                  <p className="text-2xl font-bold text-primary-600">{stats.new}</p>
                </div>
                <Clock className="w-8 h-8 text-primary-600" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            <motion.div 
              className="card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Reviewed</p>
                  <p className="text-2xl font-bold text-success-600">{stats.reviewed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-600" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            <motion.div 
              className="card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Flagged</p>
                  <p className="text-2xl font-bold text-warning-600">{stats.flagged}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-warning-600" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            <motion.div 
              className="card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">High Risk</p>
                  <p className="text-2xl font-bold text-error-600">{stats.highRisk}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-error-600" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primary-600 dark:bg-secondary-400 text-white dark:text-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Cases ({stats.total})
              </button>
              <button
                onClick={() => setActiveFilter('new')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'new'
                    ? 'bg-primary-600 dark:bg-secondary-400 text-white dark:text-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                New Cases ({stats.new})
              </button>
              <button
                onClick={() => setActiveFilter('flagged')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'flagged'
                    ? 'bg-warning-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Flagged ({stats.flagged})
              </button>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Case Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        AI Prediction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredCases.map((caseItem, index) => {
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
                            onClick={() => handleCaseClick(caseItem.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                                    src={caseItem.image_url}
                                    alt="Case thumbnail"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Case #{caseItem.id}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {caseItem.patient_id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${riskLevelColors[caseItem.prediction as keyof typeof riskLevelColors] || 'text-slate-900 dark:text-slate-100'}`}>
                                {caseItem.prediction}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                                  {(caseItem.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="ml-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-primary-600 dark:bg-secondary-400 h-2 rounded-full"
                                    style={{ width: `${caseItem.confidence * 100}%` }}
                                  ></div>
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
                                {formatDate(caseItem.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCaseClick(caseItem.id);
                                }}
                                className="text-primary-600 dark:text-secondary-400 hover:text-primary-900 dark:hover:text-secondary-300"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </button>
                            </td>
                          </motion.tr>
                          
                          {/* Expanded Case View */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                layout
                              >
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="glass-panel p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Original Image */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">Original Image</h3>
                                        <img
                                          src={caseItem.image_url}
                                          alt="Patient skin lesion"
                                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-md"
                                        />
                                      </div>
                                      
                                      {/* Grad-CAM Heatmap */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">AI Focus Area</h3>
                                        <img
                                          src={caseItem.heatmap_url}
                                          alt="AI analysis heatmap"
                                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-md"
                                        />
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                          Highlighted areas show where the AI focused during analysis
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Analysis Results */}
                                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                      <h3 className="text-lg font-semibold mb-3">AI Analysis Results</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">Primary Diagnosis</p>
                                          <p className={`text-lg font-semibold ${riskLevelColors[caseItem.prediction as keyof typeof riskLevelColors] || 'text-slate-800 dark:text-slate-200'}`}>
                                            {caseItem.prediction}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">Confidence Level</p>
                                          <p className="text-lg font-semibold">{(caseItem.confidence * 100).toFixed(1)}%</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">Risk Assessment</p>
                                          <p className={`text-lg font-semibold ${
                                            ['Melanoma', 'Basal Cell Carcinoma'].includes(caseItem.prediction) 
                                              ? 'text-error-600 dark:text-error-400' 
                                              : 'text-success-600 dark:text-success-400'
                                          }`}>
                                            {['Melanoma', 'Basal Cell Carcinoma'].includes(caseItem.prediction) ? 'High Risk' : 'Low Risk'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Clinical Notes */}
                                    <div className="mt-4">
                                      <h3 className="text-lg font-semibold mb-2">Clinical Notes</h3>
                                      <textarea
                                        className="w-full h-24 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Add your clinical observations and notes..."
                                      />
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="mt-4 flex gap-3">
                                      <button className="btn btn-primary">
                                        Mark as Reviewed
                                      </button>
                                      <button className="btn btn-outline border-warning-500 text-warning-600 hover:bg-warning-50 dark:border-warning-400 dark:text-warning-400 dark:hover:bg-warning-900/20">
                                        Flag for Follow-up
                                      </button>
                                      <button 
                                        className="btn btn-ghost"
                                        onClick={() => setExpandedCase(null)}
                                      >
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
    </>
  );
};

export default DashboardPage;