
export const getCommonHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const API_URL = import.meta.env.VITE_API_URL || "https://api.focusdive.app";
