import React from "react";

const PromoCard = ({ promo, openModal }) => {
  const shortDescription = promo.description.slice(0, 220) + (promo.description.length > 220 ? " ..." : "");

  return (
    //<div className="relative bg-black-50 rounded-lg p-2 !pb-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-6 px-2 shadow-lg">
    <div className="relative rounded-lg p-2 !pb-0 w-full shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
      <div className="round overflow-hidden h-48">
        <img
          src={promo.image}
          alt={promo.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <h5 className="text-lg font-bold mb-2 text-white">{promo.title}</h5>
        <p className="mb-4 text-white">{shortDescription}</p>
        <button
          className="bg-transparent text-white border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition"
          onClick={() => openModal(promo)}
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default PromoCard;

