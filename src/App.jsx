import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { getPrayerTimes } from './api/prayerTimes';

export default function App() {
  const [location, setLocation] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auto-detect location on load
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
        setLocation({ lat: latitude, lng: longitude });
        
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
    <div className="min-h-screen bg-white text-dark flex flex-col items-center p-6">
      
      {/* Header */}
      <header className="w-full max-w-md text-center mt-8 mb-10">
        <h1 className="text-3xl font-bold tracking-tight">DigiMosque</h1>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-dark/60">
          <MapPin className="w-4 h-4 text-accent" />
          <span>
            {prayerData ? `${prayerData.date.readable} | ${prayerData.date.hijri.date} ${prayerData.date.hijri.month.en}` : 'Location not found'}
          </span>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </header>

      {/* Prayer Times Grid */}
      {prayerData && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-dark/5 p-6">
          <h2 className="text-lg font-semibold mb-4 text-dark/80">Today's Prayers (Azan)</h2>
          <div className="space-y-3">
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
              <div key={prayer} className="flex justify-between items-center p-3 rounded-xl hover:bg-dark/5 transition-colors">
                <span className="font-medium text-dark/90">{prayer}</span>
                <span className="font-mono text-dark/70">{prayerData.timings[prayer]}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-dark/5">
            <div className="flex justify-between items-center p-3 rounded-xl bg-accent/5">
              <span className="font-medium text-accent">Sunrise</span>
              <span className="font-mono text-accent/80">{prayerData.timings.Sunrise}</span>
            </div>
          </div>
          
          <p className="text-xs text-center mt-4 text-dark/40">
            Data Source: {prayerData.source}
          </p>
        </div>
      )}

      <button 
        onClick={detectLocation}
        className="mt-8 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-sm"
      >
        Refresh Location
      </button>

    </div>
  );
}
