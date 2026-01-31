import { Metadata } from "./metadata";
import { AppStoreProvider } from "@/store/app-store";

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return (
    <AppStoreProvider>
      <Metadata />
      {children}
    </AppStoreProvider>
  );
}
