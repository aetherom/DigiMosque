import adhan from 'adhan';

export async function getPrayerTimes(lat, lng, method = 2) {
  // 1. Try Aladhan API
  try {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`);
    const data = await res.json();
    
    if (data.code === 200) {
      return { source: 'Aladhan API', ...data.data };
    }
  } catch (error) {
    console.error("Aladhan API failed, falling back to local calculation:", error);
  }

  // 2. Fallback: Local Adhan JS Library (Works 100% offline)
  const coordinates = new adhan.Coordinates(lat, lng);
  const params = adhan.CalculationMethod.MuslimWorldLeague(); 
  const prayerTimes = new adhan.PrayerTimes(coordinates, new Date(), params);
  
  // Format time to HH:MM
  const fmt = (t) => t.toTimeString().slice(0, 5);

  return {
    source: 'Local Fallback',
    timings: {
      Fajr: fmt(prayerTimes.fajr),
      Sunrise: fmt(prayerTimes.sunrise),
      Dhuhr: fmt(prayerTimes.dhuhr),
      Asr: fmt(prayerTimes.asr),
      Maghrib: fmt(prayerTimes.maghrib),
      Isha: fmt(prayerTimes.isha),
      Imsak: fmt(new Date(prayerTimes.fajr.getTime() - 10 * 60000)), // 10 mins before Fajr
    },
    date: {
      readable: new Date().toDateString(),
      hijri: { date: "N/A", month: { en: "N/A" }, weekday: { en: "N/A" } }
    }
  };
}
