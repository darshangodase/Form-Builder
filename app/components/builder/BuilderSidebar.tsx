import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  CheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const fieldTypes = [
  {
    type: "text",
    label: "Text Input",
    icon: DocumentTextIcon,
    description: "Single line text input",
    validationType: "text",
  },
  {
    type: "email",
    label: "Email Input",
    icon: EnvelopeIcon,
    description: "Email address input with validation",
    validationType: "email",
  },
  {
    type: "phone",
    label: "Phone Input",
    icon: PhoneIcon,
    description: "Phone number input with validation",
    validationType: "phone",
  },
  {
    type: "textarea",
    label: "Text Area",
    icon: DocumentDuplicateIcon,
    description: "Multi-line text input",
    validationType: "text",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ChevronDownIcon,
    description: "Select from options",
    defaultOption: "Select your option",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckIcon,
    description: "Boolean input",
  },
  {
    type: "date",
    label: "Date Picker",
    icon: CalendarIcon,
    description: "Date selection",
    validationType: "date",
  },
];

interface BuilderSidebarProps {
  onDragStart: (e: React.DragEvent<HTMLDivElement>, fieldType: string) => void;
}

export default function BuilderSidebar({ onDragStart }: BuilderSidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto transition-colors duration-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Form Fields</h2>
        <div className="space-y-2">
          {fieldTypes.map((field) => (
            <motion.div
              key={field.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-move 
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors 
                  border border-gray-200 dark:border-gray-600"
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, field.type)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-600 rounded-md shadow-sm">
                    <field.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">{field.label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{field.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 