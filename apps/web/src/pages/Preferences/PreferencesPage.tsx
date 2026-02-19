import { Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { usePreferences } from '@focusdive/preferences';
import PreferencesCards from './components/PreferencesCards';

const Preferences = () => {
  const { isLoading } = usePreferences();

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4 transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 flex flex-col items-center w-full max-w-md">
        <header className="mb-8 text-center w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Preferences</h1>
          <p className="text-muted-foreground">Customize your Focus Dive experience</p>
        </header>

        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <PreferencesCards />
        )}

      </div>
    </div>
  );
};

export default Preferences;
