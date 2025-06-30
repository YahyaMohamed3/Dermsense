import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowRight, Bot, Sparkles, ShieldCheck, ShieldAlert, History, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import LesionReview from '../components/PateintDashboard/lesionReview';
import ScanHistory from '../components/PateintDashboard/scanHistory';

interface Prediction {
    label: string;
    confidence: number;
}
interface Scan {
    id: number;
    submitted_at: string;
    image_url: string;
    heatmap_image_url: string;
    predictions: Prediction[];
    risk_level: 'low' | 'medium' | 'high';
}
interface Lesion {
    id: number;
    nickname: string;
    body_part: string;
    created_at: string;
    scan_count?: number;
    last_seen_at?: string;
    latest_image_url?: string;
}
interface ComparisonResult {
    change_summary: string;
    change_recommendation: string;
}

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const riskStyles: Record<string, string> = {
    low: "border-blue-500/50 bg-blue-900/20 text-blue-300",
    medium: "border-yellow-500/50 bg-yellow-900/20 text-yellow-300",
    high: "border-red-500/50 bg-red-900/20 text-red-300",
};

const RiskIcon = ({ risk_level }: { risk_level: 'low' | 'medium' | 'high' | undefined }) => {
    if (risk_level === 'high') return <ShieldAlert className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />;
    if (risk_level === 'medium') return <ShieldAlert className="w-5 h-5 mr-3 text-yellow-400 flex-shrink-0" />;
    return <ShieldCheck className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />;
};

const MyLesionsPage: React.FC = () => {
    const [lesions, setLesions] = useState<Lesion[]>([]);
    const [userName, setUserName] = useState<string>('there');
    const [isLoading, setIsLoading] = useState(true);

    const [isNewLesionModalOpen, setIsNewLesionModalOpen] = useState(false);
    const [newLesionNickname, setNewLesionNickname] = useState('');
    const [newLesionBodyPart, setNewLesionBodyPart] = useState('');

    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [selectedLesion, setSelectedLesion] = useState<Lesion | null>(null);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [scanHistory, setScanHistory] = useState<Scan[]>([]);

    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const profile = await api.getMyProfile();
            setUserName(profile.full_name || 'there');
            const fetchedLesions: Lesion[] = await api.getMyLesions();
            const lesionsWithScanData = await Promise.all(
                fetchedLesions.map(async (lesion) => {
                    const scans: Scan[] = await api.getLesionScans(lesion.id);
                    if (scans && scans.length > 0) {
                        return {
                            ...lesion,
                            scan_count: scans.length,
                            last_seen_at: scans[0].submitted_at,
                            latest_image_url: scans[0].image_url,
                        };
                    }
                    return { ...lesion, scan_count: 0 };
                })
            );
            setLesions(lesionsWithScanData);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load dashboard.");
            if (String(error).includes('Invalid or expired token')) {
                api.logout();
                navigate('/PateintLogIn');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        setIsLoading(true);
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleCreateLesion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLesionNickname || !newLesionBodyPart) {
            toast.error("Please provide both a nickname and body part.");
            return;
        }
        try {
            const newLesion = await api.createLesion({ nickname: newLesionNickname, body_part: newLesionBodyPart });
            toast.success(`Started tracking "${newLesion.nickname}"`);
            setIsNewLesionModalOpen(false);
            setNewLesionNickname('');
            setNewLesionBodyPart('');
            navigate('/scan', { state: { lesionId: newLesion.id } });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create lesion.");
        }
    };

    const handleDeleteLesion = async (lesion: Lesion) => {
        if (window.confirm(`Are you sure you want to delete "${lesion.nickname}" and all of its scans? This cannot be undone.`)) {
            try {
                await api.deleteLesion(lesion.id);
                setLesions(prev => prev.filter(l => l.id !== lesion.id));
                toast.success(`"${lesion.nickname}" was deleted.`);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to delete lesion.");
            }
        }
    };

    const handleAddNewScan = (lesionId: number) => {
        navigate('/scan', { state: { lesionId } });
    };

    const handleViewHistoryAndCompare = async (lesion: Lesion) => {
        setSelectedLesion(lesion);
        setIsComparisonModalOpen(true);
        setIsComparing(true);
        setComparisonResult(null);
        setScanHistory([]);
        try {
            const history = await api.getLesionScans(lesion.id);
            setScanHistory(history);
            if (history.length >= 2) {
                const comparison = await api.getLesionComparison(lesion.id);
                setComparisonResult(comparison);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not fetch comparison data.");
        } finally {
            setIsComparing(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>My Lesions | DermaSense</title>
            </Helmet>
            <div className="min-h-screen bg-slate-900 text-white pt-24 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* ==== WELCOME HEADER AT THE VERY TOP ==== */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow">
                            Welcome back, {userName}
                        </h1>
                        <p className="text-base sm:text-lg text-blue-200/80">
                            Your personal lesion tracking dashboard.
                        </p>
                    </motion.div>

                    {/* === MY SCANS SECTION HEADER === */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                        className="mb-2"
                    >
                        <div className="w-fit mb-4 px-5 py-2 bg-gradient-to-br from-blue-800/60 to-slate-900/60 backdrop-blur-md rounded-full shadow font-medium text-blue-200/90 border border-blue-900/70 flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-300" />
                            <span>My Scans Timeline</span>
                        </div>
                    </motion.div>

                    {/* === MODERN GLASSY "MY SCANS" SECTION AT TOP === */}
                    <div className="mb-12">
                        <ScanHistory />
                    </div>

                    {/* === LESIONS DASHBOARD HEADER === */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.17 }}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 md:gap-0">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Track a Lesion</h2>
                                <p className="text-base text-slate-400">Track, compare and monitor your skin lesions below.</p>
                            </div>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsNewLesionModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold shadow-lg transition-colors">
                                <Plus className="w-5 h-5" />
                                Track New Lesion
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* === MAIN DASHBOARD GRID (UNCHANGED) === */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        {isLoading && (
                            <div className="text-center py-20 text-slate-400 flex items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span>Loading your dashboard...</span>
                            </div>
                        )}

                        {!isLoading && lesions.length === 0 && (
                            <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-slate-700">
                                <h2 className="text-2xl font-bold text-white mb-2">Your journal is empty.</h2>
                                <p className="text-slate-400 mb-6">Start by tracking your first lesion to monitor its changes.</p>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsNewLesionModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold shadow-lg transition-colors mx-auto">
                                    <Plus className="w-5 h-5" />
                                    Track Your First Lesion
                                </motion.button>
                            </div>
                        )}

                        {!isLoading && lesions.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence>
                                    {lesions.map((lesion) => (
                                        <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={lesion.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col hover:border-blue-500/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{lesion.nickname}</h3>
                                                    <p className="text-sm text-slate-400">{lesion.body_part}</p>
                                                </div>
                                                <button onClick={() => handleDeleteLesion(lesion)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={lesion.latest_image_url || 'https://via.placeholder.com/80'} alt={lesion.nickname} className="w-20 h-20 rounded-full object-cover border-2 border-slate-600" />
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-2 text-slate-300"><History size={14} /><span>{lesion.scan_count || 0} Scans</span></div>
                                                    <div className="mt-2"><p className="text-xs text-slate-500">First Seen</p><p>{formatDate(lesion.created_at)}</p></div>
                                                    <div className="mt-1"><p className="text-xs text-slate-500">Last Seen</p><p>{formatDate(lesion.last_seen_at)}</p></div>
                                                </div>
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-slate-700 flex gap-3">
                                                <button onClick={() => handleAddNewScan(lesion.id)} className="bg-blue-600 hover:bg-blue-500 flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"> <Plus size={16} />Add Scan</button>
                                                <button onClick={() => handleViewHistoryAndCompare(lesion)} disabled={!lesion.scan_count || lesion.scan_count < 2} className="bg-purple-600 hover:bg-purple-500 flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"> <Sparkles size={16} />Compare</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                    {/* === GLASSY PROFESSIONAL REVIEW SECTION AT BOTTOM === */}
                    <div>
                        <LesionReview/>
                    </div>
                </div>
            </div>

            {/* New Lesion Modal */}
            <AnimatePresence>
                {isNewLesionModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsNewLesionModalOpen(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-white mb-6">Track a New Lesion</h3>
                            <form onSubmit={handleCreateLesion}>
                                <div className="space-y-4 mb-6">
                                    <div><label htmlFor="nickname" className="block text-sm font-medium text-slate-300 mb-1">Nickname</label><input type="text" id="nickname" value={newLesionNickname} onChange={(e) => setNewLesionNickname(e.target.value)} className="w-full p-2 rounded-md bg-slate-700" placeholder="e.g., Mole on my left arm" required /></div>
                                    <div><label htmlFor="bodyPart" className="block text-sm font-medium text-slate-300 mb-1">Body Part</label><input type="text" id="bodyPart" value={newLesionBodyPart} onChange={(e) => setNewLesionBodyPart(e.target.value)} className="w-full p-2 rounded-md bg-slate-700" placeholder="e.g., Upper left arm, near elbow" required /></div>
                                </div>
                                <div className="flex space-x-3"><button type="button" onClick={() => setIsNewLesionModalOpen(false)} className="bg-slate-600 w-full py-3 rounded-lg">Cancel</button><button type="submit" className="bg-blue-600 hover:bg-blue-500 w-full py-3 rounded-lg flex items-center justify-center gap-2">Start Tracking <ArrowRight size={16} /></button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comparison Modal */}
            <AnimatePresence>
                {isComparisonModalOpen && selectedLesion && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setIsComparisonModalOpen(false)}>
                        <motion.div layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="bg-slate-900/95 border border-slate-700 rounded-2xl w-full max-w-6xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6"><h3 className="text-3xl font-bold text-white">{selectedLesion.nickname}: <span className="text-blue-400">Evolution Analysis</span></h3><button onClick={() => setIsComparisonModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
                            {isComparing && (
                                <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-4">
                                   <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
                                   <p className='text-lg'>Our AI is comparing your scans...</p>
                                   <p className='text-sm text-slate-500'>This can take a moment as we analyze changes in color, border, and asymmetry.</p>
                               </div>
                            )}
                            {!isComparing && (scanHistory.length < 2 || !comparisonResult) && (
                                <div className="text-center py-20 text-slate-400">
                                    <h4 className="text-xl font-bold text-white mb-2">Not Enough Data</h4>
                                    <p>You need at least two scans to perform an AI comparison.</p>
                                </div>
                           )}
                           {!isComparing && scanHistory.length >= 2 && comparisonResult && (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        {[scanHistory[scanHistory.length - 2], scanHistory[scanHistory.length - 1]].map((scan, index) => (
                                            <div key={scan.id}>
                                                <h4 className="text-lg font-semibold text-white mb-3">{index === 0 ? "Previous Scan" : "Latest Scan"} <span className="text-sm text-slate-400 font-normal">({formatDate(scan.submitted_at)})</span></h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <img src={scan.image_url} alt="Original Scan" className="rounded-lg aspect-square object-cover border border-slate-600" />
                                                    <img src={scan.heatmap_image_url} alt="Heatmap" className="rounded-lg aspect-square object-cover border border-slate-600" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3"><Bot size={24} className="text-blue-400" />AI-Powered Change Analysis</h4>
                                        <p className="text-slate-300 mb-6">{comparisonResult.change_summary}</p>
                                        <div className={`flex items-start p-4 rounded-lg border ${riskStyles[scanHistory[scanHistory.length-1].risk_level]}`}>
                                            <RiskIcon risk_level={scanHistory[scanHistory.length-1].risk_level} />
                                            <div>
                                                <h5 className="font-semibold text-white mb-1">Recommendation</h5>
                                                <p className="text-sm">{comparisonResult.change_recommendation}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <h4 className="text-lg font-medium text-white mb-4">Full Scan History</h4>
                                        <div className="relative border-l-2 border-slate-700 ml-4 pl-8 space-y-8">
                                            {scanHistory.map((scan, index) => (
                                                <div key={scan.id} className="relative">
                                                    <div className="absolute -left-[38px] top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-700 rounded-full border-4 border-slate-900 flex items-center justify-center font-bold text-xs">{scanHistory.length - index}</div>
                                                    <p className="font-semibold text-white">{formatDate(scan.submitted_at)}</p>
                                                    <p className="text-sm text-slate-400">AI Finding: <span className="font-medium text-slate-300">{scan.predictions[0]?.label || 'N/A'}</span></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MyLesionsPage;
