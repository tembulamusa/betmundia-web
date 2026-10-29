import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { FaArrowLeft, FaEnvelope, FaSms } from 'react-icons/fa';
import {
    REACTIVATION_SMS_BODY,
    SMS_SHORTCODE,
    SUPPORT_EMAIL,
} from '../../utils/account-frozen';

const smsHref = `sms:${SMS_SHORTCODE}?body=${encodeURIComponent(REACTIVATION_SMS_BODY)}`;
const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Account reactivation request')}`;

const ReactivateAccount = () => {
    const navigate = useNavigate();

    return (
        <div className="reactivate-account-page">
            <header className="reactivate-account-header">
                <IconButton
                    className="reactivate-account-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </IconButton>
                <h1 className="reactivate-account-header-title">Reactivate your account</h1>
                <span aria-hidden="true" />
            </header>

            <div className="reactivate-account-inner">
                <p className="reactivate-account-lead">
                    If your BetMundial account is frozen, use either option below to request
                    reactivation. Support will review your request and help you get back in.
                </p>

                <section className="reactivate-account-step">
                    <p className="reactivate-account-step-label">Option 1</p>
                    <h2 className="reactivate-account-step-title">Email support</h2>
                    <p>
                        Send an email to{' '}
                        <a href={mailtoHref} style={{ color: '#ff52d4' }}>
                            {SUPPORT_EMAIL}
                        </a>{' '}
                        and ask to reactivate your account.
                    </p>
                    <div className="reactivate-account-actions">
                        <a className="ra-primary" href={mailtoHref}>
                            <FaEnvelope aria-hidden="true" /> Email {SUPPORT_EMAIL}
                        </a>
                    </div>
                </section>

                <p className="reactivate-account-or">or</p>

                <section className="reactivate-account-step">
                    <p className="reactivate-account-step-label">Option 2</p>
                    <h2 className="reactivate-account-step-title">SMS shortcode {SMS_SHORTCODE}</h2>
                    <p>
                        Send an SMS to <strong>{SMS_SHORTCODE}</strong> with this exact message:
                    </p>
                    <span className="reactivate-account-quote">{REACTIVATION_SMS_BODY}</span>
                    <div className="reactivate-account-actions">
                        <a className="ra-secondary" href={smsHref}>
                            <FaSms aria-hidden="true" /> Open SMS to {SMS_SHORTCODE}
                        </a>
                    </div>
                </section>

                <p className="reactivate-account-note">
                    After you send your request, wait for confirmation from support before trying
                    to log in again.
                </p>
            </div>
        </div>
    );
};

export default ReactivateAccount;
