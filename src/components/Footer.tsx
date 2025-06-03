
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background py-6 mt-auto">
      <div className="container max-w-4xl mx-auto flex justify-center items-center gap-6 text-sm text-muted-foreground">
        <Link to="/privacy-policy">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Button>
        </Link>

        <Link to="/support">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Support
          </Button>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
