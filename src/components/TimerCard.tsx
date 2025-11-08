import type { Timer } from '../types/timer';
import { useState } from 'react';

interface TimerCardProps {
  timer: Timer;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const TimerCard = ({ timer, onToggle, onReset, onUpdate, onDelete }: TimerCardProps) => {
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
    <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
      {isEditing ? (
        <div className="mb-6">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-100">{timer.name}</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-blue-400 transition-colors p-2"
            title="Edit name"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      )}

      <div className="text-6xl font-mono font-bold text-center mb-8 text-blue-400">
        {formatTime(timer.seconds)}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onToggle(timer.id)}
          className={`py-3 rounded-lg font-medium transition-colors ${
            timer.isRunning
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {timer.isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={() => onReset(timer.id)}
          className="py-3 bg-rose-600 hover:bg-rose-700 rounded-lg font-medium transition-colors"
        >
          Reset
        </button>

        <button
          onClick={() => onDelete(timer.id)}
          className="py-3 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};