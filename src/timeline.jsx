import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
} from "lucide-react";

const initialDeliverables = [
  {
    id: 1,
    title: "Project Kickoff & Requirements Gathering",
    date: "2023-11-01",
    completed: true,
  },
  {
    id: 2,
    title: "Initial Design Mockups",
    date: "2023-11-15",
    completed: true,
  },
  {
    id: 3,
    title: "Frontend Development MVP",
    date: "2023-12-05",
    completed: false,
  },
  {
    id: 4,
    title: "Final Review & Launch",
    date: "2023-12-20",
    completed: false,
  },
];

export const ProjectTimeline = () => {
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  // Sort deliverables by date
  const sortedDeliverables = [...deliverables].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  const completedCount = sortedDeliverables.filter((d) => d.completed).length;
  const progressPercent =
    sortedDeliverables.length > 0
      ? Math.round((completedCount / sortedDeliverables.length) * 100)
      : 0;

  const toggleStatus = (id) => {
    setDeliverables(
      deliverables.map((d) =>
        d.id === id ? { ...d, completed: !d.completed } : d,
      ),
    );
  };

  const handleDelete = (id) => {
    setDeliverables(deliverables.filter((d) => d.id !== id));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const newDeliverable = {
      id: Date.now(),
      title: newTitle.trim(),
      date: newDate,
      completed: false,
    };

    setDeliverables([...deliverables, newDeliverable]);
    setNewTitle("");
    setNewDate("");
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-5 mb-8">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-primary-50 text-primary dark:bg-primary-900/30 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Deliverable
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-6 p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col gap-3 animate-fade-in relative z-10"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Deliverable Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Design Handoff"
                className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Target Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold bg-primary text-white hover:bg-primary-600 rounded-lg transition-colors shadow-sm"
            >
              Save Key Date
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      <div className="relative pl-3 space-y-6 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-slate-700">
        {sortedDeliverables.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No deliverables set yet.
          </p>
        ) : (
          sortedDeliverables.map((item, index) => {
            const isPast = new Date(item.date) < new Date();
            return (
              <div
                key={item.id}
                className="relative flex items-start gap-4 group"
              >
                <div className="relative z-10 shrink-0 mt-0.5">
                  <button
                    onClick={() => toggleStatus(item.id)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full bg-white dark:bg-slate-800"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 transition-transform hover:scale-110" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 dark:text-slate-600 hover:text-primary transition-colors" />
                    )}
                  </button>
                </div>

                <div className="flex-1 pt-0.5 min-w-0">
                  <h4
                    className={`text-sm font-bold truncate transition-colors ${item.completed ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}
                  >
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-medium">
                    <Calendar
                      className={`w-3.5 h-3.5 ${item.completed ? "text-gray-400" : isPast ? "text-red-500" : "text-primary"}`}
                    />
                    <span
                      className={`${item.completed ? "text-gray-400" : isPast ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {isPast && !item.completed && (
                      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors focus:outline-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

let root = null;
export function renderTimeline() {
  const container = document.getElementById("project-timeline-root");
  if (container) {
    if (!root) {
      root = createRoot(container);
    }
    // Small timeout to allow the browser to calculate dimensions after display block
    setTimeout(() => {
      root.render(<ProjectTimeline />);
    }, 50);
  }
}
