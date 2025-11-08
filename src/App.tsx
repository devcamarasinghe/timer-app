import { useState, useEffect, useRef } from 'react';
import type { Timer } from './types/timer';
import { TimerCard } from './components/TimerCard';
import { saveTimers, loadTimers } from './utils/localStorage';

function App() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimerName, setNewTimerName] = useState('');
  const intervalsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const loadedTimers = loadTimers();
    setTimers(loadedTimers);
  }, []);

  useEffect(() => {
    saveTimers(timers);

    timers.forEach((timer) => {
      const hasInterval = intervalsRef.current.has(timer.id);

      if (timer.isRunning && !hasInterval) {
        const intervalId = window.setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) =>
              t.id === timer.id ? { ...t, seconds: t.seconds + 1 } : t
            )
          );
        }, 1000);
        intervalsRef.current.set(timer.id, intervalId);
      } else if (!timer.isRunning && hasInterval) {
        const intervalId = intervalsRef.current.get(timer.id);
        if (intervalId !== undefined) {
          clearInterval(intervalId);
          intervalsRef.current.delete(timer.id);
        }
      }
    });

    return () => {
      intervalsRef.current.forEach((intervalId) => clearInterval(intervalId));
      intervalsRef.current.clear();
    };
  }, [timers]);

  const addTimer = () => {
    if (newTimerName.trim()) {
      const newTimer: Timer = {
        id: Date.now().toString(),
        name: newTimerName.trim(),
        seconds: 0,
        isRunning: false,
      };
      setTimers([...timers, newTimer]);
      setNewTimerName('');
    }
  };

  const toggleTimer = (id: string) => {
    setTimers(
      timers.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers(
      timers.map((timer) =>
        timer.id === id ? { ...timer, seconds: 0, isRunning: false } : timer
      )
    );
  };

  const updateTimer = (id: string, name: string) => {
    setTimers(
      timers.map((timer) => (timer.id === id ? { ...timer, name } : timer))
    );
  };

  const deleteTimer = (id: string) => {
    setTimers(timers.filter((timer) => timer.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
          Timer App
        </h1>

        <div className="mb-8 flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={newTimerName}
            onChange={(e) => setNewTimerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTimer()}
            placeholder="Enter timer name..."
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addTimer}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            Add Timer
          </button>
        </div>

        {timers.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">No timers yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onUpdate={updateTimer}
                onDelete={deleteTimer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;