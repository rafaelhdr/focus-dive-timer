
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 container max-w-4xl mx-auto p-4 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Support</h1>
          
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Support functionality coming soon...</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Support;
