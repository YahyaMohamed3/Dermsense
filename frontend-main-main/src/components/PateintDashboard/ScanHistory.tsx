import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, ArrowRight, X } from 'lucide-react';
import { getAuthToken } from '../../services/api';

interface ScanHistoryItem {
  id: number;
  lesion_id: number | null;
  image_url: string;
  predictions: { label: string; confidence: number }[];
  risk_level: 'low' | 'medium' | 'high' | 'unknown';
  submitted_at: string;
  ai_explanation?: string;
  heatmap_image_url?: string;
}

const formatDateTime = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString(undefined, { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const riskColors = {
  low: "bg-green-400/10 border-green-400/30 text-green-300",
  medium: "bg-yellow-400/10 border-yellow-400/30 text-yellow-300",
  high: "bg-red-400/10 border-red-400/30 text-red-300",
  unknown: "bg-slate-400/10 border-slate-400/30 text-slate-200"
};

function decodeImageUrl(src?: string) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('data:')) return src;
  if (src.startsWith('/9j/')) return `data:image/jpeg;base64,${src}`;
  if (src.startsWith('iVBOR')) return `data:image/png;base64,${src}`;
  return src;
}

export default function ScanHistory() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const res = await fetch('https://dermsense-1067130927657.us-central1.run.app/api/patient/scans/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch scan history');
        const data = await res.json();
        setScans(data || []);
      } catch (e) {
        setScans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">My Scans History</h2>
        <p className="mb-6 text-blue-100/80 text-base">
          All scans you’ve chosen to save to your history appear here. Tap <span className="font-semibold text-blue-200">View Details</span> for the full analysis.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader className="animate-spin text-blue-400 w-8 h-8" />
            </div>
          ) : (
            <AnimatePresence>
              {scans.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="col-span-full text-center text-blue-100/80 py-8 text-base"
                >
                  No saved scans in your history yet.
                </motion.div>
              )}
              {scans.map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  whileHover={{ y: -3, boxShadow: "0 6px 32px 0 rgba(59,130,246,0.12)" }}
                  className="relative group p-5 pb-14 rounded-2xl border border-white/15 shadow-xl bg-white/5 backdrop-blur-xl transition flex items-center gap-4 overflow-hidden"
                  style={{
                    background: "linear-gradient(120deg,rgba(40,50,80,0.28) 0%,rgba(59,130,246,0.07) 100%)",
                    boxShadow: "0 6px 40px 0 rgba(23,35,55,.10)"
                  }}
                >
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full border-2 border-blue-100/30 shadow flex items-center justify-center overflow-hidden">
                      <img
                        src={decodeImageUrl(scan.image_url)}
                        alt="Scan thumbnail"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="mt-2 text-xs text-blue-100/80 text-center font-mono">{formatDateTime(scan.submitted_at)}</div>
                  </div>
                  <div className="flex-1 min-w-0 pl-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-blue-50 text-lg truncate">
                        {scan.predictions?.[0]?.label || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-blue-200/90 text-sm flex flex-col">
                      <span className="font-semibold">{scan.predictions?.[1]?.label || ""}</span>
                      <span className="bg-blue-300/10 text-blue-100 px-2 py-0.5 rounded text-xs inline-block mt-1">
                        {scan.predictions?.[1]?.confidence ?? "--"}%
                      </span>
                    </div>
                  </div>
                  <button
                    className="ml-6 flex items-center bg-blue-600 hover:bg-blue-400/10 transition text-white-100 px-3 py-1.5 rounded-full text-sm font-semibold shadow border border-white/20 backdrop-blur absolute right-5 bottom-5 opacity-90 group-hover:opacity-100"
                    style={{ fontWeight: 600, letterSpacing: 0.5 }}
                    onClick={() => setSelectedScan(scan)}
                    type="button"
                  >
                    View Details
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.section>

      {/* === MODAL FOR VIEW DETAILS === */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="bg-slate-900/95 border border-slate-700 rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Scan Details</h3>
                <button onClick={() => setSelectedScan(null)} className="text-slate-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-base font-semibold text-white mb-2">Original Image</h4>
                  <img
                    src={decodeImageUrl(selectedScan.image_url)}
                    alt="Original"
                    className="rounded-xl aspect-square object-cover border border-slate-700 w-full"
                  />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white mb-2">AI Heatmap</h4>
                  {selectedScan.heatmap_image_url ? (
                    <img
                      src={decodeImageUrl(selectedScan.heatmap_image_url)}
                      alt="Heatmap"
                      className="rounded-xl aspect-square object-cover border border-slate-700 w-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-sm">
                      No heatmap available
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${riskColors[selectedScan.risk_level || 'unknown']}`}>
                    {selectedScan.risk_level?.charAt(0).toUpperCase() + selectedScan.risk_level?.slice(1) || 'Unknown'} Risk
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    {formatDateTime(selectedScan.submitted_at)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white/10 px-3 py-1 rounded-lg text-blue-100 font-medium text-sm">
                    Top 1: {selectedScan.predictions?.[0]?.label || 'N/A'} ({selectedScan.predictions?.[0]?.confidence ?? '--'}%)
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-lg text-blue-100 font-medium text-sm">
                    Top 2: {selectedScan.predictions?.[1]?.label || 'N/A'} ({selectedScan.predictions?.[1]?.confidence ?? '--'}%)
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                <h5 className="text-base font-semibold text-white mb-2">AI Explanation</h5>
                <p className="text-slate-200 whitespace-pre-line text-sm">{selectedScan.ai_explanation || "No explanation available."}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
