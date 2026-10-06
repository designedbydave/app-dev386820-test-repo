import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PipelineTracker, { statusFor } from '../src/components/PipelineTracker';
import { STAGES, stageIndex } from '../src/lib/pipeline';

const PROD = stageIndex('deploy-prod');

describe('statusFor', () => {
  it('is pending before the run starts', () => {
    expect(statusFor(0, -1, false)).toBe('pending');
  });

  it('waits at production until the change is approved', () => {
    expect(statusFor(PROD, PROD, false)).toBe('waiting');
    expect(statusFor(PROD, PROD, true)).toBe('running');
  });

  it('marks everything done after the last stage', () => {
    expect(STAGES.map((_, i) => statusFor(i, STAGES.length, true))).toEqual(STAGES.map(() => 'done'));
  });
});

describe('<PipelineTracker />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // Each stage schedules the next timer from an effect, so step through them.
  const advanceAll = () => {
    for (let i = 0; i <= STAGES.length; i++) act(() => vi.runOnlyPendingTimers());
  };
  const statusOf = (job: string) =>
    screen.getByRole('button', { name: new RegExp(job) }).querySelector('.status')?.textContent;

  it('stops at the change gate until approved, then deploys', () => {
    render(<PipelineTracker />);
    fireEvent.click(screen.getByRole('button', { name: 'Run pipeline' }));

    advanceAll();
    expect(statusOf('Deploy PROD')).toBe('waiting');
    expect(statusOf('ServiceNow Change')).toBe('done');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Approve change/ }));
    advanceAll();
    expect(statusOf('Deploy PROD')).toBe('done');
    expect(screen.getByRole('status')).toHaveTextContent('Deployed to production.');
  });

  it('shows ServiceNow details for the selected stage', () => {
    render(<PipelineTracker />);
    fireEvent.click(screen.getByRole('button', { name: /ServiceNow Change/ }));
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('ServiceNow Change');
  });
});
