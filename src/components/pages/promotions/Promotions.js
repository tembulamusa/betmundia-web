import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import PadlockIcon from "../../../assets/svg/padlock.svg";
import PromoCard from "./PromoCard";
import PromoModal from "./PromoModal";
import { promoData } from "./promoData";
import "../../../assets/css/promotions-page.css";

const Promotions = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const openModal = (promo) => {
    setSelectedPromo(promo);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPromo(null);
    setShowModal(false);
  };

  return (
    <section className="promotions-page">
      <header className="promotions-page__header">
        <button
          type="button"
          className="promotions-page__back"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>
        <h1 className="promotions-page__title">Promotions</h1>
        <span className="promotions-page__header-spacer" aria-hidden="true" />
      </header>
      <div className="promotions-page__body">
        <div className="promotions-page__list">
          {promoData.map((promo, index) => (
            <PromoCard key={index} promo={promo} openModal={openModal} />
          ))}
        </div>
        <div className="promotions-page__security">
          <div className="promotions-page__security-icon">
            <img src={PadlockIcon} alt="" />
          </div>
          <div>
            <p className="promotions-page__security-title">Your transactions are secure and encrypted</p>
            <p className="promotions-page__security-copy">We never share your details with anyone.</p>
          </div>
        </div>
      </div>
      <PromoModal show={showModal} handleClose={closeModal} promo={selectedPromo} />
    </section>
  );
};

export default Promotions;
