import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const MeasurementUnitContext = createContext();

export const MeasurementUnitProvider = ({ children }) => {
  const { user, updateSetting } = useAuth();
  const [temperatureUnit, setTemperatureUnit] = useState("C");

  // Toggle unit and update Firestore if logged in
  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => {
      const newUnit = prev === "C" ? "F" : "C";

      if (user) {
        updateSetting("measurementUnit", newUnit);
      }

      return newUnit;
    });
  };

  // Format temperature according to current unit
  const formatTemperature = tempCelsius => {
    return temperatureUnit === "F"
      ? Math.round((tempCelsius * 9) / 5 + 32)
      : Math.round(tempCelsius);
  };

  return (
    <MeasurementUnitContext.Provider
      value={{
        temperatureUnit,
        toggleTemperatureUnit,
        formatTemperature,
      }}
    >
      {children}
    </MeasurementUnitContext.Provider>
  );
};

export const useMeasurementUnit = () => useContext(MeasurementUnitContext);
