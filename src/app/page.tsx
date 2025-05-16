
'use client';

import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, Info, Download, Eye, ExternalLink, BookOpen, Save, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

interface HeroConfig {
  headline: string;
  subHeadline: string;
  ctaText: string;
}

interface ManagedHeroConfig extends HeroConfig {
  id: string;
  name: string;
}

const LOCAL_STORAGE_KEY = 'heroConfigManager';

// Moved ConfigForm outside of ABTestConfiguratorPage to prevent re-definition on parent re-render
const ConfigForm = ({
  version,
  headline, setHeadline,
  subHeadline, setSubHeadline,
  ctaText, setCtaText,
  generatedJson,
  configName, setConfigName,
  onSave
}: {
  version: string,
  headline: string, setHeadline: (val: string) => void,
  subHeadline: string, setSubHeadline: (val: string) => void,
  ctaText: string, setCtaText: (val: string) => void,
  generatedJson: string,
  configName: string, setConfigName: (val: string) => void,
  onSave: () => void,
}) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-primary">Version {version} Content</CardTitle>
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
      
      {generatedJson && (JSON.parse(generatedJson).headline !== "" || JSON.parse(generatedJson).subHeadline !== "" || JSON.parse(generatedJson).ctaText !== "") && (
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

      <div className="mt-6 pt-4 border-t border-border space-y-3">
        <Label htmlFor={`configName${version}`} className="text-base font-medium text-foreground">Save Version {version} Content As:</Label>
        <div className="flex gap-2">
          <Input
            id={`configName${version}`}
            type="text"
            value={configName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfigName(e.target.value)}
            placeholder={`Enter name for this configuration (e.g., Spring Promo ${version})`}
            className="text-base flex-grow"
          />
          <Button onClick={onSave} variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" /> Save Content
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Helper function needs to be accessible by ConfigForm if it's defined outside
const handleCopyToClipboard = async (jsonString: string, version: string, toastFn: Function) => {
  if (!jsonString || JSON.parse(jsonString).headline === "") {
    toastFn({
      title: `Nothing to Copy for Version ${version}`,
      description: 'Please fill in the content fields for this version.',
      variant: 'destructive',
    });
    return;
  }
  try {
    await navigator.clipboard.writeText(jsonString);
    toastFn({
      title: `Copied to Clipboard (Version ${version})!`,
      description: 'The JSON configuration has been copied.',
    });
  } catch (err) {
    console.error(`Failed to copy Version ${version} JSON: `, err);
    toastFn({
      title: `Copy Failed (Version ${version})`,
      description: 'Could not copy the JSON to clipboard. Please copy it manually.',
      variant: 'destructive',
    });
  }
};

const handleDownloadJson = (jsonString: string, version: string, toastFn: Function) => {
  if (!jsonString || JSON.parse(jsonString).headline === "") {
    toastFn({
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
  toastFn({
    title: `JSON Downloaded (Version ${version})!`,
    description: `heroConfig-Version${version}.json has been downloaded.`,
  });
};


export default function ABTestConfiguratorPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State for Version A
  const [headlineA, setHeadlineA] = useState<string>('');
  const [subHeadlineA, setSubHeadlineA] = useState<string>('');
  const [ctaTextA, setCtaTextA] = useState<string>('');
  const [generatedJsonA, setGeneratedJsonA] = useState<string>('');
  const [nameForConfigA, setNameForConfigA] = useState<string>('');

  // State for Version B
  const [headlineB, setHeadlineB] = useState<string>('');
  const [subHeadlineB, setSubHeadlineB] = useState<string>('');
  const [ctaTextB, setCtaTextB] = useState<string>('');
  const [generatedJsonB, setGeneratedJsonB] = useState<string>('');
  const [nameForConfigB, setNameForConfigB] = useState<string>('');

  // State for managed configurations
  const [savedConfigs, setSavedConfigs] = useState<ManagedHeroConfig[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);


  // Load saved configs from localStorage on mount
  useEffect(() => {
    setIsLoadingConfigs(true);
    try {
      const storedConfigs = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedConfigs) {
        setSavedConfigs(JSON.parse(storedConfigs));
      }
    } catch (error) {
      console.error("Error loading configs from localStorage:", error);
      toast({
        title: 'Error Loading Saved Configurations',
        description: 'Could not load configurations from your browser storage.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingConfigs(false);
    }
  }, [toast]);

  // Persist savedConfigs to localStorage whenever it changes
  useEffect(() => {
    if(!isLoadingConfigs) { // Avoid writing initial empty/default state if still loading
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedConfigs));
      } catch (error) {
        console.error("Error saving configs to localStorage:", error);
         toast({
          title: 'Error Persisting Configurations',
          description: 'Could not save configuration changes to your browser storage.',
          variant: 'destructive',
        });
      }
    }
  }, [savedConfigs, isLoadingConfigs, toast]);


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
        query.set('configA', generatedJsonA);
        query.set('configB', generatedJsonB);
        
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

  const saveConfiguration = (version: 'A' | 'B') => {
    const configNameValue = version === 'A' ? nameForConfigA : nameForConfigB;
    const name = configNameValue.trim();
    const headline = version === 'A' ? headlineA : headlineB;
    const subHeadline = version === 'A' ? subHeadlineA : subHeadlineB;
    const ctaText = version === 'A' ? ctaTextA : ctaTextB;

    if (!name) {
      toast({ title: 'Configuration Name Missing', description: `Please enter a name for Version ${version} content before saving.`, variant: 'destructive' });
      return;
    }
    if (!headline.trim() || !subHeadline.trim() || !ctaText.trim()) {
      toast({ title: 'Content Missing', description: `Please ensure all content fields for Version ${version} are filled before saving.`, variant: 'destructive' });
      return;
    }

    const existingConfigIndex = savedConfigs.findIndex(c => c.name === name);

    if (existingConfigIndex !== -1) {
      // Update existing configuration
      const updatedConfigs = savedConfigs.map((config, index) => 
        index === existingConfigIndex 
        ? {
            ...config, // Retain original ID and other potential properties
            name, // name is the same
            headline: headline.trim(),
            subHeadline: subHeadline.trim(),
            ctaText: ctaText.trim(),
          }
        : config
      );
      setSavedConfigs(updatedConfigs);
      toast({ title: 'Configuration Updated!', description: `"${name}" has been updated successfully.` });
    } else {
      // Add new configuration
      const newConfig: ManagedHeroConfig = {
        id: Date.now().toString(), // Simple unique ID
        name,
        headline: headline.trim(),
        subHeadline: subHeadline.trim(),
        ctaText: ctaText.trim(),
      };
      setSavedConfigs(prev => [...prev, newConfig]);
      toast({ title: 'Configuration Saved!', description: `"${newConfig.name}" has been saved locally.` });
    }

    // Clear the name input field after save/update
    if (version === 'A') setNameForConfigA('');
    if (version === 'B') setNameForConfigB('');
  };

  const loadConfigIntoVersion = (configId: string, version: 'A' | 'B') => {
    const configToLoad = savedConfigs.find(c => c.id === configId);
    if (!configToLoad) {
      toast({ title: 'Error', description: 'Could not find configuration to load.', variant: 'destructive'});
      return;
    }
    if (version === 'A') {
      setHeadlineA(configToLoad.headline);
      setSubHeadlineA(configToLoad.subHeadline);
      setCtaTextA(configToLoad.ctaText);
      setNameForConfigA(configToLoad.name); 
    } else {
      setHeadlineB(configToLoad.headline);
      setSubHeadlineB(configToLoad.subHeadline);
      setCtaTextB(configToLoad.ctaText);
      setNameForConfigB(configToLoad.name); 
    }
    toast({ title: 'Configuration Loaded', description: `"${configToLoad.name}" loaded into Version ${version}.` });
  };

  const deleteSavedConfig = (configId: string) => {
    const configToDelete = savedConfigs.find(c => c.id === configId);
    setSavedConfigs(prev => prev.filter(c => c.id !== configId));
    toast({ title: 'Configuration Deleted', description: `"${configToDelete?.name || 'Configuration'}" has been deleted.`, variant: 'default' });
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">A/B Test Hero Section Configurator & Manager</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure two versions (A and B) of hero section content. Save, manage, and load your configurations locally.
            Then, preview both active versions side-by-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          
          <ConfigForm
            version="A"
            headline={headlineA} setHeadline={setHeadlineA}
            subHeadline={subHeadlineA} setSubHeadline={setSubHeadlineA}
            ctaText={ctaTextA} setCtaText={setCtaTextA}
            generatedJson={generatedJsonA}
            configName={nameForConfigA} setConfigName={setNameForConfigA}
            onSave={() => saveConfiguration('A')}
          />

          <ConfigForm
            version="B"
            headline={headlineB} setHeadline={setHeadlineB}
            subHeadline={subHeadlineB} setSubHeadline={setSubHeadlineB}
            ctaText={ctaTextB} setCtaText={setCtaTextB}
            generatedJson={generatedJsonB}
            configName={nameForConfigB} setConfigName={setNameForConfigB}
            onSave={() => saveConfiguration('B')}
          />

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Button onClick={handleRenderPreview} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Eye className="mr-2 h-5 w-5" /> Render Active A/B Pages for Preview
            </Button>
          </div>

          <Separator className="my-10" />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">Managed Hero Configurations (Saved Locally)</CardTitle>
              <CardDescription>
                Load saved configurations into Version A or B forms above, or delete them.
                These are stored in your browser's local storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingConfigs && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <p className="text-muted-foreground">Loading saved configurations...</p>
                </div>
              )}
              {!isLoadingConfigs && savedConfigs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No configurations saved yet. Use the "Save Content" buttons above to save your work.</p>
              )}
              {!isLoadingConfigs && savedConfigs.length > 0 && (
                <ul className="space-y-4">
                  {savedConfigs.map(config => (
                    <li key={config.id} className="p-4 border border-border rounded-lg shadow-sm bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-grow">
                        <p className="font-semibold text-foreground">{config.name}</p>
                        <p className="text-sm text-muted-foreground truncate" title={config.headline}>Headline: {config.headline}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0 mt-2 sm:mt-0">
                        <Button onClick={() => loadConfigIntoVersion(config.id, 'A')} variant="outline" size="sm">Load to A</Button>
                        <Button onClick={() => loadConfigIntoVersion(config.id, 'B')} variant="outline" size="sm">Load to B</Button>
                        <Button onClick={() => deleteSavedConfig(config.id)} variant="destructive" size="sm">
                          <Trash2 className="mr-1 h-4 w-4 sm:mr-2" /> Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>


        </CardContent>
        <CardFooter className="bg-muted/30 p-6 border-t border-border rounded-b-lg">
            <div className="flex flex-col space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 mt-0.5 shrink-0 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-lg font-semibold text-foreground mb-2">Next Steps: Firebase & Playbook</p>
                        <p className="mb-3">
                            After configuring, saving, loading, and previewing your content variations using this tool:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                <strong>Prepare JSON:</strong> Ensure you have copied or downloaded the JSON for both Version A and Version B (from the active forms above) using the buttons within each version's card. These JSON strings are what you'll use in Firebase.
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
                           Remember, this tool helps you prepare and manage content variations locally. The actual A/B test (targeting users, measuring results) is run and managed within the Firebase A/B Testing platform.
                        </p>
                    </div>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
    

    