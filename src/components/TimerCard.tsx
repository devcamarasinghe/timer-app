import type { Timer } from '../types/timer';
import { useState } from 'react';

interface TimerCardProps {
  timer: Timer;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleNotification: (id: string) => void;
  onUpdateInterval: (id: string, interval: number) => void;
}

export const TimerCard = ({
  timer,
  onToggle,
  onReset,
  onUpdate,
  onDelete,
  onToggleNotification,
  onUpdateInterval
}: TimerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(timer.name);

  const handleSave = () => {
    if (editName.trim()) {
      const capitalizedName = editName.trim().charAt(0).toUpperCase() + editName.trim().slice(1);
      onUpdate(timer.id, capitalizedName);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(timer.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-12 shadow-2xl border border-gray-700 min-h-[400px] flex flex-col justify-between">
      {isEditing ? (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 bg-gray-700 text-white text-xl px-3 py-1 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Column 1 - Title */}
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-semibold text-gray-100">{timer.name}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="Edit name"
              >
                <img src="/pen.png" alt="Edit" className="h-4 w-4 pt-1 cursor-pointer" />
              </button>
            </div>

            {/* Column 2 - Notification Toggle */}
            <div className="flex items-center justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm text-gray-300">Notifications</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={timer.notificationEnabled}
                    onChange={() => onToggleNotification(timer.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>

            {/* Column 3 - Dropdown */}
            <div className="flex items-center justify-end gap-2">
              {timer.notificationEnabled ? (
                <>
                  <span className="text-xs text-gray-400">Every</span>
                  <select
                    value={timer.notificationInterval}
                    onChange={(e) => onUpdateInterval(timer.id, Number(e.target.value))}
                    className="bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </>
              ) : (
                <span className="text-xs text-gray-500"> </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center my-6 sm:my-8 md:my-10 lg:my-12">
        <div className="flex items-baseline justify-center gap-1">
          <div className="flex flex-col items-center">
            <span className="text-7xl sm:text-8xl md:text-6xl lg:text-7xl xl:text-6xl font-bold text-blue-400 tracking-wider leading-none">
              {String(Math.floor(timer.seconds / 3600)).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-400 mt-1">HOURS</span>
          </div>
          <span className="text-7xl sm:text-8xl md:text-6xl lg:text-7xl xl:text-6xl font-bold text-blue-400">:</span>
          <div className="flex flex-col items-center">
            <span className="text-7xl sm:text-8xl md:text-6xl lg:text-7xl xl:text-6xl font-bold text-blue-400 tracking-wider leading-none">
              {String(Math.floor((timer.seconds % 3600) / 60)).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-400 mt-1">MINUTES</span>
          </div>
          <span className="text-7xl sm:text-8xl md:text-6xl lg:text-7xl xl:text-6xl font-bold text-blue-400">:</span>
          <div className="flex flex-col items-center">
            <span className="text-7xl sm:text-8xl md:text-6xl lg:text-7xl xl:text-6xl font-bold text-blue-400 tracking-wider leading-none">
              {String(timer.seconds % 60).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-400 mt-1">SECONDS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onToggle(timer.id)}
          className={`py-4 text-lg rounded-lg font-medium transition-colors cursor-pointer ${timer.isRunning
            ? 'bg-amber-600 hover:bg-amber-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
        >
          {timer.isRunning ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={() => onReset(timer.id)}
          className="py-3 bg-rose-600 hover:bg-rose-700 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Reset
        </button>

        <button
          onClick={() => onDelete(timer.id)}
          className="py-3 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
};