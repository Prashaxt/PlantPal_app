import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { ref, get, set, onValue, off } from "firebase/database";
import { db } from '../firebaseConfig';
console.log('Imported db:', db);

import { AppState } from "react-native";
import { PlantContext } from "../context/PlantContext";

export const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [hardwareData, setHardwareData] = useState(null);
  const [hardwareActive, setHardwareActive] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const { selectedPlant } = useContext(PlantContext);
  const hardwareId = selectedPlant?.hardwareId;

  const lastKnownUpdate = useRef(null);
  const dataListenerRef = useRef(null);

  if (!db) {
    console.error("[FIREBASE] DB not initialized! Check firebaseConfig.js");
    return (
      <ConnectionContext.Provider value={{ hardwareData: null, hardwareActive: false, updateMotorStatus: () => { } }}>
        {children}
      </ConnectionContext.Provider>
    );
  }


  // HANDLE APP STATE CHANGES (appActive true/false)
  useEffect(() => {
    if (!hardwareId) {
      console.log("[AppState] No hardwareId found.");
      return;
    }

    const handleAppStateChange = async (nextState) => {
      try {
        setAppState(nextState);
        console.log("[AppState] changed to:", nextState);
        if (nextState === "active") {
          console.log(`[RTDB] Setting ${hardwareId}/appActive = true`);
          await set(ref(db, `/${hardwareId}/appActive`), true);
        } else if (nextState.match(/inactive|background/)) {
          console.log(`[RTDB] Setting ${hardwareId}/appActive = false`);
          await set(ref(db, `/${hardwareId}/appActive`), false);
        }
      } catch (error) {
        console.error("[ERROR] Failed updating appActive:", error);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    // Set active on mount
    (async () => {
      try {
        console.log(`[RTDB] Initial appActive = true for ${hardwareId}`);
        await set(ref(db, `/${hardwareId}/appActive`), true);
      } catch (error) {
        console.error("[ERROR] Initial appActive write failed:", error);
      }
    })();

    return () => {
      subscription?.remove();
      (async () => {
        try {
          if (hardwareId) {
            console.log(`[RTDB] Setting appActive = false for ${hardwareId} on cleanup`);
            await set(ref(db, `/${hardwareId}/appActive`), false);
          }
        } catch (error) {
          console.error("[ERROR] Cleanup appActive write failed:", error);
        }
      })();
    };
  }, [hardwareId]);


  //  REAL-TIME LISTENER FOR HARDWARE DATA
  useEffect(() => {
    if (!hardwareId) {
      console.log("[LISTENER] No hardwareId to listen.");
      setHardwareData(null);
      setHardwareActive(false);
      return;
    }

    const hardwareRef = ref(db, `/${hardwareId}`);

    // Helper to check lastUpdate for activity
    const handleUpdateCheck = (data) => {
      const newUpdateRaw = data?.sensorData?.lastUpdate;
      if (!newUpdateRaw) {
        console.log("[ERROR] sensorData.lastUpdate missing or null.");
        setHardwareActive(false);
        return;
      }

      // Convert to number safely (works for both string ISO and numeric timestamp)
      const newUpdate = Number(newUpdateRaw);
      if (Number.isNaN(newUpdate)) {
        console.log("[ERROR] lastUpdate is not a valid number:", newUpdateRaw);
        setHardwareActive(false);
        return;
      }

      if (lastKnownUpdate.current === null) {
        console.log("[STATUS] First value → assuming active");
        lastKnownUpdate.current = newUpdate;
        setHardwareActive(true);
        return;
      }
      if (newUpdate > lastKnownUpdate.current) {        
        console.log("[ACTIVE] Timestamp increased:", newUpdate);
        lastKnownUpdate.current = newUpdate;
        setHardwareActive(true);
      } else {
        console.log("[STATUS] Hardware inactive (lastUpdate unchanged):", newUpdate);
        setHardwareActive(false);
      }
    };

    // Initial fetch to check existence
    (async () => {
      try {
        const snapshot = await get(hardwareRef);
        if (!snapshot.exists()) {
          console.log(`[LISTENER] No data found at /${hardwareId}`);
          setHardwareData(null);
          setHardwareActive(false);
          return;
        }
        const data = snapshot.val();
        setHardwareData(data);
        handleUpdateCheck(data);
      } catch (error) {
        console.error("[ERROR] Initial fetch failed:", error);
        setHardwareActive(false);
      }
    })();

    // Set up real-time listener
    dataListenerRef.current = onValue(
      hardwareRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log(`[LISTENER] Data removed at /${hardwareId}`);
          setHardwareData(null);
          setHardwareActive(false);
          return;
        }
        const data = snapshot.val();
        console.log("[LISTENER] Data updated:", data?.sensorData?.lastUpdate);
        setHardwareData(data);
        handleUpdateCheck(data);
      },
      (error) => {
        console.error("[ERROR] Listener error:", error);
        setHardwareActive(false);
      }
    );



    return () => {
      if (dataListenerRef.current) {
        off(hardwareRef, "value", dataListenerRef.current);  // Clean detach
        console.log("[LISTENER] Detached from /", hardwareId);
      }
      lastKnownUpdate.current = null;  // Reset on unmount
    };
  }, [hardwareId]);  // Re-attach on hardwareId change


  // WRITE motorStatus

  const updateMotorStatus = async (status) => {
    if (!hardwareId) {
      console.log("[ERROR] Cannot update motorStatus: no hardwareId.");
      return;
    }
    try {
      console.log(`[RTDB] Writing motorStatus = ${status} for ${hardwareId}`);
      await set(ref(db, `/${hardwareId}/motorData/motorStatus`), status);
    } catch (error) {
      console.error("[ERROR] Failed updating motorStatus:", error);
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        hardwareData, // sensorData + motorData + appActive
        hardwareActive, // true/false based on lastUpdate
        updateMotorStatus, // motor control
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};