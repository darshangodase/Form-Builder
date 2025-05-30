import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface SaveIndicatorProps {
  isVisible: boolean;
  isSaving: boolean;
}

export default function SaveIndicator({ isVisible, isSaving }: SaveIndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
              isSaving
                ? "bg-blue-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>All changes saved</span>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 