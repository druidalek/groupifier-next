import { parseActivityCode, activityCodeToName } from './activities';
import { sortBy } from './utils';

const best = (person, eventId, type = 'single') => {
  const personalBest = person.personalBests.find(pb => pb.eventId === eventId && pb.type === type);
  return personalBest ? personalBest.best : Infinity;
};

const competitorsExpectedToAdvance = (sortedCompetitors, advancementCondition, eventId) => {
  switch (advancementCondition.type) {
    case 'ranking':
      return sortedCompetitors.slice(0, advancementCondition.level);
    case 'percent':
      return sortedCompetitors.slice(0, Math.floor(sortedCompetitors.length * advancementCondition.level * 0.01));
    case 'attemptResult':
      /* Assume that competitors having personal best better than the advancement condition will make it to the next round. */
      return sortedCompetitors.filter(person => best(person, eventId) < advancementCondition.level);
    default:
      throw new Error(`Unrecognised AdvancementCondition type: '${advancementCondition.type}'`);
  }
};

export const getExpectedCompetitorsByRound = wcif =>
  wcif.events.reduce((expectedCompetitorsByRound, wcifEvent) => {
    const [firstRound, ...nextRounds] = wcifEvent.rounds;
    const registeredCompetitors = wcif.persons.filter(person =>
      person.registration && person.registration.eventIds.includes(wcifEvent.id)
    );
    expectedCompetitorsByRound[firstRound.id] = sortBy(registeredCompetitors, competitor => best(competitor, wcifEvent.id));
    nextRounds.reduce(([round, competitors], nextRound) => {
      const advancementCondition = round.advancementCondition;
      if (!advancementCondition) throw new Error(`Mising advancement condition for ${activityCodeToName(round.id)}.`);
      const nextRoundCompetitors = competitorsExpectedToAdvance(competitors, advancementCondition, wcifEvent.id);
      expectedCompetitorsByRound[nextRound.id] = nextRoundCompetitors;
      return [nextRound, nextRoundCompetitors];
    }, [firstRound, expectedCompetitorsByRound[firstRound.id]]);
    return expectedCompetitorsByRound;
  }, {});

const advancingResults = (results, advancementCondition) => {
  switch (advancementCondition.type) {
    case 'ranking':
      return results.filter(result => result.ranking <= advancementCondition.level);
    case 'percent':
      return results.filter(result => result.ranking <= Math.floor(results.length * advancementCondition.level * 0.01));
    case 'attemptResult':
      return results.filter(result => result.attempts.some(attempt => attempt.result < advancementCondition.level));
    default:
      throw new Error(`Unrecognised AdvancementCondition type: '${advancementCondition.type}'`);
  }
};

export const competitorsForRound = (wcif, roundId) => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  if (roundNumber === 1) {
    const registeredCompetitors = wcif.persons.filter(({ registration }) =>
      registration && registration.status === 'accepted' && registration.eventIds.includes(eventId)
    );
    return sortBy(registeredCompetitors, competitor => -best(competitor, eventId));
  } else {
    const previousRound = wcif.events
      .find(wcifEvent => wcifEvent.id === eventId).rounds
      .find(round => parseActivityCode(round.id).roundNumber === roundNumber - 1);
    const { results, advancementCondition } = previousRound;
    return sortBy(advancingResults(results, advancementCondition), result => -result.ranking)
      .map(result => wcif.persons.find(person => person.registrantId === result.personId));
  }
};
