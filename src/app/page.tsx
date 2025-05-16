
'use client';

import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, Info, Download, Eye, ExternalLink, BookOpen } from 'lucide-react'; // Added BookOpen
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeroConfig {
  headline: string;
  subHeadline: string;
  ctaText: string;
}

const REMOTE_CONFIG_KEY_BASE = 'heroConfig'; // Base name for Firebase

export default function ABTestConfiguratorPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State for Version A
  const [headlineA, setHeadlineA] = useState<string>('');
  const [subHeadlineA, setSubHeadlineA] = useState<string>('');
  const [ctaTextA, setCtaTextA] = useState<string>('');
  const [generatedJsonA, setGeneratedJsonA] = useState<string>('');

  // State for Version B
  const [headlineB, setHeadlineB] = useState<string>('');
  const [subHeadlineB, setSubHeadlineB] = useState<string>('');
  const [ctaTextB, setCtaTextB] = useState<string>('');
  const [generatedJsonB, setGeneratedJsonB] = useState<string>('');

  const generateJson = (headline: string, subHeadline: string, ctaText: string): string => {
    if (!headline.trim() && !subHeadline.trim() && !ctaText.trim()) {
      const emptyConfig: HeroConfig = { headline: '', subHeadline: '', ctaText: '' };
      return JSON.stringify(emptyConfig, null, 2);
    }
    const config: HeroConfig = {
      headline: headline.trim(),
      subHeadline: subHeadline.trim(),
      ctaText: ctaText.trim(),
    };
    return JSON.stringify(config, null, 2);
  };

  useEffect(() => {
    setGeneratedJsonA(generateJson(headlineA, subHeadlineA, ctaTextA));
  }, [headlineA, subHeadlineA, ctaTextA]);

  useEffect(() => {
    setGeneratedJsonB(generateJson(headlineB, subHeadlineB, ctaTextB));
  }, [headlineB, subHeadlineB, ctaTextB]);

  const handleCopyToClipboard = async (jsonString: string, version: string) => {
    if (!jsonString || JSON.parse(jsonString).headline === "") { // Check if JSON is empty or just placeholder
      toast({
        title: `Nothing to Copy for Version ${version}`,
        description: 'Please fill in the content fields for this version.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(jsonString);
      toast({
        title: `Copied to Clipboard (Version ${version})!`,
        description: 'The JSON configuration has been copied.',
      });
    } catch (err) {
      console.error(`Failed to copy Version ${version} JSON: `, err);
      toast({
        title: `Copy Failed (Version ${version})`,
        description: 'Could not copy the JSON to clipboard. Please copy it manually.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadJson = (jsonString: string, version: string) => {
    if (!jsonString || JSON.parse(jsonString).headline === "") { // Check if JSON is empty or just placeholder
      toast({
        title: `Nothing to Download for Version ${version}`,
        description: 'Please fill in the content fields for this version.',
        variant: 'destructive',
      });
      return;
    }
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heroConfig-Version${version}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: `JSON Downloaded (Version ${version})!`,
      description: `heroConfig-Version${version}.json has been downloaded.`,
    });
  };

  const handleRenderPreview = () => {
    let configAIsValid = false;
    let configBIsValid = false;

    try {
        const configAData = JSON.parse(generatedJsonA) as HeroConfig;
        if(configAData.headline && configAData.subHeadline && configAData.ctaText) configAIsValid = true;
    } catch (e) {/* ignore parsing error, handled by validity check */}

    try {
        const configBData = JSON.parse(generatedJsonB) as HeroConfig;
        if(configBData.headline && configBData.subHeadline && configBData.ctaText) configBIsValid = true;
    } catch (e) {/* ignore parsing error, handled by validity check */}


    if (!configAIsValid || !configBIsValid) {
         toast({
            title: 'Configuration Incomplete for Preview',
            description: 'Please ensure all fields (Headline, Sub-Headline, CTA Text) are filled for both Version A and Version B before previewing.',
            variant: 'destructive',
        });
        return;
    }
    try {
        const query = new URLSearchParams();
        query.set('configA', generatedJsonA); // Pass the string directly
        query.set('configB', generatedJsonB); // Pass the string directly
        
        // Open in a new tab for better UX
        const previewUrl = `/landing-preview?${query.toString()}`;
        window.open(previewUrl, '_blank');

    } catch (error) {
        toast({
            title: 'Error Preparing Preview',
            description: 'Could not prepare the preview link. Please check your inputs.',
            variant: 'destructive',
        });
        console.error("Error preparing preview link: ", error);
    }
  };

  const ConfigForm = ({
    version,
    headline, setHeadline,
    subHeadline, setSubHeadline,
    ctaText, setCtaText,
    generatedJson,
  }: {
    version: string,
    headline: string, setHeadline: (val: string) => void,
    subHeadline: string, setSubHeadline: (val: string) => void,
    ctaText: string, setCtaText: (val: string) => void,
    generatedJson: string
  }) => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Version {version}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor={`headline${version}`} className="text-base font-medium text-foreground">Headline</Label>
          <Input
            id={`headline${version}`}
            type="text"
            value={headline}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setHeadline(e.target.value)}
            placeholder={`Enter headline for Version ${version}`}
            className="mt-1 text-base"
          />
        </div>
        <div>
          <Label htmlFor={`subHeadline${version}`} className="text-base font-medium text-foreground">Sub-Headline</Label>
          <Input
            id={`subHeadline${version}`}
            type="text"
            value={subHeadline}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSubHeadline(e.target.value)}
            placeholder={`Enter sub-headline for Version ${version}`}
            className="mt-1 text-base"
          />
        </div>
        <div>
          <Label htmlFor={`ctaText${version}`} className="text-base font-medium text-foreground">Call to Action (CTA) Text</Label>
          <Input
            id={`ctaText${version}`}
            type="text"
            value={ctaText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCtaText(e.target.value)}
            placeholder={`Enter CTA text for Version ${version}`}
            className="mt-1 text-base"
          />
        </div>
        {generatedJson && (
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <Label htmlFor={`generatedJson${version}`} className="text-base font-medium text-foreground">Generated JSON for Version {version}</Label>
            <Textarea
              id={`generatedJson${version}`}
              value={generatedJson}
              readOnly
              rows={6}
              className="font-mono text-sm bg-muted/50 border-border p-3 rounded-md"
              aria-label={`Generated JSON configuration for Version ${version}`}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleCopyToClipboard(generatedJson, version)} variant="outline" size="sm">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy JSON
              </Button>
              <Button onClick={() => handleDownloadJson(generatedJson, version)} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download JSON
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">A/B Test Hero Section Configurator</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure two versions (A and B) of the hero section content.
            Generate, copy, or download the JSON for each. Then, preview both versions side-by-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          
          <ConfigForm
            version="A"
            headline={headlineA} setHeadline={setHeadlineA}
            subHeadline={subHeadlineA} setSubHeadline={setSubHeadlineA}
            ctaText={ctaTextA} setCtaText={setCtaTextA}
            generatedJson={generatedJsonA}
          />

          <ConfigForm
            version="B"
            headline={headlineB} setHeadline={setHeadlineB}
            subHeadline={subHeadlineB} setSubHeadline={setSubHeadlineB}
            ctaText={ctaTextB} setCtaText={setCtaTextB}
            generatedJson={generatedJsonB}
          />

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Button onClick={handleRenderPreview} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Eye className="mr-2 h-5 w-5" /> Render Pages for Preview
            </Button>
          </div>

        </CardContent>
        <CardFooter className="bg-muted/30 p-6 border-t border-border rounded-b-lg">
            <div className="flex flex-col space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 mt-0.5 shrink-0 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-lg font-semibold text-foreground mb-2">Next Steps: Firebase & Playbook</p>
                        <p className="mb-3">
                            After configuring and previewing your content variations using this tool:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                <strong>Prepare JSON:</strong> Ensure you have copied or downloaded the JSON for both Version A and Version B using the buttons within each version's card above. These JSON strings are what you'll use in Firebase.
                            </li>
                            <li>
                                <strong>Go to Firebase:</strong> Click the button below to navigate to the Firebase Console where you will set up and manage your A/B test.
                                <Button asChild size="sm" className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                                    <Link href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> Go to Firebase Console
                                    </Link>
                                </Button>
                            </li>
                            <li>
                                <strong>Consult the Playbook:</strong> For detailed, step-by-step instructions on creating the A/B test in Firebase (including setting up parameters, goals, and targeting), please refer to the <strong>`PLAYBOOK.md`</strong> file. This crucial document is located in the root directory of this project and provides comprehensive guidance.
                                <div className="mt-2 text-xs flex items-center text-muted-foreground">
                                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                                  <span>You can open `PLAYBOOK.md` from your project files.</span>
                                </div>
                            </li>
                        </ol>
                        
                        <p className="mt-4 text-xs italic">
                           Remember, this tool helps you prepare the content variations. The actual A/B test (targeting users, measuring results) is run and managed within the Firebase A/B Testing platform.
                        </p>
                    </div>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
    
