import { useEffect, useState } from 'react';
import makeRequest from './fetch-request';

let cachedCatalog = null;
let inflight = null;

export function findBonusRule(catalog, bonusCode, ruleKey) {
    const entry = catalog?.bonuses?.find((b) => b.code === bonusCode);
    const rule = entry?.rules?.[ruleKey];
    return rule?.enabled ? rule.value : null;
}

export function useBonusCatalog() {
    const [catalog, setCatalog] = useState(cachedCatalog);
    const [loading, setLoading] = useState(!cachedCatalog);

    useEffect(() => {
        if (cachedCatalog) {
            setCatalog(cachedCatalog);
            setLoading(false);
            return;
        }
        if (inflight) {
            inflight.then((data) => {
                setCatalog(data);
                setLoading(false);
            });
            return;
        }
        inflight = makeRequest({ url: '/bonuses', method: 'GET', api_version: 2 })
            .then(([status, response]) => {
                if (status === 200 && response?.data) {
                    cachedCatalog = response.data;
                    return cachedCatalog;
                }
                return null;
            })
            .catch(() => null)
            .finally(() => {
                inflight = null;
            });
        inflight.then((data) => {
            setCatalog(data);
            setLoading(false);
        });
    }, []);

    const depositBonus = catalog?.bonuses?.find((b) => b.code === 'DAILY_DEPOSIT_BONUS');
    const bonusStakePct = depositBonus?.rules?.bonus_contribution_percentage?.value ?? 30;
    const cashStakePct = depositBonus?.rules?.cash_contribution_percentage?.value ?? 70;
    const minOdds = depositBonus?.rules?.minimum_odds_per_game?.value ?? 1.5;
    const maxGames = depositBonus?.rules?.maximum_games?.value ?? 3;
    const minGames = depositBonus?.rules?.minimum_games?.value ?? 1;
    const expiryHours = depositBonus?.rules?.expiry_hours?.value ?? 24;

    return {
        catalog,
        loading,
        bonusStakePct,
        cashStakePct,
        minOdds,
        maxGames,
        minGames,
        expiryHours,
    };
}
