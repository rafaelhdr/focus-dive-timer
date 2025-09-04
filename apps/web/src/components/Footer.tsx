
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background py-6 mt-auto">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-sm text-muted-foreground px-4">
        <Link to="/privacy-policy">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
            Privacy Policy
          </Button>
        </Link>

        <Link to="/terms-of-service">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
            Terms of Service
          </Button>
        </Link>

        <Link to="/sub-processors">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
            Sub-processors
          </Button>
        </Link>

        <Link to="/support">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
            Support
          </Button>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
