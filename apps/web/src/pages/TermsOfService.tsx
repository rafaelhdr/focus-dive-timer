
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 container max-w-4xl mx-auto p-4 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <div className="space-y-6">
            <p className="font-medium">Effective date: 2025-06-03</p>
            
            <p>Welcome to FocusDive. By using our service, you agree to the following terms:</p>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">2. User Responsibilities</h2>
              <p>You agree to use FocusDive only for lawful purposes and not abuse or interfere with the service.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">3. Account</h2>
              <p>You are responsible for keeping your account information (such as your email) accurate and secure.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
              <p className="mb-3">We use Slack, AWS, and DigitalOcean as part of our service:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Slack:</strong> for focus automation</li>
                <li><strong>AWS:</strong> for sending essential account-related emails</li>
                <li><strong>DigitalOcean:</strong> for hosting our application and database</li>
              </ul>
              <p className="mt-3">Your use of these services is also subject to their terms.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">5. Termination</h2>
              <p>We reserve the right to suspend or terminate your account if you misuse the service.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">6. No Warranties</h2>
              <p>FocusDive is provided "as is". We don't guarantee uptime, performance, or error-free operation.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p>We are not liable for any indirect, incidental, or consequential damages resulting from your use of the service.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">8. Changes</h2>
              <p>We may update these terms from time to time. We'll notify you of major changes.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
