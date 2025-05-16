
'use client';

import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, Info, DownloadCloud, Save } from 'lucide-react';
import { remoteConfigInstance, getValue, fetchAndActivate } from '@/lib/firebase';

interface HeroConfig {
  headline: string;
  subHeadline: string;
  ctaText: string;
}

const REMOTE_CONFIG_KEY = 'heroConfig';

export default function ABTestConfiguratorPage() {
  const [variantName, setVariantName] = useState<string>('Loaded Config');
  const [headline, setHeadline] = useState<string>('');
  const [subHeadline, setSubHeadline] = useState<string>('');
  const [ctaText, setCtaText] = useState<string>('');
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const { toast } = useToast();

  const populateForm = (config: HeroConfig, name?: string) => {
    setHeadline(config.headline || '');
    setSubHeadline(config.subHeadline || '');
    setCtaText(config.ctaText || '');
    if (name) {
      setVariantName(name);
    }
  };

  const loadCurrentRemoteConfig = async () => {
    if (!remoteConfigInstance) {
      toast({
        title: 'Firebase Error',
        description: 'Remote Config is not initialized. Cannot load configuration.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await fetchAndActivate(remoteConfigInstance); // Ensure we have the latest
      const remoteValue = getValue(remoteConfigInstance, REMOTE_CONFIG_KEY);
      if (remoteValue.getSource() !== 'static') {
        const config = JSON.parse(remoteValue.asString()) as HeroConfig;
        populateForm(config, `Current ${REMOTE_CONFIG_KEY}`);
        setGeneratedJson(JSON.stringify(config, null, 2)); // Also update generated JSON
        toast({
          title: 'Config Loaded',
          description: `Successfully loaded current '${REMOTE_CONFIG_KEY}' from Firebase.`,
        });
      } else {
         const defaultConfig = remoteConfigInstance.defaultConfig[REMOTE_CONFIG_KEY] as string;
         if (defaultConfig) {
            const config = JSON.parse(defaultConfig) as HeroConfig;
            populateForm(config, `Default ${REMOTE_CONFIG_KEY}`);
            setGeneratedJson(JSON.stringify(config, null, 2));
            toast({
              title: 'Default Config Loaded',
              description: `Loaded default '${REMOTE_CONFIG_KEY}' as no remote value was found.`,
            });
         } else {
            toast({
              title: 'Not Found',
              description: `No remote or default value found for '${REMOTE_CONFIG_KEY}'.`,
              variant: 'destructive',
            });
         }
      }
    } catch (error) {
      console.error('Error loading remote config:', error);
      toast({
        title: 'Load Error',
        description: `Failed to load '${REMOTE_CONFIG_KEY}'. Check console for details.`,
        variant: 'destructive',
      });
    }
  };

  // Optionally load config on initial mount
  // useEffect(() => {
  //   loadCurrentRemoteConfig();
  // }, []);

  const handleGenerateJson = (e?: FormEvent) => {
    e?.preventDefault();
    if (!headline.trim() && !subHeadline.trim() && !ctaText.trim()) {
      // Allow generating empty JSON if all fields are empty, for clearing.
       const emptyConfig: HeroConfig = { headline: '', subHeadline: '', ctaText: '' };
       setGeneratedJson(JSON.stringify(emptyConfig, null, 2));
       toast({
        title: 'JSON Generated (Empty)',
        description: 'Generated JSON for an empty configuration.',
      });
      return;
    }
    if (!headline.trim() || !subHeadline.trim() || !ctaText.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all content fields (Headline, Sub-Headline, CTA Text) to generate the JSON, or leave all empty to generate an empty config.',
        variant: 'destructive',
      });
      // setGeneratedJson(''); // Don't clear if some fields are filled
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
        description: 'You can now copy the JSON or attempt to save it.',
      });
  };
  
  // Trigger generation when form fields change
  useEffect(() => {
    handleGenerateJson();
  }, [headline, subHeadline, ctaText]);


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

  const handleConceptualSave = () => {
    if (!generatedJson) {
      toast({
        title: 'Nothing to Save',
        description: 'Please generate the JSON first.',
        variant: 'destructive',
      });
      return;
    }
    console.log(`Attempting to update Remote Config parameter '${REMOTE_CONFIG_KEY}' with value:`, generatedJson);
    console.warn("Publishing changes to Firebase Remote Config requires a backend implementation using the Firebase Admin SDK. This action is currently conceptual. To make this live, you would typically send this JSON to a secure backend endpoint that calls admin.remoteConfig().publishTemplate().");
    toast({
      title: 'Conceptual Save',
      description: (
        <div>
          <p>JSON logged to console for parameter '{REMOTE_CONFIG_KEY}'.</p>
          <p className="mt-2 text-xs">
            <strong>Next Steps:</strong> A backend function using the Firebase Admin SDK is needed to actually publish this to Firebase Remote Config.
          </p>
        </div>
      ),
      duration: 9000, // Longer duration for more info
    });
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-lg">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">A/B Test Hero Section Configurator</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure the content for the '{REMOTE_CONFIG_KEY}' Remote Config parameter.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button onClick={loadCurrentRemoteConfig} variant="outline" className="mb-6 w-full sm:w-auto">
            <DownloadCloud className="mr-2 h-4 w-4" /> Load Current '{REMOTE_CONFIG_KEY}' from Firebase
          </Button>
          
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6"> {/* Changed form submission */}
            <div>
              <Label htmlFor="variantName" className="text-base font-medium text-foreground">Configuration Name (for your reference)</Label>
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
                placeholder="Enter the main headline"
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
                className="mt-1 text-base"
              />
            </div>
            {/* Removed Generate JSON button as it's triggered on field change */}
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
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                  <ClipboardCopy className="mr-2 h-4 w-4" /> Copy JSON
                </Button>
                <Button onClick={handleConceptualSave} variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Update Firebase Remote Config (Conceptual)
                </Button>
              </div>
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
                            When setting up the '{REMOTE_CONFIG_KEY}' parameter's default value or a variant value in an A/B test:
                            <ul className="list-disc list-inside pl-5 space-y-0.5 mt-0.5">
                                <li>Copy the generated JSON from above.</li>
                                <li>Paste it into the "Value" field in the Firebase Console.</li>
                            </ul>
                        </li>
                        <li>The "Update Firebase Remote Config (Conceptual)" button logs the JSON and explains that a backend is needed for a real update.</li>
                        <li>For more detailed step-by-step instructions on setting up A/B tests, please refer to the <strong>`PLAYBOOK.md`</strong> file.</li>
                    </ol>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
