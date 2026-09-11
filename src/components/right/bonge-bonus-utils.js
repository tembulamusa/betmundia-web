export const emptyBonusAdvice = {
  status: "Select 3 or more games to win big bonus",
  nudgeTitle: null,
  nudgeSub: null,
};

const readBonusPercent = (dbWinMatrix, games) => {
  const raw = dbWinMatrix?.[`sgr_bonus_percent_${games}`];
  if (raw == null || raw === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

/** Highest defined sgr_bonus_percent_N (and the game count it maps to). */
export const getMaxBongeBonus = (dbWinMatrix) => {
  if (!dbWinMatrix) {
    return { maxPercent: null, maxGamesWithPercent: null };
  }

  let maxPercent = null;
  let maxGamesWithPercent = null;
  const configuredMax = Number(dbWinMatrix.sgr_bonus_max_games) || null;

  Object.keys(dbWinMatrix).forEach((key) => {
    const match = key.match(/^sgr_bonus_percent_(\d+)$/);
    if (!match) {
      return;
    }
    const games = Number(match[1]);
    if (configuredMax && games > configuredMax) {
      return;
    }
    const percent = readBonusPercent(dbWinMatrix, games);
    if (percent == null) {
      return;
    }
    if (
      maxPercent == null ||
      percent > maxPercent ||
      (percent === maxPercent && games > maxGamesWithPercent)
    ) {
      maxPercent = percent;
      maxGamesWithPercent = games;
    }
  });

  return { maxPercent, maxGamesWithPercent };
};

/** Percent for N qualifying games; falls back to highest defined tier if missing. */
export const resolveBongeBonusPercent = (dbWinMatrix, qualifyingGames) => {
  if (!dbWinMatrix) {
    return 0;
  }
  const maxGames = Number(dbWinMatrix.sgr_bonus_max_games) || null;
  let games = Number(qualifyingGames) || 0;
  if (maxGames && games > maxGames) {
    games = maxGames;
  }
  const current = readBonusPercent(dbWinMatrix, games);
  if (current != null) {
    return current;
  }
  const { maxPercent } = getMaxBongeBonus(dbWinMatrix);
  return maxPercent != null ? maxPercent : 0;
};

export const buildBongeBonusAdvice = (betslip, dbWinMatrix) => {
  if (!dbWinMatrix || Object.keys(dbWinMatrix).length === 0) {
    return { ...emptyBonusAdvice };
  }

  const oddLimit = dbWinMatrix?.sgr_bonus_min_odds || 1.3;
  const maxGames = Number(dbWinMatrix?.sgr_bonus_max_games) || null;
  let totalGames = Object.values(betslip || {}).filter(
    (slip) => Number(slip.odd_value) > Number(dbWinMatrix?.sgr_bonus_min_odds || 1.3)
  ).length;

  if (maxGames && totalGames > maxGames) {
    totalGames = maxGames;
  }

  const minOddsLabel = `${oddLimit} minimum odds per game`;
  const percent4 = readBonusPercent(dbWinMatrix, 4);
  const { maxPercent, maxGamesWithPercent } = getMaxBongeBonus(dbWinMatrix);

  const maxReachedMessage = (percent) => ({
    status: `Congratulations, you have reached the maximum bonus of ${percent}%`,
    statusBoost: `${percent}%`,
    nudgeTitle: null,
    nudgeSub: null,
  });

  if (totalGames === 0) {
    return {
      status: `Select 4 games or more above ${oddLimit} to get a bonus`,
      nudgeTitle: null,
      nudgeSub: null,
    };
  }

  if (totalGames === 1) {
    return {
      status: null,
      nudgeTitle: percent4 != null ? `Add 3 more to get a ${percent4}% boost!` : "Add 3 more to unlock a boost!",
      nudgeSub: minOddsLabel,
    };
  }

  if (totalGames === 2) {
    return {
      status: null,
      nudgeTitle: percent4 != null ? `Add 2 more to get a ${percent4}% boost!` : "Add 2 more to unlock a boost!",
      nudgeSub: minOddsLabel,
    };
  }

  if (totalGames === 3) {
    return {
      status: null,
      nudgeTitle: percent4 != null ? `Add 1 more to get a ${percent4}% boost!` : "Add 1 more to unlock a boost!",
      nudgeSub: minOddsLabel,
    };
  }

  const current = readBonusPercent(dbWinMatrix, totalGames);
  const next = readBonusPercent(dbWinMatrix, totalGames + 1);
  const hitConfiguredMaxGames = Boolean(maxGames && totalGames >= maxGames);
  const hitHighestDefinedTier = Boolean(
    maxGamesWithPercent && totalGames >= maxGamesWithPercent
  );
  const nextMissing = next == null;
  const atMaximum =
    current != null && (nextMissing || hitConfiguredMaxGames || hitHighestDefinedTier);

  if (atMaximum) {
    return maxReachedMessage(current);
  }

  if (current != null && next != null) {
    return {
      status: `Your Multibet of ${totalGames} selections gives you a boost of ${current}%`,
      statusBoost: `${current}%`,
      nudgeTitle: `Add 1 more to get a ${next}% boost!`,
      nudgeSub: minOddsLabel,
    };
  }

  if (maxPercent != null && (hitConfiguredMaxGames || hitHighestDefinedTier || nextMissing)) {
    return maxReachedMessage(maxPercent);
  }

  return { ...emptyBonusAdvice };
};
