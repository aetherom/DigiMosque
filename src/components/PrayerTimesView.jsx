// src/components/PrayerTimesView.jsx
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function PrayerTimesView({ prayerData }) {
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    const calculateNext = () => {
      const now = new Date();
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      let foundNext = null;

      for (let p of prayers) {
        const time = prayerData.timings[p].split(':');
        const prayerDate = new Date();
        prayerDate.setHours(time[0], time[1], 0, 0);
        
        if (prayerDate > now) {
          foundNext = { name: p, time: prayerDate };
          break;
        }
      }

      if (!foundNext) {
        const time = prayerData.timings.Fajr.split(':');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(time[0], time[1], 0, 0);
        foundNext = { name: 'Fajr (Tomorrow)', time: tomorrow };
      }

      setNextPrayer(foundNext);
    };

    calculateNext();
    const interval = setInterval(calculateNext, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  const getCountdown = () => {
    if (!nextPrayer) return '';
    const diff = nextPrayer.time - new Date();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <header className="text-center mt-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">DigiMosque</h1>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-dark/60">
          <MapPin className="w-4 h-4 text-accent" />
          <span>
            {prayerData.date.readable} | {prayerData.date.hijri.date} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year}
          </span>
        </div>
      </header>

      {nextPrayer && (
        <div className="bg-accent text-white rounded-3xl p-6 mb-6 shadow-lg shadow-accent/20">
          <p className="text-sm opacity-80 uppercase tracking-wider">Next Prayer</p>
          <div className="flex justify-between items-end mt-2">
            <h2 className="text-3xl font-bold">{nextPrayer.name}</h2>
            <p className="text-2xl font-mono">{getCountdown()}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-dark/5 p-4">
        <h3 className="text-sm font-medium text-dark/50 mb-3 px-2">Today's Schedule</h3>
        <div className="space-y-1">
          {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
            const isNext = nextPrayer && nextPrayer.name.includes(prayer);
            return (
              <div 
                key={prayer} 
                className={`flex justify-between items-center p-3 rounded-xl transition-colors ${
                  isNext ? 'bg-accent/10' : 'hover:bg-dark/5'
                }`}
              >
                <span className={`font-medium ${isNext ? 'text-accent' : 'text-dark/90'}`}>
                  {prayer}
                </span>
                <span className={`font-mono ${isNext ? 'text-accent font-bold' : 'text-dark/70'}`}>
                  {prayerData.timings[prayer]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-center mt-6 text-dark/30">
        Data Source: {prayerData.source} | 100% Private
      </p>
    </div>
  );
}
