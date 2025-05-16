
'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, Info } from 'lucide-react';

interface HeroConfig {
  headline: string;
  subHeadline: string;
  ctaText: string;
}

export default function ABTestConfiguratorPage() {
  const [variantName, setVariantName] = useState<string>('Variant A');
  const [headline, setHeadline] = useState<string>('');
  const [subHeadline, setSubHeadline] = useState<string>('');
  const [ctaText, setCtaText] = useState<string>('');
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const { toast } = useToast();

  const handleGenerateJson = (e: FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !subHeadline.trim() || !ctaText.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all content fields (Headline, Sub-Headline, CTA Text) to generate the JSON.',
        variant: 'destructive',
      });
      setGeneratedJson('');
      return;
    }

    const config: HeroConfig = {
      headline: headline.trim(),
      subHeadline: subHeadline.trim(),
      ctaText: ctaText.trim(),
    };
    setGeneratedJson(JSON.stringify(config, null, 2));
     toast({
        title: 'JSON Generated!',
        description: 'You can now copy the JSON to use in Firebase A/B Testing.',
      });
  };

  const handleCopyToClipboard = async () => {
    if (!generatedJson) {
      toast({
        title: 'Nothing to Copy',
        description: 'Please generate the JSON first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedJson);
      toast({
        title: 'Copied to Clipboard!',
        description: 'The JSON configuration has been copied.',
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy the JSON to clipboard. Please copy it manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-lg">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">A/B Test Hero Section Configurator</CardTitle>
          <CardDescription className="text-muted-foreground">
            Use this tool to generate the JSON configuration for your landing page A/B test variants.
            This JSON can then be used in Firebase Remote Config when setting up your A/B test.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleGenerateJson} className="space-y-6">
            <div>
              <Label htmlFor="variantName" className="text-base font-medium text-foreground">Variant Name (for your reference)</Label>
              <Input
                id="variantName"
                type="text"
                value={variantName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setVariantName(e.target.value)}
                placeholder="e.g., Variant A - New Offer"
                className="mt-1 text-base"
              />
            </div>
            <div>
              <Label htmlFor="headline" className="text-base font-medium text-foreground">Headline</Label>
              <Input
                id="headline"
                type="text"
                value={headline}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setHeadline(e.target.value)}
                placeholder="Enter the main headline for this variant"
                required
                className="mt-1 text-base"
              />
            </div>
            <div>
              <Label htmlFor="subHeadline" className="text-base font-medium text-foreground">Sub-Headline</Label>
              <Input
                id="subHeadline"
                type="text"
                value={subHeadline}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubHeadline(e.target.value)}
                placeholder="Enter the supporting sub-headline"
                required
                className="mt-1 text-base"
              />
            </div>
            <div>
              <Label htmlFor="ctaText" className="text-base font-medium text-foreground">Call to Action (CTA) Text</Label>
              <Input
                id="ctaText"
                type="text"
                value={ctaText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCtaText(e.target.value)}
                placeholder="Enter the text for the CTA button"
                required
                className="mt-1 text-base"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">Generate JSON</Button>
          </form>

          {generatedJson && (
            <div className="mt-8 pt-6 border-t border-border space-y-3">
              <Label htmlFor="generatedJson" className="text-base font-medium text-foreground">Generated JSON for '{variantName}'</Label>
              <Textarea
                id="generatedJson"
                value={generatedJson}
                readOnly
                rows={8}
                className="font-mono text-sm bg-muted/50 border-border p-3 rounded-md"
                aria-label="Generated JSON configuration"
              />
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm" className="w-full sm:w-auto">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy JSON
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-6 bg-muted/30 p-6 border-t border-border rounded-b-lg">
            <div className="flex items-start space-x-3 text-sm text-muted-foreground">
                <Info className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                <div>
                    <p className="font-semibold text-foreground">How to use this JSON:</p>
                    <ol className="list-decimal list-inside space-y-1.5 mt-2">
                        <li>Go to your Firebase project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a>.</li>
                        <li>Navigate to <strong>Remote Config</strong> (usually under the "Engage" or "Build" section).</li>
                        <li>
                            If setting up a new parameter or its default value:
                            <ul className="list-disc list-inside pl-5 space-y-0.5 mt-0.5">
                                <li>Edit the `heroConfig` parameter.</li>
                                <li>Paste this generated JSON into its value field.</li>
                            </ul>
                        </li>
                        <li>
                            If creating or editing an A/B test:
                            <ul className="list-disc list-inside pl-5 space-y-0.5 mt-0.5">
                                <li>Go to <strong>A/B Testing</strong> (usually under "Engage").</li>
                                <li>Create a new experiment or edit an existing one. Ensure it targets the `heroConfig` Remote Config parameter.</li>
                                <li>For the variant you are configuring (e.g., "Variant A," "New Headline Offer"), paste this generated JSON into the "Value" field for that variant.</li>
                            </ul>
                        </li>
                        <li>For more detailed step-by-step instructions on setting up A/B tests, please refer to the <strong>`PLAYBOOK.md`</strong> file located in the root of this project.</li>
                    </ol>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
