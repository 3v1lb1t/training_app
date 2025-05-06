// <reference types="react" />
import * as React from 'react';
import { useState, useEffect } from 'react';
import { getTodayWOD } from './logic/getTodayWOD';
import './App.css';

const TrainingApp: React.FC = () => {
  const [todayWOD, setTodayWOD] = useState<any | null>(null);
  const [completed, setCompleted] = useState<boolean>(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    return localStorage.getItem('completed_' + todayKey) === 'true';
  });
  const [activeScale, setActiveScale] = useState<string | null>(null);

  useEffect(() => {
    const wod = getTodayWOD();
    setTodayWOD(wod);
  }, []);

  const markComplete = () => {
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem('completed_' + todayKey, 'true');
    setCompleted(true);
  };

  const regenerateWOD = () => {
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.removeItem('wod_' + todayKey);
    const wod = getTodayWOD();
    setTodayWOD(wod);
    setCompleted(false);
  };

  const getWODExplanation = (wod: any) => {
    const movementList = wod.movements.map((m: any) => m.name).join(", ");

    const formatExplanation = {
      emom: `EMOM stands for "Every Minute on the Minute." You will perform one movement at the start of each minute and rest for the remainder. For alternating EMOMs, minute 1 is movement 1, minute 2 is movement 2, and so on.`,
      amrap: `AMRAP stands for "As Many Rounds As Possible." Your goal is to complete as many full rounds or reps of the given movements within the time limit.`,
      "for time": `For Time workouts require you to complete the specified work as fast as possible. Record your time and aim for consistent pacing.`
    };

    const formatKey = wod.format.toLowerCase().replace(/[^a-z]/g, '');
    const explanation = formatExplanation[formatKey] || "This is a functional fitness workout format.";

    return `This is a ${wod.format} workout in a ${wod.scheme} rep scheme. Expect a ${wod.stimulus} stimulus. Movements include: ${movementList}. ${explanation}`;
  };

  const getMovementDescription = (m: any) => {
    return `${m.name} is a ${m.category} movement. Focus on proper form and control. Recommended load: ${m.rx_load || 'bodyweight'}. Reps: ${m.rx_reps || 'as needed'}.`;
  };

  return (
    <div className="app-container">
      <h1>Training App – Daily CrossFit WOD</h1>

      {todayWOD ? (
        <div className="wod-card">
          <h2>{todayWOD.format}: {todayWOD.scheme}</h2>
          <p><strong>Stimulus:</strong> {todayWOD.stimulus}</p>
          <p className="wod-explanation">{getWODExplanation(todayWOD)}</p>

          <ul>
            {todayWOD.movements.map((m: any, idx: number) => (
              <li key={idx}>
                <strong>{m.name}</strong>
                {m.rx_load ? ` – RX Load: ${m.rx_load}` : ``}
                {m.rx_reps ? ` – Reps: ${m.rx_reps}` : ``}
                <p className="movement-desc">{getMovementDescription(m)}</p>
                <button onClick={() => setActiveScale(m.name)}>View Scaling</button>
                {activeScale === m.name && (
                  <>
                    <div className="modal-backdrop" onClick={() => setActiveScale(null)}></div>
                    <div className="modal-content">
                      <h3>Scaling Option for {m.name}</h3>
                      <p>{m.scale}</p>
                      {m.scale_load && <p><strong>Recommended Scale Load:</strong> {m.scale_load}</p>}
                      <button onClick={() => setActiveScale(null)}>Close</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {!completed ? (
            <button onClick={markComplete} className="complete-button">
              Mark as Complete
            </button>
          ) : (
            <p className="completed-label">✅ Workout Completed</p>
          )}

          {!completed && (
            <button onClick={regenerateWOD} className="regen-button">
              🔁 Regenerate WOD
            </button>
          )}
        </div>
      ) : (
        <p>Loading WOD...</p>
      )}
    </div>
  );
};

export default TrainingApp;
