import { useState, useEffect, useRef } from 'react';
import type { Timer } from './types/timer';
import { TimerCard } from './components/TimerCard';
import { saveTimers, loadTimers } from './utils/localStorage';

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const incrementTimer = (timerId: string, prevTimers: Timer[]): Timer[] => {
  return prevTimers.map((t) => {
    if (t.id === timerId) {
      const updatedTimer = { ...t, seconds: t.seconds + 1 };

      // Check if notification should be sent
      if (shouldSendNotification(updatedTimer)) {
        sendNotification(t.name, t.notificationInterval);
        return { ...updatedTimer, lastNotificationAt: updatedTimer.seconds };
      }

      return updatedTimer;
    }
    return t;
  });
};

const sendNotification = (timerName: string, minutes: number): void => {
  if ('Notification' in globalThis && Notification.permission === 'granted') {

    const audio = new Audio('/notification.mp3');
    let playCount = 0;

    const playSound = () => {
      audio.play().catch(err => console.log('Audio play failed:', err));
      playCount++;

      if (playCount < 3) {
        audio.addEventListener('ended', playSound, { once: true });
      }
    };

    playSound();

    // Show notification
    new Notification(`Timer Alert: ${timerName}`, {
      body: `Hey! It's been ${minutes} minutes. Time for a break? 😊`,
      icon: '/timer-icon.svg',
      tag: timerName,
      requireInteraction: false,
    });
  }
};

const shouldSendNotification = (timer: Timer): boolean => {
  if (!timer.notificationEnabled || !timer.isRunning) {
    return false;
  }

  const intervalSeconds = timer.notificationInterval * 60;
  const nextNotificationTime = timer.lastNotificationAt + intervalSeconds;

  return timer.seconds >= nextNotificationTime && timer.seconds > 0;
};

function App() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimerName, setNewTimerName] = useState('');
  const [isProMode, setIsProMode] = useState(false);
  const intervalsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const runningTimer = timers.find(t => t.isRunning);
    if (runningTimer) {
      document.title = `${formatTime(runningTimer.seconds)} - ${runningTimer.name}`;
    } else {
      document.title = 'Timer App';
    }
  }, [timers]);

  useEffect(() => {
    const loadedTimers = loadTimers();
    if (loadedTimers.length > 0) {
      const stoppedTimers = loadedTimers.map(timer => ({
        ...timer,
        isRunning: false
      }));
      setTimers(stoppedTimers);
    }
  }, []);

  useEffect(() => {
    console.log('Loading timers on mount');
    const loadedTimers = loadTimers();
    console.log('Loaded timers:', loadedTimers);
    // Stop all timers that were running before refresh
    const stoppedTimers = loadedTimers.map(timer => ({
      ...timer,
      isRunning: false
    }));
    setTimers(stoppedTimers);
  }, []);

  useEffect(() => {
    if (timers.length > 0) {
      saveTimers(timers);
    }

    for (const timer of timers) {
      const hasInterval = intervalsRef.current.has(timer.id);

      if (timer.isRunning && !hasInterval) {
        const intervalId = globalThis.setInterval(() => {
          setTimers((prevTimers) => incrementTimer(timer.id, prevTimers));
        }, 1000);
        intervalsRef.current.set(timer.id, intervalId);
      } else if (!timer.isRunning && hasInterval) {
        const intervalId = intervalsRef.current.get(timer.id);
        if (intervalId !== undefined) {
          clearInterval(intervalId);
          intervalsRef.current.delete(timer.id);
        }
      }
    }

    return () => {
      for (const intervalId of intervalsRef.current.values()) {
        clearInterval(intervalId);
      }
      intervalsRef.current.clear();
    };
  }, [timers]);

  const addTimer = () => {
    if (newTimerName.trim()) {
      const capitalizedName = newTimerName.trim().charAt(0).toUpperCase() + newTimerName.trim().slice(1);
      const newTimer: Timer = {
        id: Date.now().toString(),
        name: capitalizedName,
        seconds: 0,
        isRunning: false,
        notificationEnabled: false,
        notificationInterval: 30,
        lastNotificationAt: 0,
      };
      setTimers([...timers, newTimer]);
      setNewTimerName('');
    }
  };

  const toggleTimer = (id: string) => {
    setTimers(prevTimers => {
      const targetTimer = prevTimers.find(t => t.id === id);
      if (!targetTimer) return prevTimers;

      return prevTimers.map(timer => {
        if (timer.id === id) {
          // Toggle the target timer
          return { ...timer, isRunning: !timer.isRunning };
        } else if (isProMode && !targetTimer.isRunning) {
          // In Pro Mode, if we're starting the target timer, pause all others
          return { ...timer, isRunning: false };
        }
        return timer;
      });
    });
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

  const toggleNotification = async (id: string) => {
    const timer = timers.find(t => t.id === id);

    if (timer && !timer.notificationEnabled) {
      if ('Notification' in globalThis && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Please allow notifications to use this feature');
          return;
        }
      }

      if (Notification.permission !== 'granted') {
        alert('Notifications are blocked. Please enable them in your browser settings.');
        return;
      }
    }

    setTimers(
      timers.map((t) =>
        t.id === id
          ? { ...t, notificationEnabled: !t.notificationEnabled }
          : t
      )
    );
  };

  const updateNotificationInterval = (id: string, interval: number) => {
    setTimers(
      timers.map((timer) =>
        timer.id === id
          ? { ...timer, notificationInterval: interval, lastNotificationAt: 0 }
          : timer
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="px-6 py-10">
        <div className="flex items-center justify-center gap-6 mb-12">
          <h1 className="text-5xl font-bold text-blue-400">
            Timer App
          </h1>
          <div className="flex items-center gap-2 h-[52px] justify-center mt-3">
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isProMode}
                  onChange={(e) => setIsProMode(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">Pro Mode</span>
              </label>
              <div className="relative ml-2 group">
                <button
                  className="text-gray-400 hover:text-blue-400 transition-colors rounded-full w-5 h-5 flex items-center justify-center"
                  title="Pro Mode Info"
                >
                  <img src="/info.png" alt="Info" className="w-4 h-4" />
                </button>
                <div className="absolute top-full right-[calc(100%)] mt-5 px-3 py-2 bg-gray-800 text-sm text-gray-300 rounded-lg border border-gray-700 w-64 hidden group-hover:block z-10">
                  In Pro Mode, only one timer can run at a time. Starting a new timer will automatically pause other running timers.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={newTimerName}
            onChange={(e) => setNewTimerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTimer()}
            placeholder="Enter timer name..."
            className="flex-1 bg-gray-800 text-white px-6 py-4 text-lg rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addTimer}
            className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            Add Timer
          </button>
        </div>

        {timers.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">No timers yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onUpdate={updateTimer}
                onDelete={deleteTimer}
                onToggleNotification={toggleNotification}
                onUpdateInterval={updateNotificationInterval}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;