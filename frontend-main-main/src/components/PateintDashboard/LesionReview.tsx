import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Flag, StickyNote, Loader, Calendar } from "lucide-react";
import { getAuthToken } from '../../services/api';

interface ProfessionalReviewItem {
  id: string;
  imageUrl: string;
  lesionName: string;
  top1: string;
  submittedOn: string;
  status: "pending" | "reviewed" | "flagged" | string;
  doctorNotes?: string;
}

const statusStyles = {
  pending: "text-indigo-100 border-indigo-300 bg-indigo-700",
  reviewed: "text-blue-100 border-blue-300 bg-blue-700",
  flagged: "text-rose-100 border-rose-300 bg-rose-700",
};

const statusIcons = {
  pending: <Loader className="w-4 h-4 animate-spin text-indigo-100" aria-hidden />,
  reviewed: <ShieldCheck className="w-4 h-4 text-blue-100" aria-hidden />,
  flagged: <Flag className="w-4 h-4 text-rose-100" aria-hidden />,
};

function getStatus(status: string) {
  if (status === "reviewed" || status === "flagged" || status === "pending") {
    return status;
  }
  return "pending";
}

export default function LesionReview() {
  const [reviews, setReviews] = useState<ProfessionalReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/patient/reviews", {
      headers: {
        "Authorization": `Bearer ${getAuthToken() || ""}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped: ProfessionalReviewItem[] = data.map((item: any) => ({
          id: item.id,
          imageUrl: item.image_url,
          lesionName: (item.predictions && item.predictions[0]?.label) || "Untitled Lesion",
          top1: item.predictions && item.predictions[0] ? item.predictions[0].label : "Unknown",
          submittedOn: item.submitted_at,
          status: getStatus(item.status),
          doctorNotes: item.doctor_notes || undefined,
        }));
        setReviews(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-25 mt-7"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="mb-1 flex items-center gap-2"
      >
        <ShieldCheck className="w-8 h-8 text-blue-300" aria-hidden />
        <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Professional Reviews
        </span>
      </motion.div>
      <p className="text-base md:text-lg text-blue-100/85 mb-7">
        Cases you’ve submitted for doctor review will appear here. You can monitor their progress and notes below.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-start">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader className="w-9 h-9 animate-spin text-blue-300" aria-hidden />
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="col-span-full text-center text-blue-100/80 py-9 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-xl text-lg"
          >
            No professional reviews yet.
          </motion.div>
        ) : (
          <AnimatePresence>
            {reviews.map((item) => {
              const displayStatus = getStatus(item.status);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 22, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  whileHover={{
                    boxShadow: "0 0 0 3px rgba(59,130,246,0.12), 0 8px 24px 0 rgba(40,64,105,0.15)",
                    borderColor: "#60a5fa",
                  }}
                  className="flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl shadow min-h-[148px] relative overflow-hidden transition-all duration-200 group"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  {/* Lesion image */}
                  <motion.div
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    className="flex-shrink-0 w-14 h-14 rounded-xl border border-white/15 bg-white/10 overflow-hidden"
                  >
                    <img
                      src={item.imageUrl}
                      alt={`Lesion: ${item.lesionName}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </motion.div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base md:text-lg font-semibold text-blue-50 truncate">{item.lesionName}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-sm md:text-base px-2 py-0.5 rounded-full border font-medium ${statusStyles[displayStatus]} transition`}
                      >
                        {statusIcons[displayStatus]} {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100 mt-1 text-sm md:text-base">
                      <Calendar className="w-5 h-5" aria-hidden />
                      {new Date(item.submittedOn).toLocaleString(undefined, { year: "2-digit", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="mt-0.5 text-sm md:text-base">
                      <span className="font-medium text-white-100">Prediction:</span>
                      <span className="ml-1 text-white-300 font-semibold">{item.top1}</span>
                    </div>
                    {item.doctorNotes && (
                      <motion.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.07, duration: 0.22, type: "tween" }}
                        className="mt-2 flex items-start gap-2 bg-white/10 p-2 rounded-lg border border-blue-900/20 shadow-inner text-sm md:text-base"
                      >
                        <StickyNote className="w-5 h-5 text-blue-300 mt-1" aria-hidden />
                        <span className="text-white-50">{item.doctorNotes}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.section>
  );
}
