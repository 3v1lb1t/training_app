// TrainingApp.tsx - CrossFit-style training application
import React, { useState, useEffect } from 'react';
import Parser from 'rss-parser';
import './App.css';

const wodTypes = ['single', 'couplet', 'triplet'];

const movementLibrary = {
  bodyweight: [
    { name: 'Push-up', scale: 'Knee Push-up' },
    { name: 'Air Squat', scale: 'Box Squat' },
    { name: 'Pull-up', scale: 'Ring Row' },
    { name: 'Burpee', scale: 'Step-back Burpee' },
    { name: 'Sit-up', scale: 'Anchored Sit-up' }
  ],
  weightlifting: [
    { name: 'Deadlift', scale: 'Kettlebell Deadlift' },
    { name: 'Clean and Jerk', scale: 'Dumbbell Clean and Jerk' },
    { name: 'Snatch', scale: 'Dumbbell Snatch' },
    { name: 'Thruster', scale: 'Dumbbell Thruster' }
  ],
  cardio: [
    { name: '400m Run', scale: '200m Run' },
    { name: 'Row 500m', scale: 'Row 250m' },
    { name: 'Bike 1km', scale: 'Bike 500m' },
    { name: 'Jump Rope 100', scale: 'Jump Rope 50' }
  ]
};

const getRandomMovements = (count: number) => {
  const allMovements = [
    ...movementLibrary.bodyweight,
    ...movementLibrary.weightlifting,
    ...movementLibrary.cardio
  ];
  const shuffled = allMovements.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateScheme = () => {
  const formats = ['AMRAP', 'For Time', 'EMOM', 'Rounds for Quality'];
  const schemes = ['10 min', '12 min', '15 min', '21-15-9', '3 RFT', '5 Rounds'];
  const format = formats[Math.floor(Math.random() * formats.length)];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  return { format, scheme };
};

const generateDynamicWOD = (type: string) => {
  const body = [...movementLibrary.bodyweight];
  const weight = [...movementLibrary.weightlifting];
  const cardio = [...movementLibrary.cardio];

  let movements: any[] = [];
  if (type === 'single') movements = getRandomMovements(1);
  if (type === 'couplet') movements = [getRandomMovements(1)[0], getRandomMovements(1, 'weightlifting')[0]];
  if (type === 'triplet') movements = [getRandomMovements(1)[0], getRandomMovements(1, 'weightlifting')[0], getRandomMovements(1, 'cardio')[0]];

  const scheme = generateScheme();
  return { type, ...scheme, movements };
};

const generateWeek = () => {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const type = wodTypes[Math.floor(Math.random() * wodTypes.length)];
    const wod = generateDynamicWOD(type);
    week.push({ day: i + 1, ...wod });
  }
  return week;
};

const TrainingApp: React.FC = () => {
  const [crossfitWODs, setCrossfitWODs] = useState<any[]>([]);

  useEffect(() => {
    const fetchWODs = async () => {
      try {
        const parser = new Parser();
        const feed = await parser.parseURL('https://www.crossfit.com/feeds/workouts');
        const items = feed.items?.slice(0, 7) || [];
        setCrossfitWODs(items.map((item, i) => ({
          title: item.title,
          link: item.link,
          date: item.pubDate,
          content: item.contentSnippet || item.content
        })));
      } catch (err) {
        console.error('Error fetching CrossFit WODs:', err);
      }
    };

    fetchWODs();
  }, []);
  const [currentWeek, setCurrentWeek] = useState<number>(() => {
    const saved = localStorage.getItem('cf_week');
    return saved ? parseInt(saved) : 0;
  });

  const [weeks, setWeeks] = useState(() => {
    const saved = localStorage.getItem('cf_weeks');
    return saved ? JSON.parse(saved) : [generateWeek()];
  });

  useEffect(() => {
    localStorage.setItem('cf_weeks', JSON.stringify(weeks));
    localStorage.setItem('cf_week', currentWeek.toString());
  }, [weeks, currentWeek]);

  const completeWeek = () => {
    const newWeek = generateWeek();
    const updated = [...weeks, newWeek];
    setWeeks(updated);
    setCurrentWeek(updated.length - 1);
  };

  return (
    <div className="app-container">
      <h1>Training App – CrossFit Weekly WODs</h1>
      <h2>Week {currentWeek + 1}</h2>

      <div className="calendar-row">
        {weeks[currentWeek].map((wod: any, i: number) => (
          <div className="calendar-day-square" key={i}>
            <strong>Day {wod.day}</strong>
            <p>Type: {wod.type}</p>
            <ul>
              {wod.movements.map((m: any, idx: number) => (
                <li key={idx}>{m.name} <em>(Scale: {m.scale})</em></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="crossfit-feed">
        <h2>Latest from CrossFit.com</h2>
        {crossfitWODs.map((wod, idx) => (
          <div key={idx} className="crossfit-wod">
            <a href={wod.link} target="_blank" rel="noopener noreferrer">
              <strong>{wod.title}</strong>
            </a>
            <p>{wod.date}</p>
            <p>{wod.content}</p>
          </div>
        ))}
      </div>

      <button onClick={completeWeek}>Complete Week & Generate Next</button>
    </div>
  );
};

export default TrainingApp;
