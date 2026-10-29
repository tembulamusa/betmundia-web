import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { FaArrowLeft, FaStar } from 'react-icons/fa';

const LoyaltyPointsHowToUse = () => {
    const navigate = useNavigate();

    return (
        <div className="loyalty-points-page">
            <header className="loyalty-points-header">
                <IconButton
                    className="loyalty-points-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </IconButton>
                <h1 className="loyalty-points-header-title">How to use loyalty points</h1>
                <span aria-hidden="true" />
            </header>

            <div className="loyalty-points-inner">
                <p className="loyalty-points-lead">
                    Loyalty points reward your activity on Betmundial. Track your balance in
                    the wallet, then use points toward available rewards.
                </p>

                <section className="loyalty-points-step">
                    <p className="loyalty-points-step-label">Earn</p>
                    <h2 className="loyalty-points-step-title">How to earn points</h2>
                    <ul>
                        <li>Place eligible sports and casino bets with your cash balance.</li>
                        <li>Complete qualifying deposits and account milestones when offered.</li>
                        <li>Join promotions and campaigns that list loyalty points as a reward.</li>
                        <li>Points are credited after bets settle or after the promotion rules are met.</li>
                    </ul>
                </section>

                <section className="loyalty-points-step">
                    <p className="loyalty-points-step-label">Use</p>
                    <h2 className="loyalty-points-step-title">How to use points</h2>
                    <ul>
                        <li>Redeem points for bonuses, free bets, or rewards shown in Promotions.</li>
                        <li>Open the Promotions page to see current redemption options and costs.</li>
                        <li>Points are not cash and cannot be withdrawn directly.</li>
                        <li>Some rewards may require a minimum points balance or active account status.</li>
                    </ul>
                    <div className="loyalty-points-actions">
                        <Link className="lp-primary" to="/promotions">
                            <FaStar aria-hidden="true" /> View Promotions
                        </Link>
                    </div>
                </section>

                <p className="loyalty-points-note">
                    Offer details can change. Check each promotion for exact earn rates, expiry,
                    and redemption rules.
                </p>
            </div>
        </div>
    );
};

export default LoyaltyPointsHowToUse;
