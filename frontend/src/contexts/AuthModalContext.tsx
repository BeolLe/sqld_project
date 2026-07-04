import { createContext, useContext } from 'react';
import type { AuthMode } from '../types';

type AuthModalContextType = {
  openAuthModal: (mode: AuthMode) => void;
};

const AuthModalContext = createContext<AuthModalContextType>({
  openAuthModal: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);
export default AuthModalContext;
