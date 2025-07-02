import React from "react";
import BrandSerialForm from "../components/home/BrandSerialForm";

const Home = () => {
  return (
    <div className="page-wrapper">
      <div className="text-center mb-4">
        <h2>Decode Your Guitar's History</h2>
        <p>
          Enter your guitar's brand and serial number below to discover its
          manufacturing year, model information, and origin.
        </p>
      </div>

      <BrandSerialForm />

      <div className="text-center mt-4">
        <p style={{ fontSize: "0.875rem", color: "#666" }}>
          Currently supporting major brands including Fender, Gibson, Martin,
          Taylor, and more.
        </p>
      </div>
    </div>
  );
};

export default Home;
