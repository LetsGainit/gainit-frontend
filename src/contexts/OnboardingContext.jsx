import React, { createContext, useState } from "react";

export const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const setRole = (role) => {
    setSelectedRole(role);
  };

  const clearRole = () => {
    setSelectedRole(null);
  };

  const value = {
    selectedRole,
    setRole,
    clearRole,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
