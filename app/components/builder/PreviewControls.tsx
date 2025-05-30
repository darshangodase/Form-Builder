import { ComputerDesktopIcon, DevicePhoneMobileIcon, DeviceTabletIcon, EyeIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, ShareIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

type PreviewMode = "desktop" | "tablet" | "mobile";

interface PreviewControlsProps {
  currentMode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  isPreviewMode: boolean;
  onPreviewToggle: () => void;
  totalFields?: number;
  completedFields?: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onShare: () => void;
}

export default function PreviewControls({
  currentMode,
  onModeChange,
  isPreviewMode,
  onPreviewToggle,
  totalFields = 0,
  completedFields = 0,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onShare
}: PreviewControlsProps) {
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Preview Mode Controls */}
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1 mr-2">
          <motion.button
            onClick={onUndo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all duration-200 ${
              canUndo
                ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
            title="Undo (Ctrl+Z)"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={onRedo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all duration-200 ${
              canRedo
                ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <ArrowUturnRightIcon className="w-5 h-5" />
          </motion.button>
        </div>

        <motion.button
          onClick={onPreviewToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium ${
            isPreviewMode
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
          title={isPreviewMode ? "Exit Preview" : "Preview Form"}
        >
          <EyeIcon className={`w-5 h-5 transition-transform duration-200 ${isPreviewMode ? "rotate-12" : ""}`} />
          <span>{isPreviewMode ? "Exit Preview" : "Preview"}</span>
        </motion.button>

        {isPreviewMode && (
          <>
            <div className="flex items-center gap-1 ml-2 border-l border-gray-200 dark:border-gray-600 pl-2">
              <button
                onClick={() => onModeChange("desktop")}
                className={`p-1.5 rounded-md transition-colors ${
                  currentMode === "desktop"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title="Desktop View"
              >
                <ComputerDesktopIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onModeChange("tablet")}
                className={`p-1.5 rounded-md transition-colors ${
                  currentMode === "tablet"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title="Tablet View"
              >
                <DeviceTabletIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onModeChange("mobile")}
                className={`p-1.5 rounded-md transition-colors ${
                  currentMode === "mobile"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title="Mobile View"
              >
                <DevicePhoneMobileIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Indicator */}
            {isPreviewMode && totalFields > 0 && (
              <div className="ml-4 flex items-center gap-2 border-l border-gray-200 dark:border-gray-600 pl-4">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-in-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {completedFields} of {totalFields} fields completed
                </span>
              </div>
            )}
          </>
        )}

        {/* Share Button */}
        <button
          onClick={onShare}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Share form"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 