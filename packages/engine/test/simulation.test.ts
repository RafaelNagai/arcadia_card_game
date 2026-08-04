import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { sampleContent, samplePlayerSetups } from '../src/content';
import { randomBot, greedyBot, routeBot } from '../src/bots';
import { runMatch } from '../src/simulation/runMatch';
import { runBatch } from '../src/simulation/runBatch';
import { summarizeBatch } from '../src/simulation/summarize';

describe('runMatch', () => {
  it('plays a full match with each bot type without hitting the turn cap', () => {
    const config = loadConfig();
    for (const bot of [randomBot, greedyBot, routeBot]) {
      const result = runMatch({
        config,
        content: sampleContent,
        playerSetups: samplePlayerSetups,
        bots: { P1: bot, P2: bot },
        seed: 99,
      });
      expect(result.hitTurnCap).toBe(false);
      expect(result.state.phase).toBe('end');
      expect(result.telemetry.turnCount).toBeGreaterThan(0);
    }
  });
});

describe('runBatch + summarizeBatch', () => {
  it('runs N matches, tallies exactly N results, and never hits the turn cap', () => {
    const config = loadConfig();
    const result = runBatch({
      config,
      content: sampleContent,
      playerSetups: samplePlayerSetups,
      botP1: randomBot,
      botP2: greedyBot,
      matchCount: 5,
      seedStart: 1000,
    });

    expect(result.matchCount).toBe(5);
    expect(result.telemetries).toHaveLength(5);
    expect(result.wins.P1 + result.wins.P2 + result.wins.drift).toBe(5);
    expect(result.hitTurnCapCount).toBe(0);

    const summary = summarizeBatch(result);
    expect(summary.winRate.P1 + summary.winRate.P2 + summary.winRate.drift).toBeCloseTo(1);
    expect(summary.avgTurnCount).toBeGreaterThan(0);
  });

  it('is reproducible from the same seed', () => {
    const config = loadConfig();
    const run = () =>
      runBatch({
        config,
        content: sampleContent,
        playerSetups: samplePlayerSetups,
        botP1: randomBot,
        botP2: routeBot,
        matchCount: 3,
        seedStart: 42,
      });

    const a = run();
    const b = run();
    expect(a.wins).toEqual(b.wins);
    expect(a.telemetries.map((t) => t.turnCount)).toEqual(b.telemetries.map((t) => t.turnCount));
  });
});
