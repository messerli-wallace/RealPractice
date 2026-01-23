import React, { useContext, createContext, useState, ReactNode } from "react";

interface UIState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface UIContextType {
  uiState: UIState;
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearMessages: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIContextProviderProps {
  children: ReactNode;
}

export const UIContextProvider = ({ children }: UIContextProviderProps) => {
  const [uiState, setUiState] = useState<UIState>({
    isLoading: false,
    error: null,
    successMessage: null,
  });

  const showLoading = () => {
    setUiState((prev) => ({ ...prev, isLoading: true }));
  };

  const hideLoading = () => {
    setUiState((prev) => ({ ...prev, isLoading: false }));
  };

  const showError = (message: string) => {
    setUiState((prev) => ({
      ...prev,
      error: message,
      successMessage: null,
    }));
  };

  const showSuccess = (message: string) => {
    setUiState((prev) => ({
      ...prev,
      successMessage: message,
      error: null,
    }));
  };

  const clearMessages = () => {
    setUiState((prev) => ({
      ...prev,
      error: null,
      successMessage: null,
    }));
  };

  return (
    <UIContext.Provider
      value={{
        uiState,
        showLoading,
        hideLoading,
        showError,
        showSuccess,
        clearMessages,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
