import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fsdb } from '../firebaseConfig';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { plantMascotImages } from '../components/plantMascotImages';

export const PlantContext = createContext();

export const PlantProvider = ({ children }) => {
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  const plantsCollectionRef = user
    ? collection(fsdb, 'users', user.uid, 'plants')
    : null;

  // Load plants from Firestore
  useEffect(() => {
    const fetchPlants = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const snapshot = await getDocs(plantsCollectionRef);
        const plantList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Map imageIndex to local require() image
            image: plantMascotImages[data.imageIndex] || plantMascotImages[0],
          };
        });
        setPlants(plantList);
        if (!selectedPlant && plantList.length > 0) {
          setSelectedPlant(plantList[0]);
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [user]);

  // Add a new plant
  const addPlant = async (plant) => {
    if (!user) return;

    try {
      const plantToSave = {
        ...plant,
        imageIndex: plant.imageIndex || 0, // store index in Firestore
      };

      const docRef = await addDoc(plantsCollectionRef, plantToSave);

      const newPlant = {
        id: docRef.id,
        ...plantToSave,
        image: plantMascotImages[plantToSave.imageIndex]
      };

      setPlants(prev => [...prev, newPlant]);

      // Auto-select the newly added plant if no plant is currently selected
      if (!selectedPlant) {
        setSelectedPlant(newPlant);
      }
    } catch (error) {
      console.error('Error adding plant:', error);
    }
  };

  // Update an existing plant
  const updatePlant = async (id, updatedPlant) => {
    if (!user) return;
    try {
      const docRef = doc(fsdb, 'users', user.uid, 'plants', id);

      const plantToUpdate = {
        ...updatedPlant,
        imageIndex: updatedPlant.imageIndex ?? 0,
      };

      await updateDoc(docRef, plantToUpdate);

      setPlants(prev =>
        prev.map(p =>
          p.id === id ? { ...p, ...plantToUpdate, image: plantMascotImages[plantToUpdate.imageIndex] } : p
        )
      );

      if (selectedPlant?.id === id) {
        setSelectedPlant(prev => ({
          ...prev,
          ...plantToUpdate,
          image: plantMascotImages[plantToUpdate.imageIndex],
        }));
      }
    } catch (error) {
      console.error('Error updating plant:', error);
    }
  };

  // Delete a plant
  const deletePlant = async (id) => {
    if (!user) return;
    try {
      const docRef = doc(fsdb, 'users', user.uid, 'plants', id);
      await deleteDoc(docRef);

      setPlants(prev => {
        const newPlants = prev.filter(p => p.id !== id);
        if (selectedPlant?.id === id) setSelectedPlant(newPlants[0] || null);
        return newPlants;
      });
    } catch (error) {
      console.error('Error deleting plant:', error);
    }
  };

  // Select a plant
  const selectPlant = (plant) => setSelectedPlant(plant);

  return (
    <PlantContext.Provider
      value={{
        plants,
        addPlant,
        updatePlant,
        deletePlant,
        selectedPlant,
        selectPlant,
        loading,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlants = () => React.useContext(PlantContext);

