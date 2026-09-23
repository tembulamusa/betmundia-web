import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Notify from "./utils/Notify";
import {
    fetchSurvivorChallenge,
    fetchSurvivorChallenges,
    fetchSurvivorProgress,
    fetchSurvivorResults,
    joinSurvivorChallenge,
    submitSurvivorPick,
} from "./utils/survivor-data";

const SurvivorLobby = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSurvivorChallenges()
            .then((res) => setChallenges(res?.data || []))
            .catch(() => Notify({ status: 400, message: "Could not load survivor challenges" }))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-3">Loading survivor challenges…</div>;
    }

    return (
        <div className="p-3">
            <h1>Survivor Challenge</h1>
            {challenges.length === 0 && <p>No open challenges right now.</p>}
            <ul className="list-unstyled">
                {challenges.map((c) => (
                    <li key={c.id} className="mb-3 border rounded p-3">
                        <Link to={`/survivor/${c.id}`}>{c.name}</Link>
                        <div>Entry: Ksh {c.entry_stake}</div>
                        <div>Prize pool: Ksh {c.current_prize_pool}</div>
                        <div>Players: {c.participant_count}</div>
                        <div>Status: {c.status}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SurvivorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [progress, setProgress] = useState(null);
    const [results, setResults] = useState(null);
    const [selection, setSelection] = useState("1");
    const [tab, setTab] = useState("play");

    const load = () => {
        fetchSurvivorChallenge(id).then((res) => setDetail(res?.data)).catch(() => {});
        fetchSurvivorProgress(id).then((res) => setProgress(res?.data)).catch(() => {});
        fetchSurvivorResults(id).then((res) => setResults(res?.data)).catch(() => {});
    };

    useEffect(() => {
        load();
    }, [id]);

    const currentGame = detail?.current_game_number;
    const game = detail?.games?.find((g) => g.game_number === currentGame);

    const onJoin = async () => {
        try {
            const res = await joinSurvivorChallenge(id);
            if (res?.result === "Success") {
                Notify({ status: 200, message: "Joined survivor challenge" });
                load();
            } else {
                Notify({ status: 400, message: res?.error?.message || "Join failed" });
            }
        } catch {
            Notify({ status: 400, message: "Join failed" });
        }
    };

    const onPick = async () => {
        try {
            const res = await submitSurvivorPick(id, currentGame, selection);
            if (res?.result === "Success") {
                Notify({ status: 200, message: "Pick saved" });
                load();
            } else {
                Notify({ status: 400, message: res?.error?.message || "Could not save pick" });
            }
        } catch {
            Notify({ status: 400, message: "Could not save pick" });
        }
    };

    if (!detail) {
        return <div className="p-3">Loading…</div>;
    }

    return (
        <div className="p-3">
            <button type="button" className="btn btn-link p-0 mb-2" onClick={() => navigate("/survivor")}>
                ← Back
            </button>
            <h1>{detail.name}</h1>
            <p>{detail.description}</p>
            <div>Prize pool: Ksh {detail.current_prize_pool}</div>
            <div>Game {detail.current_game_number} of {detail.maximum_games}</div>

            {!progress?.enrolled && detail.status === "OPEN" && (
                <button type="button" className="btn btn-primary mt-2" onClick={onJoin}>
                    Join (Ksh {detail.entry_stake})
                </button>
            )}

            {progress?.enrolled && (
                <div className="mt-2">
                    <div>Your status: {progress.participant_status}</div>
                    <div>Games survived: {progress.games_survived}</div>
                </div>
            )}

            <div className="btn-group mt-3 mb-3">
                <button type="button" className={`btn btn-sm ${tab === "play" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("play")}>Pick</button>
                <button type="button" className={`btn btn-sm ${tab === "results" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("results")}>Results</button>
            </div>

            {tab === "play" && progress?.enrolled && game && (
                <div>
                    <div>Match #{game.parent_match_id} — {game.status}</div>
                    {game.status === "OPEN_FOR_PICKS" || game.status === "SCHEDULED" ? (
                        <>
                            <select className="form-select w-auto mt-2" value={selection} onChange={(e) => setSelection(e.target.value)}>
                                <option value="1">Home (1)</option>
                                <option value="X">Draw (X)</option>
                                <option value="2">Away (2)</option>
                            </select>
                            <button type="button" className="btn btn-success ms-2" onClick={onPick}>Submit pick</button>
                        </>
                    ) : (
                        <p className="text-muted">Picks locked for this game.</p>
                    )}
                </div>
            )}

            {tab === "results" && results && (
                <div>
                    <div>Survivors remaining: {results.survivors_remaining}</div>
                    <div>Total entries: {results.participant_count}</div>
                </div>
            )}
        </div>
    );
};

export default function Survivor() {
    const { id } = useParams();
    return id ? <SurvivorDetail /> : <SurvivorLobby />;
}
