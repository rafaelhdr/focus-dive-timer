
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const SubProcessors = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 container max-w-4xl mx-auto p-4 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Sub-processors</h1>
          
          <div className="space-y-6">
            <p>To provide and operate the FocusDive service, we rely on a few trusted third-party service providers ("sub-processors") who process limited personal data on our behalf.</p>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Slack</h2>
              <div className="space-y-2">
                <p><strong>Purpose:</strong> Slack integration (status automation)</p>
                <p><strong>Data Processed:</strong> Slack user ID, OAuth token</p>
                <p><strong>Location:</strong> United States</p>
                <p>
                  <strong>Privacy Policy:</strong>{' '}
                  <a 
                    href="https://slack.com/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://slack.com/privacy-policy
                  </a>
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">2. Stripe</h2>
              <div className="space-y-2">
                <p><strong>Purpose:</strong> Payment processing</p>
                <p><strong>Data Processed:</strong> Billing information (handled directly by Stripe)</p>
                <p><strong>Location:</strong> United States</p>
                <p>
                  <strong>Privacy Policy:</strong>{' '}
                  <a 
                    href="https://stripe.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://stripe.com/privacy
                  </a>
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">3. DigitalOcean</h2>
              <div className="space-y-2">
                <p><strong>Purpose:</strong> Application and database hosting</p>
                <p><strong>Data Processed:</strong> Email, Slack user ID, encrypted Slack token</p>
                <p><strong>Location:</strong> Netherlands (AMS3) or nearest data center</p>
                <p>
                  <strong>Privacy Policy:</strong>{' '}
                  <a 
                    href="https://www.digitalocean.com/legal/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://www.digitalocean.com/legal/privacy-policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SubProcessors;
