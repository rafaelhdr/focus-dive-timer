
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Schema for email form validation
const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// Schema for verification token validation
const verificationSchema = z.object({
  token: z.string().length(6, { message: 'Verification code must be 6 digits' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;

const Login = () => {
  const { requestLoginCode, verifyLoginCode } = useAuth();
  const [currentStep, setCurrentStep] = useState<'email' | 'verification'>('email');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  // Verification form
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { token: '' },
  });

  // Handle email submission
  const onEmailSubmit = async (values: EmailFormValues) => {
    const success = await requestLoginCode(values.email);
    if (success) {
      setEmail(values.email);
      setCurrentStep('verification');
    }
  };

  // Handle verification code submission
  const onVerificationSubmit = async (values: VerificationFormValues) => {
    const success = await verifyLoginCode(email, values.token);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Focus Dive</CardTitle>
          <CardDescription>
            {currentStep === 'email'
              ? 'Enter your email to receive a verification code'
              : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Email Form - visible when currentStep is 'email', hidden otherwise */}
          <div style={{ display: currentStep === 'email' ? 'block' : 'none' }}>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="bg-muted flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0">
                            <Mail className="h-4 w-4" />
                          </span>
                          <Input
                            {...field}
                            placeholder="your@email.com"
                            className="rounded-l-none"
                            autoComplete="email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={emailForm.formState.isSubmitting}
                >
                  {emailForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Verification Form - visible when currentStep is 'verification', hidden otherwise */}
          <div style={{ display: currentStep === 'verification' ? 'block' : 'none' }}>
            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
                <FormField
                  control={verificationForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verificationForm.formState.isSubmitting}
                >
                  {verificationForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Log In'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setCurrentStep('email')}
                >
                  Use a different email address
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">We'll create an account for you if you don't have one.</p>
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Timer
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
