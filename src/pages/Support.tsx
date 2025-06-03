
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
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Need help?</h2>
              <p className="mb-4">
                If you have any questions, suggestions, or run into any issues with FocusDive, feel free to reach out:
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-lg">
                  📧{' '}
                  <a 
                    href="mailto:support@focusdive.app" 
                    className="text-primary hover:underline"
                  >
                    support@focusdive.app
                  </a>
                </p>
              </div>
              
              <p className="text-muted-foreground">
                We'll get back to you as soon as possible!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Support;
