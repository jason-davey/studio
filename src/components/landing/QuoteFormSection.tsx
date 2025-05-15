
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldName } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react'; // Changed icon from Paperclip to ShieldCheck
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress'; // Import Progress component

const formSchema = z.object({
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select your gender.',
  }),
  smoker: z.enum(['yes', 'no'], {
    required_error: 'Please indicate if you are a smoker.',
  }),
  dob: z.date({
    required_error: 'Date of birth is required.',
  }),
  coverLevel: z.string({
    required_error: 'Please select a cover level.',
  }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Dummy cover levels - replace with actual options if available
const coverLevelOptions = [
  '$100,000',
  '$250,000',
  '$500,000',
  '$750,000',
  '$1,000,000',
];

const STEPS = [
  { id: 1, name: 'Basic Info', fields: ['gender', 'smoker', 'dob'] as FieldName<FormData>[] },
  { id: 2, name: 'Cover Level', fields: ['coverLevel'] as FieldName<FormData>[] },
  { id: 3, name: 'Contact Details', fields: ['name', 'email', 'phone'] as FieldName<FormData>[] },
];

export default function QuoteFormSection() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      coverLevel: '',
    },
  });

  const dobValue = form.watch('dob');

  async function processForm(values: FormData) {
    // In a real app, you'd send this data to a server.
    console.log(values);
    toast({
      title: 'Quote Request Submitted!',
      description: 'Thank you! We will be in touch with your personalized plan shortly.',
      variant: 'default',
    });
    form.reset();
    setCurrentStep(1);
  }

  const nextStep = async () => {
    const currentFields = STEPS[currentStep - 1].fields;
    const output = await form.trigger(currentFields, { shouldFocus: true });

    if (!output) return;

    if (currentStep < STEPS.length) {
      setCurrentStep(step => step + 1);
    } else {
      // Final step, trigger submit
      await form.handleSubmit(processForm)();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(step => step - 1);
    }
  };

  const progressValue = (currentStep / STEPS.length) * 100;

  return (
    <section id="quote-form" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto shadow-2xl">
          <CardHeader className="text-center">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" /> {/* Changed icon */}
            <CardTitle className="text-3xl sm:text-4xl font-bold text-foreground">
              Get Your Personalized Protection Plan
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Fill out the short form below (Step {currentStep} of {STEPS.length}).
            </CardDescription>
            {/* Updated Progress component background */}
            <Progress value={progressValue} className="w-full mt-4 h-2 bg-[#F0EDE2]" />
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(processForm)} className="space-y-6">
                {/* --- Step 1: Basic Info --- */}
                <div className={cn(currentStep !== 1 && 'hidden')}>
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base">Are you male or female?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                            aria-required="true"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smoker"
                    render={({ field }) => (
                      <FormItem className="space-y-3 mt-6"> {/* Added mt-6 */}
                        <FormLabel className="text-base">Are you a smoker?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                            aria-required="true"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mt-6"> {/* Added mt-6 */}
                        <FormLabel className="text-base">What is your date of birth?</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal text-base py-3 h-auto justify-start',
                                  !field.value && 'text-muted-foreground'
                                )}
                                aria-required="true"
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Step 2: Cover Level --- */}
                <div className={cn(currentStep !== 2 && 'hidden')}>
                  <FormField
                    control={form.control}
                    name="coverLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">What level of cover would you like?</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!dobValue}
                          aria-required="true"
                        >
                          <FormControl>
                            <SelectTrigger className="text-base py-3 h-auto">
                              <SelectValue placeholder="Select cover level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {coverLevelOptions.map((level) => (
                              <SelectItem key={level} value={level} className="text-base">
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!dobValue && (
                          <FormDescription className="text-sm text-primary">
                            Please enter your date of birth before choosing a cover level.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Step 3: Contact Details --- */}
                <div className={cn(currentStep !== 3 && 'hidden')}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Jane Doe" {...field} className="text-base py-3 px-4" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mt-6"> {/* Added mt-6 */}
                        <FormLabel className="text-base">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} className="text-base py-3 px-4" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mt-6"> {/* Added mt-6 */}
                        <FormLabel className="text-base">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="e.g., 0400 123 456" {...field} className="text-base py-3 px-4" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Navigation/Submit Buttons --- */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className={cn(currentStep === 1 && 'invisible')} // Hide on first step
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-cta text-cta-foreground hover:bg-cta/90"
                    disabled={form.formState.isSubmitting}
                  >
                    {currentStep === STEPS.length ? (
                      form.formState.isSubmitting ? 'Securing...' : "Secure My Family's Future"
                    ) : (
                      <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
