import movementLibrary from '../data/movement_library.json';

const formats = ['AMRAP', 'For Time', 'EMOM'] as const;
const schemes = ['single', 'couplet', 'triplet'] as const;
const durations: Record<typeof formats[number], number[]> = {
  AMRAP: [10, 12, 15, 20],
  'For Time': [6, 8, 10, 12],
  EMOM: [10, 12, 14, 16]
};

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => 0.5 - Math.random());

const getMovementsByScheme = (scheme: string): any[] => {
  const count = scheme === 'couplet' ? 2 : scheme === 'triplet' ? 3 : 1;
  return shuffle(movementLibrary).slice(0, count);
};

const determineStimulus = (format: string, duration: number, count: number): string => {
  if (format === 'EMOM') return 'skill + cardio';
  if (format === 'For Time' && duration <= 8) return 'sprint';
  if (count === 3) return 'grind';
  return 'moderate';
};

export const getTodayWOD = () => {
  const todayKey = new Date().toISOString().split('T')[0];
  const cached = localStorage.getItem('wod_' + todayKey);
  if (cached) return JSON.parse(cached);

  const format = getRandomItem([...formats]);
  const scheme = getRandomItem([...schemes]);
  const time = getRandomItem(durations[format]);
  const movements = getMovementsByScheme(scheme);
  const stimulus = determineStimulus(format, time, movements.length);

  const wod = {
    format,
    scheme: `${time} min ${format}${scheme !== 'single' ? ` (${scheme})` : ''}`,
    stimulus,
    movements
  };

  localStorage.setItem('wod_' + todayKey, JSON.stringify(wod));
  return wod;
};
