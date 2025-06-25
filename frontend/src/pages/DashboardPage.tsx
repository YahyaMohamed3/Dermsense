import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Eye, Filter, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    icon: Clock,
    label: 'New'
  },
  reviewed: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    icon: CheckCircle,
    label: 'Reviewed'
  },
  flagged: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    icon: AlertTriangle,
    label: 'Flagged'
  },
};

const riskLevelColors = {
  'Melanoma': 'text-red-600 dark:text-red-400',
  'Basal Cell Carcinoma': 'text-orange-600 dark:text-orange-400',
  'Actinic Keratosis': 'text-yellow-600 dark:text-yellow-400',
  'Benign Mole': 'text-green-600 dark:text-green-400',
  'Seborrheic Keratosis': 'text-blue-600 dark:text-blue-400',
  'Dermatofibroma': 'text-purple-600 dark:text-purple-400',
  'Vascular Lesion': 'text-pink-600 dark:text-pink-400'
};

// --- MAIN COMPONENT ---
const DashboardPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'flagged'>('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // --- DATA FETCHING (Using dummy data for now) ---
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setCases(DUMMY_CASES);
      setFilteredCases(DUMMY_CASES);
      setIsLoading(false);
    }, 1000);

    /*
    // UNCOMMENT THIS BLOCK TO USE YOUR LIVE API
    const fetchCases = async () => {
      try {
        setIsLoading(true);
        // IMPORTANT: Replace with your deployed backend URL
        const response = await axios.get('https://your-backend-url.com/get-cases');
        setCases(response.data);
        setFilteredCases(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch cases. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
    */
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

  // --- CASE DETAIL MODAL ---
  const CaseDetailModal = ({ caseItem, onClose }: { caseItem: Case; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Case #{caseItem.id}</h2>
              <p className="text-gray-600 dark:text-gray-300">Patient ID: {caseItem.patient_id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Original Image</h3>
              <img
                src={caseItem.image_url}
                alt="Patient skin lesion"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Grad-CAM Heatmap */}
            <div>
              <h3 className="text-lg font-semibold mb-3">AI Analysis (Grad-CAM)</h3>
              <img
                src={caseItem.heatmap_url}
                alt="AI analysis heatmap"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Highlighted areas show where the AI focused during analysis
              </p>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">AI Analysis Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Primary Diagnosis</p>
                <p className={`text-lg font-semibold ${riskLevelColors[caseItem.prediction as keyof typeof riskLevelColors] || 'text-gray-800 dark:text-gray-200'}`}>
                  {caseItem.prediction}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Confidence Level</p>
                <p className="text-lg font-semibold">{(caseItem.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Risk Assessment</p>
                <p className={`text-lg font-semibold ${
                  ['Melanoma', 'Basal Cell Carcinoma'].includes(caseItem.prediction) 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {['Melanoma', 'Basal Cell Carcinoma'].includes(caseItem.prediction) ? 'High Risk' : 'Low Risk'}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Clinical Notes</h3>
            <textarea
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Add your clinical observations and notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button className="btn btn-primary">
              Mark as Reviewed
            </button>
            <button className="btn btn-outline border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/20">
              Flag for Follow-up
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

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
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              Clinical Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              AI-assisted dermatological case triage and review system
            </p>
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Eye className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New Cases</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.reviewed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Flagged</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.flagged}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Cases ({stats.total})
              </button>
              <button
                onClick={() => setActiveFilter('new')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                New Cases ({stats.new})
              </button>
              <button
                onClick={() => setActiveFilter('flagged')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'flagged'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Flagged ({stats.flagged})
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3">Loading cases...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Case List Table */}
          {!isLoading && !error && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Case Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        AI Prediction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCases.map((caseItem, index) => {
                      const StatusIcon = statusStyles[caseItem.status].icon;
                      return (
                        <motion.tr
                          key={caseItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                  src={caseItem.image_url}
                                  alt="Case thumbnail"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Case #{caseItem.id}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {caseItem.patient_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${riskLevelColors[caseItem.prediction as keyof typeof riskLevelColors] || 'text-gray-900 dark:text-gray-100'}`}>
                              {caseItem.prediction}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                                {(caseItem.confidence * 100).toFixed(1)}%
                              </div>
                              <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${caseItem.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[caseItem.status].bg} ${statusStyles[caseItem.status].text}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusStyles[caseItem.status].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(caseItem.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedCase(caseItem)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              View Details
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredCases.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No cases found for the selected filter.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </>
  );
};

export default DashboardPage;