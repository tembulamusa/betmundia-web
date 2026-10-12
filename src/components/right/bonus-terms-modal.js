import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaGift } from 'react-icons/fa';
import { formatNumber } from '../utils/betslip';

// Turn a bonus rule from GET /bonuses into a readable line for a bonus terms modal.
const humanizeKey = (key) => String(key).replace(/_/g, ' ').replace(/^./, (ch) => ch.toUpperCase());
const humanizeValue = (value) => String(value).toLowerCase().replace(/_/g, ' ').replace(/^./, (ch) => ch.toUpperCase());
const BONUS_RULE_FORMATTERS = {
    bonus_amount: (v) => `Bonus amount: KSh ${formatNumber(v)}`,
    bonus_percentage: (v) => `Bonus: ${v}%`,
    bonus_contribution_percentage: (v) => `Bonus covers up to ${v}% of the stake`,
    cash_contribution_percentage: (v) => `Cash covers ${v}% of the stake`,
    minimum_odds_per_game: (v) => `Minimum odds per game: ${v}`,
    minimum_games: (v) => `Minimum games: ${v}`,
    maximum_games: (v) => `Maximum games: ${v}`,
    winnings_withdrawable: (v) => (v ? 'Winnings are withdrawable' : 'Winnings are not withdrawable'),
    deposit_frequency: (v) => `Deposit: ${humanizeValue(v)}`,
    expiry_hours: (v) => `Expires after ${v} hour${Number(v) === 1 ? '' : 's'}`,
    expiry_days: (v) => `Expires after ${v} day${Number(v) === 1 ? '' : 's'}`,
};

export const formatBonusRules = (rules) =>
    Object.entries(rules || {})
        .filter(([, rule]) => rule && rule.enabled !== false && rule.value !== undefined && rule.value !== null)
        .map(([key, rule]) => (BONUS_RULE_FORMATTERS[key]
            ? BONUS_RULE_FORMATTERS[key](rule.value)
            : `${humanizeKey(key)}: ${typeof rule.value === 'boolean' ? (rule.value ? 'Yes' : 'No') : rule.value}`));

/** Find a bonus from the GET /bonuses list by exact code, or by a pattern on code/name. */
export const findBonus = (bonuses, matcher) => {
    const list = (bonuses || []).filter((b) => b && b.active !== false);
    if (typeof matcher === 'string') {
        return list.find((b) => b.code === matcher) || null;
    }
    return list.find((b) => matcher.test(`${b.code || ''} ${b.name || ''}`)) || null;
};

export const DEPOSIT_BONUS_CODE = 'DAILY_DEPOSIT_BONUS';
export const MSHIPI_BONUS_PATTERN = /mshipi/i;

/** Modal showing the terms of ONE bonus (name, description, rules) from GET /bonuses. */
const BonusTermsModal = ({ show, onHide, bonus, title = 'Bonus Terms', intro = null }) => {
    const ruleLines = formatBonusRules(bonus?.rules);
    return (
        <Modal show={show} onHide={onHide} centered className="bonus-terms-modal">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>
                    <span className="bonus-terms-modal-title-icon" aria-hidden="true">
                        <FaGift />
                    </span>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {intro}
                {bonus ? (
                    <section className="bonus-terms-modal-section">
                        <h3>{bonus.name}</h3>
                        {bonus.description && (
                            <p className="bonus-terms-modal-desc">{bonus.description}</p>
                        )}
                        {ruleLines.length > 0 && (
                            <ul>
                                {ruleLines.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                ) : (
                    <p className="bonus-terms-modal-intro">Terms are not available right now. Please try again shortly.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="bonus-terms-modal-close" onClick={onHide}>
                    Got it
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default BonusTermsModal;
