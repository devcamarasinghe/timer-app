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
      onUpdate(timer.id, editName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(timer.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      {isEditing ? (
        <div className="mb-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <h3 className="text-xl font-semibold mb-4 text-gray-100">{timer.name}</h3>
      )}

      <div className="text-5xl font-mono font-bold text-center mb-6 text-blue-400">
        {formatTime(timer.seconds)}
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => onToggle(timer.id)}
          className={`px-6 py-2 rounded font-medium ${
            timer.isRunning
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {timer.isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={() => onReset(timer.id)}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
        >
          Reset
        </button>
        
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
          disabled={isEditing}
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(timer.id)}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};