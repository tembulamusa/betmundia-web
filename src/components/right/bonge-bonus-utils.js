export const emptyBonusAdvice = {
  status: "Select 4 or more games to win big bonus",
  nudgeTitle: null,
  nudgeSub: null,
};

const SGR_PERCENT_KEY = /^sgr_bonus_percent_(\d+)$/;

/** Fallback SGR (Mshipi) config, used for any setting /sports/config/sgr does not return. */
export const DEFAULT_SGR_CONFIG = {
  sgr_bonus_enabled: "1",
  sgr_bonus_min_games: "4",
  sgr_bonus_max_games: "20",
  sgr_bonus_min_odds: "1.3",
  sgr_bonus_percent_4: "4",
  sgr_bonus_percent_5: "5",
  sgr_bonus_percent_6: "6",
  sgr_bonus_percent_7: "7",
  sgr_bonus_percent_8: "8",
  sgr_bonus_percent_9: "9",
  sgr_bonus_percent_10: "10",
  sgr_bonus_percent_11: "14",
  sgr_bonus_percent_12: "18",
  sgr_bonus_percent_13: "22",
  sgr_bonus_percent_14: "26",
  sgr_bonus_percent_15: "30",
  sgr_bonus_percent_16: "34",
  sgr_bonus_percent_17: "38",
  sgr_bonus_percent_18: "42",
  sgr_bonus_percent_19: "46",
  sgr_bonus_percent_20: "50",
};

/**
 * API settings win over the defaults. The percent tiers are taken as a set: the API's
 * tiers when it returns any, otherwise the default tiers.
 */
export const withSgrDefaults = (config) => {
  const fromApi = config && typeof config === "object" ? config : {};
  const apiHasTiers = Object.keys(fromApi).some((key) => SGR_PERCENT_KEY.test(key));
  const merged = {};
  Object.entries(DEFAULT_SGR_CONFIG).forEach(([key, value]) => {
    if (!apiHasTiers || !SGR_PERCENT_KEY.test(key)) {
      merged[key] = value;
    }
  });
  Object.entries(fromApi).forEach(([key, value]) => {
    if (value != null && value !== "") {
      merged[key] = value;
    }
  });
  return merged;
};

/** Selections priced at or above sgr_bonus_min_odds (default 1.3). */
export const countSgrQualifyingGames = (betslip, dbWinMatrix) => {
  const minOdds = Number(dbWinMatrix?.sgr_bonus_min_odds) || 1.3;
  return Object.values(betslip || {}).filter((slip) => Number(slip?.odd_value) >= minOdds).length;
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
    const match = key.match(SGR_PERCENT_KEY);
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

/** Percent for N qualifying games; uses the nearest lower defined tier if N has none (0 below the first tier). */
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
  // No tier for this exact count: use the nearest lower tier that is defined,
  // and none (0) when the count is below every defined tier.
  for (let n = games - 1; n >= 1; n -= 1) {
    const lower = readBonusPercent(dbWinMatrix, n);
    if (lower != null) {
      return lower;
    }
  }
  return 0;
};

export const buildBongeBonusAdvice = (betslip, dbWinMatrix) => {
  if (!dbWinMatrix || Object.keys(dbWinMatrix).length === 0) {
    return { ...emptyBonusAdvice };
  }

  const oddLimit = dbWinMatrix?.sgr_bonus_min_odds || 1.3;
  const maxGames = Number(dbWinMatrix?.sgr_bonus_max_games) || null;
  let totalGames = countSgrQualifyingGames(betslip, dbWinMatrix);

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

/**
 * Flatten the /sports/config/sgr payload into { sgr_bonus_percent_4: 4, ... }.
 * Accepts the flat object, an object wrapped one or two levels deep, a list of
 * { key|name|config_key|code, value } rows, and values wrapped as { value }.
 */
export const normalizeSgrConfig = (raw) => {
  const out = {};
  const isSgrKey = (key) => typeof key === "string" && /^sgr_/i.test(key);
  const unwrap = (value) =>
    value && typeof value === "object" && !Array.isArray(value) && "value" in value ? value.value : value;

  const visit = (node, depth) => {
    if (!node || typeof node !== "object" || depth > 3) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item) => {
        if (!item || typeof item !== "object") {
          return;
        }
        const key = item.key ?? item.name ?? item.config_key ?? item.code;
        if (isSgrKey(key)) {
          out[key.toLowerCase()] = unwrap(item.value ?? item.config_value ?? item.val);
        } else {
          visit(item, depth + 1);
        }
      });
      return;
    }
    Object.entries(node).forEach(([key, value]) => {
      if (isSgrKey(key)) {
        out[key.toLowerCase()] = unwrap(value);
      } else if (value && typeof value === "object") {
        visit(value, depth + 1);
      }
    });
  };

  visit(raw, 0);
  return out;
};
