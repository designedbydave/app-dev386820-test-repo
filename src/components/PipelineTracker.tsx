import { useEffect, useState } from 'react';
import { STAGES, stageIndex, type Stage } from '../lib/pipeline';

type Status = 'pending' | 'running' | 'waiting' | 'done';

// Walk-through of the pipeline for demos. "Run pipeline" advances one stage at a
// time and stops at Deploy PROD until the change is approved, which is what the
// ServiceNow deployment gate does to the real workflow.
const GATED_STAGE = stageIndex('deploy-prod');
const STEP_MS = 900;

export function statusFor(i: number, cursor: number, approved: boolean): Status {
  if (cursor < 0 || i > cursor) return 'pending';
  if (i < cursor) return 'done';
  if (i === GATED_STAGE && !approved) return 'waiting';
  return 'running';
}

export default function PipelineTracker() {
  const [cursor, setCursor] = useState(-1);
  const [approved, setApproved] = useState(false);
  const [selected, setSelected] = useState<Stage>(STAGES[0]);

  const running = cursor >= 0 && cursor < STAGES.length;
  const blocked = cursor === GATED_STAGE && !approved;

  useEffect(() => {
    if (!running || blocked) return;
    const t = setTimeout(() => setCursor((c) => c + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [cursor, running, blocked]);

  useEffect(() => {
    if (running) setSelected(STAGES[cursor]);
  }, [cursor, running]);

  const start = () => {
    setApproved(false);
    setCursor(0);
  };

  return (
    <section className="tracker" aria-label="Pipeline walkthrough">
      <ol className="stages">
        {STAGES.map((stage, i) => {
          const status = statusFor(i, cursor, approved);
          return (
            <li key={stage.id}>
              <button
                type="button"
                className={`stage ${status} ${stage.kind}`}
                aria-pressed={selected.id === stage.id}
                onClick={() => setSelected(stage)}
              >
                <span className="dot" aria-hidden="true" />
                <span className="job">{stage.job}</span>
                <span className="status">{status}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="detail">
        <h3>{selected.job}</h3>
        <p>{selected.summary}</p>
        <p className="sn">
          <strong>ServiceNow:</strong> {selected.servicenow}
        </p>
      </div>

      <div className="controls">
        <button type="button" onClick={start} disabled={running && !blocked}>
          {cursor < 0 ? 'Run pipeline' : 'Run again'}
        </button>
        {blocked && (
          <button type="button" className="approve" onClick={() => setApproved(true)}>
            Approve change (move to Implement)
          </button>
        )}
        {cursor >= STAGES.length && <span role="status">Deployed to production.</span>}
      </div>
    </section>
  );
}
