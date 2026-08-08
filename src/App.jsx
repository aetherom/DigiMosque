// src/App.jsx
import { useState, useEffect } from 'react';
import { Loader2, Clock, Compass, Map, Calendar } from 'lucide-react';
import { getPrayerTimes } from './api/prayerTimes';
import PrayerTimesView from './components/PrayerTimesView';

export default function App() {
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('prayer');

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await getPrayerTimes(latitude, longitude);
          setPrayerData(data);
        } catch (err) {
          setError('Failed to fetch prayer times.');
        }
        setLoading(false);
      },
      (err) => {
        setError('Location permission denied. Please type your city manually.');
        setLoading(false);
      }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="mt-4 text-dark/70">Detecting location & prayer times...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-dark">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {error && (
          <div className="p-4 m-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
            {error}
            <button onClick={detectLocation} className="block mx-auto mt-2 underline">Retry</button>
          </div>
        )}
        
        {activeTab === 'prayer' && prayerData && <PrayerTimesView prayerData={prayerData} />}
        {activeTab === 'qibla' && <div className="p-8 text-center text-dark/50">Qibla 3D Coming Next</div>}
        {activeTab === 'mosques' && <div className="p-8 text-center text-dark/50">Mosques Map Coming Next</div>}
        {activeTab === 'calendar' && <div className="p-8 text-center text-dark/50">Calendar Coming Next</div>}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-dark/10 flex justify-around py-3 z-50">
        <NavButton icon={Clock} label="Prayers" isActive={activeTab === 'prayer'} onClick={() => setActiveTab('prayer')} />
        <NavButton icon={Compass} label="Qibla" isActive={activeTab === 'qibla'} onClick={() => setActiveTab('qibla')} />
        <NavButton icon={Map} label="Mosques" isActive={activeTab === 'mosques'} onClick={() => setActiveTab('mosques')} />
        <NavButton icon={Calendar} label="Calendar" isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-accent' : 'text-dark/40'}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
