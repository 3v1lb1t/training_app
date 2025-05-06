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

const generateWarmup = (movements: any[]): string[] => {
  const generalWarmup = [
    '3 min light cardio (row, bike, jog)',
    '10 arm circles forward & backward',
    '10 leg swings each side'
  ];

  const dynamicStretches = [
    '10 walking lunges with twist',
    '10 inchworms',
    '10 cossack squats',
    '10 world’s greatest stretch (5/side)',
    '10 standing toe touches with arm reach'
  ];

  const warmupLibrary: Record<string, string[]> = {
    squat: ['10 goblet squats', '10 tempo air squats', '10 wall-facing squats'],
    hinge: ['10 kettlebell deadlifts', '10 glute bridges', '10 good mornings'],
    push: ['10 banded shoulder presses', '5 push-up negatives', '10 scapular push-ups'],
    pull: ['10 ring rows', '10 light band rows', '10 shoulder blade squeezes'],
    core: ['10 dead bugs', '30s plank', '10 bird dogs'],
    jump: ['20 jumping jacks', '6 step-down burpees', '10 jump squats']
  };

  const categoryMap: Record<string, string[]> = {
    squat: ['squat', 'thruster', 'wall ball', 'overhead squat'],
    hinge: ['deadlift', 'kettlebell swing'],
    push: ['push', 'press', 'handstand', 'dip'],
    pull: ['pull', 'row', 'ring', 'chin'],
    core: ['sit-up', 'toes-to-bar', 'v-up', 'plank'],
    jump: ['burpee', 'jump', 'box']
  };

  const neededCategories = new Set<string>();
  movements.forEach((m) => {
    const name = m.name.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        neededCategories.add(category);
      }
    }
  });

  const targetedPrep: string[] = [];
  neededCategories.forEach(cat => {
    const options = warmupLibrary[cat];
    if (options) {
      const choice = options[Math.floor(Math.random() * options.length)];
      targetedPrep.push(choice);
    }
  });

  // Randomize and combine all parts
  const stretches = dynamicStretches.sort(() => 0.5 - Math.random()).slice(0, 2);
  const finalWarmup = [...generalWarmup, ...stretches, ...targetedPrep].slice(0, 6);
  return finalWarmup;
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
  const warmup = generateWarmup(movements);

  let rounds: number | undefined;

  if (format === 'For Time') {
    if (time <= 6) rounds = 3;
    else if (time <= 8) rounds = 4;
    else if (time <= 10) rounds = 5;
    else rounds = 6;
  }
  
  const wod = {
    format,
    scheme: `${time} min ${format}${scheme !== 'single' ? ` (${scheme})` : ''}`,
    stimulus,
    movements,
    warmup,
    ...(typeof rounds === 'number' ? { target_rounds: rounds } : {})
  };

  localStorage.setItem('wod_' + todayKey, JSON.stringify(wod));
  return wod;
};
