import React, { useEffect, useState } from 'react';
import { getTodayWOD } from './logic/getTodayWOD';

const TrainingApp: React.FC = () => {
  const [todayWOD, setTodayWOD] = useState<any | null>(null);
  const [activeScale, setActiveScale] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const wod = getTodayWOD();
      setTodayWOD(wod);

      const key = 'completed_' + new Date().toISOString().split('T')[0];
      const done = localStorage.getItem(key);
      if (done) setCompleted(true);
    } catch (e) {
      console.error('Failed to load WOD', e);
    }
  }, []);

  const markComplete = () => {
    const key = 'completed_' + new Date().toISOString().split('T')[0];
    localStorage.setItem(key, 'true');
    setCompleted(true);
  };

  const regenerateWOD = () => {
    const todayKey = 'wod_' + new Date().toISOString().split('T')[0];
    localStorage.removeItem(todayKey);
    setTodayWOD(getTodayWOD());
    setCompleted(false);
  };

  return (
    <div className="app-container">
      <h1>Training App – Daily CrossFit WOD</h1>

      {todayWOD?.warmup && Array.isArray(todayWOD.warmup) && (
        <div className="warmup-section">
          <h2>🏁 Warm-up</h2>
          <ul>
            {todayWOD.warmup.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {todayWOD ? (
        <div className="wod-card">
          <h2>{todayWOD.format}: {todayWOD.scheme}</h2>
          <p><strong>Stimulus:</strong> {todayWOD.stimulus}</p>
          {todayWOD.target_rounds && (
            <p><strong>Suggested Rounds:</strong> {todayWOD.target_rounds}</p>
          )}

          <ul>
            {todayWOD.movements.map((m: any, idx: number) => (
              <li key={idx}>
                <strong>{m.name}</strong>
                {m.rx_load ? ` – RX Load: ${m.rx_load}` : ``}
                {m.rx_reps ? ` – Reps: ${m.rx_reps}` : ``}
                <br />
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
