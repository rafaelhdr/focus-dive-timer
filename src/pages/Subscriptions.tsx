
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users, Calendar, Siren, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/env';
import { getCommonHeaders } from '@/utils/apiUtils';
import Navigation from '@/components/Navigation';

const SubscriptionsPage: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async () => {
    if (!auth.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to Premium.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/subscriptions/create-checkout-session`, {
        method: 'POST',
        headers: getCommonHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          lookup_key: billingPeriod === 'monthly' ? 'focusdive_premium_monthly' : 'focusdive_premium_yearly'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      // Open checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Could not initiate checkout. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamRequest = async () => {
    if (!auth.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to request team pricing.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/subscriptions/request-for-teams`, {
        method: 'POST',
        headers: getCommonHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to submit team request');
      }

      toast({
        title: "Request Sent",
        description: "Your team pricing request has been submitted. Our team will contact you soon.",
      });
    } catch (error) {
      console.error('Error submitting team request:', error);
      toast({
        title: "Error",
        description: "Could not submit your request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-5xl mx-auto pt-20 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your needs. Boost your productivity with our premium features.
          </p>
        </div>

        {!auth.isAuthenticated && (
          <Alert variant="default" className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => navigate('/login')}>login or register</Button> first to subscribe to a plan and try all the features.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Premium Individual Plan */}
          <Card className="border-2 border-primary/20 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For individuals seeking enhanced focus</CardDescription>
              
              <div className="mt-4">
                <RadioGroup 
                  className="flex flex-col space-y-2 mt-2" 
                  defaultValue="monthly" 
                  onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">Monthly</span>
                        <span className="text-sm text-muted-foreground">$2/month</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly" className="cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">Yearly <span className="text-xs text-green-600 ml-1 bg-green-100 px-2 py-0.5 rounded-full">Save $4</span></span>
                        <span className="text-sm text-muted-foreground">$20/year</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>No advertisements</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Slack integration & status sync</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Unlimited focus sessions</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSubscribe}
                disabled={isLoading || !auth.isAuthenticated}
              >
                {isLoading ? "Processing..." : `Subscribe ${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}`}
              </Button>
            </CardFooter>
          </Card>

          {/* Team Plan */}
          <Card className="border-2 border-primary/10 flex flex-col h-full bg-muted/50">
            <CardHeader>
              <CardTitle className="text-2xl">Teams</CardTitle>
              <CardDescription>For organizations and teams</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
                <div className="text-sm text-muted-foreground mt-1">Contact us for pricing</div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>All Premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                  <span>Single Sign-On (SSO) integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                  <span>Google Calendar integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Siren className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                  <span>Emergency interruption features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleTeamRequest}
                disabled={isLoading || !auth.isAuthenticated}
              >
                {isLoading ? "Processing..." : "Request Team Pricing"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
