
'use client';

import { useState }  from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';

const feedbackSchema = z.object({
  feedbackType: z.enum(['bug', 'feature', 'general'], {
    required_error: 'Please select a feedback type.',
  }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).optional().or(z.literal('')),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  serviceDeskEmail?: string; // Optional email for mailto link
}

export default function FeedbackModal({ isOpen, onOpenChange, serviceDeskEmail = "servicedesk@example.com" }: FeedbackModalProps) {
  const { toast } = useToast();
  const [showMailtoLink, setShowMailtoLink] = useState(false);
  const [mailtoHref, setMailtoHref] = useState('');

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackType: undefined,
      description: '',
      email: '',
    },
  });

  const onSubmit: SubmitHandler<FeedbackFormData> = (data) => {
    console.log('Feedback Submitted:', data);

    const subject = `App Feedback: ${data.feedbackType.charAt(0).toUpperCase() + data.feedbackType.slice(1)}`;
    let body = `Feedback Type: ${data.feedbackType}\n`;
    body += `Description:\n${data.description}\n\n`;
    if (data.email) {
      body += `User Email: ${data.email}\n`;
    }
    body += `\nTimestamp: ${new Date().toISOString()}`;

    const href = `mailto:${serviceDeskEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setMailtoHref(href);
    setShowMailtoLink(true);

    toast({
      title: 'Feedback Prepared',
      description: (
        <div>
          <p>Thank you for your feedback! It has been logged to the console.</p>
          <p className="mt-2">To send this to the service desk, please click the link below (opens your email client):</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-primary underline hover:text-primary/80"
            onClick={() => {
              // Optionally close modal after clicking mailto
              // onOpenChange(false);
              // form.reset();
              // setShowMailtoLink(false);
            }}
          >
            Send Feedback Email
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            For direct ServiceNow integration, a backend service is required.
          </p>
        </div>
      ),
      duration: 15000, // Keep toast longer for the link
    });
    // Note: We are not resetting the form or closing the modal immediately here
    // to allow the user to click the mailto link from the toast.
    // The toast itself can be dismissed, or the modal can be closed manually.
  };

  const handleModalClose = () => {
    onOpenChange(false);
    form.reset();
    setShowMailtoLink(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 text-primary" />
            Provide Feedback or Report an Issue
          </DialogTitle>
          <DialogDescription>
            Your input is valuable to us. Please describe any issues, suggest features, or leave general feedback.
          </DialogDescription>
        </DialogHeader>
        {!showMailtoLink ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="feedbackType">Feedback Type</Label>
              <Select
                onValueChange={(value) => form.setValue('feedbackType', value as FeedbackFormData['feedbackType'])}
                defaultValue={form.getValues('feedbackType')}
              >
                <SelectTrigger id="feedbackType" className="w-full">
                  <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.feedbackType && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.feedbackType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible..."
                rows={5}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Your Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 space-y-3">
            <p>Your feedback has been prepared. You can copy the details below if needed, or use the link provided in the toast notification (bottom-right) to send it via email.</p>
            <Textarea
              value={`Subject: ${decodeURIComponent(mailtoHref.split('subject=')[1].split('&body=')[0])}\n\nBody:\n${decodeURIComponent(mailtoHref.split('&body=')[1])}`}
              readOnly
              rows={10}
              className="font-mono text-xs"
            />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={handleModalClose}>
                Close
              </Button>
              <a
                href={mailtoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                onClick={() => {
                    // handleModalClose(); // Optionally close after clicking
                }}
              >
                Open Email Client <Send className="ml-2 h-4 w-4" />
              </a>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
