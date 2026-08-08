import React from "react";

const promoDisplayContent = {
  "Free Bet": {
    eyebrow: "Free Bet",
    title: "JOIN GET FREE BONUS",
    summary: "Join today and get up to",
    accent: "KES 200 Free!",
    detailSummary: "Join today and get up to KES 200 Free!",
    anchor: "karibu-bonus"
  },
  "Aviator Rains": {
    eyebrow: "Aviator Rains",
    title: "THE MORE IT RAINS, THE MORE YOU WIN",
    summary: "Bet on Aviator and multiply your winnings!",
    anchor: "aviator-rains"
  },
  "Mshipi Bonus": {
    eyebrow: "Mshipi Bonus",
    title: "SELECT 4 OR MORE GAMES AND GET A MSHIPI BONUS",
    summary: "Add more games to your bet slip and increase your bonus!",
    anchor: "mshipi-bonus"
  },
  "100% CASH STAKE BACK": {
    eyebrow: "Cashback Bonus",
    title: "GET CASHBACK BONUS.",
    summary: "100% Cash Stake Back",
    detailTitle: "GET CASHBACK BONUS, 100% CASH STAKE BACK",
    detailSummary: "Place cash multi-bets with 6+ selections and get 100% cashback.",
    anchor: "cashback-bonus"
  },
  "GET 50% DEPOSIT BONUS": {
    eyebrow: "Daily Deposit Bonus",
    title: "50% DAILY DEPOSIT BONUS",
    summary: "Get 50% bonus on your first successful deposit of the day.",
    anchor: "deposit-bonus"
  }
};

const fallbackDisplay = (promo) => ({
  eyebrow: promo.title,
  title: promo.title.toUpperCase(),
  summary: promo.description.replace(/\s+/g, " ").trim(),
  anchor: promo.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
});

const PromoCard = ({ promo, openModal }) => {
  const content = promoDisplayContent[promo.title] || fallbackDisplay(promo);
  const detailTitle = content.detailTitle || content.title;
  const detailSummary = content.detailSummary || content.summary;

  return (
    <article className="promo-card" id={content.anchor}>
      <div className="promo-card__media">
        <img src={promo.image} alt={promo.title} className="promo-card__image" />
        <div className="promo-card__overlay" />
        <div className="promo-card__desktop-copy">
          <p className="promo-card__eyebrow">{content.eyebrow}</p>
          <h5 className="promo-card__headline">{content.title}</h5>
          <p className="promo-card__summary">
            {content.summary}
            {content.accent ? <span className="promo-card__accent"> {content.accent}</span> : null}
          </p>
        </div>
        <span className="promo-card__badge">18+</span>
      </div>
      <div className="promo-card__body">
        <p className="promo-card__eyebrow promo-card__eyebrow--body">{content.eyebrow}</p>
        <h5 className="promo-card__detail-title">{detailTitle}</h5>
        <p className="promo-card__detail-summary">{detailSummary}</p>
        <div className="promo-card__actions">
          <button type="button" className="promo-card__primary-button" onClick={() => openModal(promo)}>
            <span>See More</span>
            <span className="promo-card__button-arrow">›</span>
          </button>
          <button type="button" className="promo-card__secondary-link" onClick={() => openModal(promo)}>
            <span>Tell me more</span>
            <span className="promo-card__secondary-arrow">›</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default PromoCard;

