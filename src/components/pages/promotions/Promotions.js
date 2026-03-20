import React, { useState } from "react";

import PromoCard from "./PromoCard";
import PromoModal from "./PromoModal";
import { promoData } from "./promoData";

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
    <>
      <div className="bg-[rgba(255,255,255,0.1)] shadow-sm p-4 text-center mb-4">
        <h4>Promotions</h4>
      </div>
      <div className="flex flex-wrap justify-center gap-4 px-4">
        {promoData.map((promo, index) => (
          <PromoCard key={index} promo={promo} openModal={openModal} />
        ))}
      </div>
      <PromoModal show={showModal} handleClose={closeModal} promo={selectedPromo} />
    </>
  );
};

export default Promotions;
