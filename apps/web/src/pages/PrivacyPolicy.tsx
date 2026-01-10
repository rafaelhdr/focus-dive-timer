
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 container max-w-4xl mx-auto p-4 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-sm">
            <p className="font-medium">Effective date: 2025-06-03</p>
            
            <p>At FocusDive, we value your privacy and collect as little data as possible.</p>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">What We Collect</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We only collect your email address, and only when you sign up.</li>
                <li>We do not sell, share, or use your email for marketing.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
              <p className="mb-3">We use the following services to provide functionality:</p>
              <ul className="list-disc list-inside space-y-3 ml-4">
                <li>
                  <strong>Slack:</strong> Used to update your focus status automatically.{' '}
                  <a 
                    href="https://slack.com/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    See Slack's Privacy Policy.
                  </a>
                </li>
                <li>
                  <strong>AWS (SES):</strong> Used to send essential account-related emails (e.g., confirmations, alerts).{' '}
                  <a 
                    href="https://aws.amazon.com/privacy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    See AWS Privacy Policy.
                  </a>
                </li>
                <li>
                  <strong>DigitalOcean:</strong> Used to host our application and database infrastructure.{' '}
                  <a 
                    href="https://www.digitalocean.com/legal/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    See DigitalOcean's Privacy Policy.
                  </a>
                </li>
              </ul>
              <p className="mt-3">These services may collect data according to their own privacy terms. We don't control or store this data ourselves.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <p>You can request deletion of your account and associated email by contacting us at support@focusdive.app.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Data Storage</h2>
              <p>We store minimal data securely, with limited access and only for operational needs.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
