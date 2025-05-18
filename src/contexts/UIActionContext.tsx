
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UIActionContextType {
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (isOpen: boolean) => void;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (isOpen: boolean) => void;
}

const UIActionContext = createContext<UIActionContextType | undefined>(undefined);

interface UIActionProviderProps {
  children: ReactNode;
}

export const UIActionProvider: React.FC<UIActionProviderProps> = ({ children }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const value = {
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    showWelcomeModal,
    setShowWelcomeModal,
  };

  return (
    <UIActionContext.Provider value={value}>
      {children}
    </UIActionContext.Provider>
  );
};

export const useUIActions = (): UIActionContextType => {
  const context = useContext(UIActionContext);
  if (context === undefined) {
    throw new Error('useUIActions must be used within a UIActionProvider');
  }
  return context;
};
