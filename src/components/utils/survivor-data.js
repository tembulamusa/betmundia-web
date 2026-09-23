import makeRequest from "./fetch-request";

export const fetchSurvivorChallenges = () =>
    makeRequest({ url: "/survivor/challenges", method: "GET", api_version: 2 });

export const fetchSurvivorChallenge = (id) =>
    makeRequest({ url: `/survivor/challenges/${id}`, method: "GET", api_version: 2 });

export const fetchSurvivorProgress = (id) =>
    makeRequest({ url: `/user/survivor/challenges/${id}/progress`, method: "GET", api_version: 2, use_jwt: true });

export const joinSurvivorChallenge = (id) =>
    makeRequest({ url: `/user/survivor/challenges/${id}/join`, method: "POST", api_version: 2, use_jwt: true });

export const submitSurvivorPick = (id, gameNumber, selection) =>
    makeRequest({
        url: `/user/survivor/challenges/${id}/games/${gameNumber}/prediction`,
        method: "POST",
        api_version: 2,
        use_jwt: true,
        data: { selection },
    });

export const fetchSurvivorResults = (id) =>
    makeRequest({ url: `/survivor/challenges/${id}/results`, method: "GET", api_version: 2 });
