import React, { useState } from "react";

import PadlockIcon from "../../../assets/svg/padlock.svg";
import PromoCard from "./PromoCard";
import PromoModal from "./PromoModal";
import { promoData } from "./promoData";
import "../../../assets/css/promotions-page.css";

const Promotions = () => {
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
      <div className="promotions-page__header">
        <h4 className="promotions-page__title">Promotions</h4>
      </div>
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
      <PromoModal show={showModal} handleClose={closeModal} promo={selectedPromo} />
    </section>
  );
};

export default Promotions;
