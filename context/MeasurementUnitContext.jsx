import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { fsdb } from "../firebaseConfig";

const MeasurementUnitContext = createContext(); 

export const MeasurementUnitProvider = ({ children }) => {
  const { user, updateSetting } = useAuth();
  const [temperatureUnit, setTemperatureUnit] = useState("C");

  // Fetch theme from Firestore on mount or user change
  useEffect(() => {
    if (user) {
      const fetchMeasurementUnit = async () => {
        try {
          const userDocRef = doc(fsdb, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data(); 
            setTemperatureUnit(data.measurementUnit || 'C');
          }
        } catch (error) {
          console.error('Error fetching theme:', error);
        }
      };

      fetchMeasurementUnit();
    } else {
      setTemperatureUnit('C'); 
    }
  }, [user]);

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
