
'use client';

import { useState, type ChangeEvent, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, Info, Download, Eye, ExternalLink, BookOpen, Save, Trash2, Loader2, Sparkles, RefreshCcw, UploadCloud, ChevronRight, CheckCircle, Edit3, Settings, Rocket } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { suggestHeroCopy, type SuggestHeroCopyInput } from '@/ai/flows/suggest-hero-copy-flow';
import HeroSection from '@/components/landing/HeroSection';
import type { PageBlueprint, RecommendationHeroConfig } from '@/types/recommendations';

// Types for A/B Test Configurator (Step 4)
interface ABTestHeroConfig {
  headline: string;
  subHeadline: string;
  ctaText: string;
}

interface ManagedABTestHeroConfig extends ABTestHeroConfig {
  id: string;
  name: string;
  campaignFocus?: string;
}

const AB_TEST_LOCAL_STORAGE_KEY = 'heroConfigManager';

type AISuggestionState = {
  loading: boolean;
  suggestions: string[];
  error: string | null;
  popoverOpen: boolean;
};

const initialAISuggestionState: AISuggestionState = {
  loading: false,
  suggestions: [],
  error: null,
  popoverOpen: false,
};

// --- Reusable ConfigForm for A/B Testing (Step 4) ---
const ABTestConfigForm = ({
  version,
  headline, setHeadline,
  subHeadline, setSubHeadline,
  ctaText, setCtaText,
  campaignFocus, setCampaignFocus,
  generatedJson,
  configName, setConfigName,
  onSave
}: {
  version: string,
  headline: string, setHeadline: (val: string) => void,
  subHeadline: string, setSubHeadline: (val: string) => void,
  ctaText: string, setCtaText: (val: string) => void,
  campaignFocus: string, setCampaignFocus: (val: string) => void,
  generatedJson: string,
  configName: string, setConfigName: (val: string) => void,
  onSave: () => void,
}) => {
  const { toast } = useToast();
  const [aiStateHeadline, setAiStateHeadline] = useState<AISuggestionState>(initialAISuggestionState);
  const [aiStateSubHeadline, setAiStateSubHeadline] = useState<AISuggestionState>(initialAISuggestionState);
  const [aiStateCtaText, setAiStateCtaText] = useState<AISuggestionState>(initialAISuggestionState);

  const getAISuggestions = useCallback(async (
    copyType: SuggestHeroCopyInput['copyType'],
    currentValue: string,
    currentCampaignFocus: string,
    setter: React.Dispatch<React.SetStateAction<AISuggestionState>>
  ) => {
    setter({ loading: true, suggestions: [], error: null, popoverOpen: true });
    try {
      const result = await suggestHeroCopy({
        copyType,
        currentText: currentValue,
        campaignFocus: currentCampaignFocus,
        count: 3,
      });
      if (result.suggestions && result.suggestions.length > 0) {
        setter(prev => ({ ...prev, loading: false, suggestions: result.suggestions, error: null }));
      } else {
        setter(prev => ({ ...prev, loading: false, suggestions: [], error: 'No suggestions received. Try refining your input or try again.' }));
      }
    } catch (error) {
      console.error(`Error fetching AI ${copyType} suggestions:`, error);
      setter(prev => ({ ...prev, loading: false, suggestions: [], error: `Failed to get suggestions. Check console.`, popoverOpen: true }));
      toast({
        title: `AI Suggestion Error (${copyType})`,
        description: "Could not fetch suggestions from the AI. Please try again later.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleApplySuggestion = (
    suggestion: string,
    fieldSetter: (val: string) => void,
    aiSetter: React.Dispatch<React.SetStateAction<AISuggestionState>>
  ) => {
    fieldSetter(suggestion);
    aiSetter(prev => ({ ...prev, popoverOpen: false }));
  };

  const renderAISuggestionPopover = (
    targetValue: string,
    copyType: SuggestHeroCopyInput['copyType'],
    aiState: AISuggestionState,
    aiStateSetter: React.Dispatch<React.SetStateAction<AISuggestionState>>,
    fieldSetter: (val: string) => void
  ) => (
    <Popover open={aiState.popoverOpen} onOpenChange={(open) => aiStateSetter(prev => ({...prev, popoverOpen: open}))}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-2 px-2 py-1 h-auto text-xs"
          onClick={() => {
            if (!aiState.popoverOpen || aiState.suggestions.length === 0 || aiState.error) {
                 getAISuggestions(copyType, targetValue, campaignFocus, aiStateSetter);
            } else {
                 aiStateSetter(prev => ({...prev, popoverOpen: true}));
            }
          }}
          title={`Suggest ${copyType} with AI`}
        >
          <Sparkles className="mr-1 h-3 w-3" /> AI
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm p-3" side="bottom" align="start">
        {aiState.loading && <div className="flex items-center justify-center p-2"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading suggestions...</div>}
        {aiState.error && !aiState.loading && (
            <div className="text-destructive p-2">
                <p>{aiState.error}</p>
                <Button variant="link" size="sm" onClick={() => getAISuggestions(copyType, targetValue, campaignFocus, aiStateSetter)} className="p-0 h-auto mt-1 text-xs">
                    <RefreshCcw className="mr-1 h-3 w-3" /> Try Again
                </Button>
            </div>
        )}
        {!aiState.loading && !aiState.error && aiState.suggestions.length > 0 && (
          <ul className="space-y-2">
            {aiState.suggestions.map((s, i) => (
              <li key={i}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-accent"
                  onClick={() => handleApplySuggestion(s, fieldSetter, aiStateSetter)}
                >
                  {s}
                </Button>
              </li>
            ))}
             <Button variant="link" size="sm" onClick={() => getAISuggestions(copyType, targetValue, campaignFocus, aiStateSetter)} className="p-0 h-auto mt-2 text-xs text-muted-foreground">
                <RefreshCcw className="mr-1 h-3 w-3" /> Regenerate
            </Button>
          </ul>
        )}
         {!aiState.loading && !aiState.error && aiState.suggestions.length === 0 && (
             <div className="text-muted-foreground p-2">No suggestions available. Try providing some initial text or keywords.
                <Button variant="link" size="sm" onClick={() => getAISuggestions(copyType, targetValue, campaignFocus, aiStateSetter)} className="p-0 h-auto mt-1 text-xs">
                    <RefreshCcw className="mr-1 h-3 w-3" /> Try Again
                </Button>
             </div>
         )}
      </PopoverContent>
    </Popover>
  );

  return (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-primary">Version {version} Content</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <Label htmlFor={`campaignFocus${version}`} className="text-base font-medium text-foreground">Campaign Focus / Keywords (Optional)</Label>
        <Textarea
          id={`campaignFocus${version}`}
          value={campaignFocus}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCampaignFocus(e.target.value)}
          placeholder="e.g., 'young families', 'quick approval', 'summer discount', 'keyword1 keyword2'"
          className="mt-1 text-base"
          rows={2}
        />
        <p className="text-xs text-muted-foreground mt-1">Helps AI tailor suggestions. Saved with this configuration.</p>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`headline${version}`} className="text-base font-medium text-foreground">Headline</Label>
          {renderAISuggestionPopover(headline, 'headline', aiStateHeadline, setAiStateHeadline, setHeadline)}
        </div>
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
        <div className="flex items-center justify-between">
          <Label htmlFor={`subHeadline${version}`} className="text-base font-medium text-foreground">Sub-Headline</Label>
          {renderAISuggestionPopover(subHeadline, 'subHeadline', aiStateSubHeadline, setAiStateSubHeadline, setSubHeadline)}
        </div>
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
        <div className="flex items-center justify-between">
         <Label htmlFor={`ctaText${version}`} className="text-base font-medium text-foreground">Call to Action (CTA) Text</Label>
         {renderAISuggestionPopover(ctaText, 'ctaText', aiStateCtaText, setAiStateCtaText, setCtaText)}
        </div>
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
            <Button onClick={() => handleCopyToClipboard(generatedJson, version, toast)} variant="outline" size="sm">
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy JSON
            </Button>
            <Button onClick={() => handleDownloadJson(generatedJson, version, toast)} variant="outline" size="sm">
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
            placeholder={`Name for this config (e.g., Spring Promo ${version})`}
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
};

// Helper function needs to be accessible by ABTestConfigForm
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


// --- Main Page Component ---
export default function LandingPageWorkflowPage() {
  const { toast } = useToast();
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>('step-1');

  // Step 1: Recommendations
  const [uploadedBlueprint, setUploadedBlueprint] = useState<PageBlueprint | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Step 2 & 3: Active Landing Page Data (derived from blueprint, editable in Step 3)
  const [activeHeroConfig, setActiveHeroConfig] = useState<RecommendationHeroConfig | null>(null);

  // Step 4: A/B Test Configuration States
  const [headlineA, setHeadlineA] = useState<string>('');
  const [subHeadlineA, setSubHeadlineA] = useState<string>('');
  const [ctaTextA, setCtaTextA] = useState<string>('');
  const [campaignFocusA, setCampaignFocusA] = useState<string>('');
  const [generatedJsonA, setGeneratedJsonA] = useState<string>('');
  const [nameForConfigA, setNameForConfigA] = useState<string>('');

  const [headlineB, setHeadlineB] = useState<string>('');
  const [subHeadlineB, setSubHeadlineB] = useState<string>('');
  const [ctaTextB, setCtaTextB] = useState<string>('');
  const [campaignFocusB, setCampaignFocusB] = useState<string>('');
  const [generatedJsonB, setGeneratedJsonB] = useState<string>('');
  const [nameForConfigB, setNameForConfigB] = useState<string>('');
  
  const [savedABTestConfigs, setSavedABTestConfigs] = useState<ManagedABTestHeroConfig[]>([]);
  const [isLoadingABTestConfigs, setIsLoadingABTestConfigs] = useState(true);

  // --- Step 1 Logic ---
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setUploadedBlueprint(null);
    setActiveHeroConfig(null); // Reset active hero config

    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const parsedJson = JSON.parse(content) as PageBlueprint;
            // Basic validation for expected structure
            if (parsedJson.pageName && parsedJson.heroConfig) {
              setUploadedBlueprint(parsedJson);
              setActiveHeroConfig(parsedJson.heroConfig); // Populate active hero from blueprint
              toast({ title: 'Blueprint Loaded!', description: `"${parsedJson.pageName}" recommendations loaded.` });
              setActiveAccordionItem('step-2'); // Move to next step
            } else {
              throw new Error('Invalid blueprint structure. Missing pageName or heroConfig.');
            }
          } catch (error: any) {
            console.error('Error parsing JSON file:', error);
            setFileError(`Error parsing JSON: ${error.message}. Please ensure it's a valid PageBlueprint JSON.`);
            toast({ title: 'File Read Error', description: 'Could not parse the JSON file.', variant: 'destructive' });
          }
        };
        reader.onerror = () => {
            setFileError('Error reading the file.');
            toast({ title: 'File Read Error', description: 'Could not read the file.', variant: 'destructive' });
        }
        reader.readAsText(file);
      } else {
        setFileError('Invalid file type. Please upload a JSON file.');
        toast({ title: 'Invalid File Type', description: 'Please upload a .json file.', variant: 'destructive' });
      }
    }
    event.target.value = ''; // Reset file input
  };

  // --- Step 3 Logic (Updating activeHeroConfig) ---
  const handleHeroConfigChange = (field: keyof RecommendationHeroConfig, value: string) => {
    setActiveHeroConfig(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  // --- Step 4 Logic (A/B Test Configurator) ---
  useEffect(() => {
    // Pre-populate Version A of A/B test if activeHeroConfig is available
    if (activeHeroConfig && activeAccordionItem === 'step-4') {
      setHeadlineA(activeHeroConfig.headline || '');
      setSubHeadlineA(activeHeroConfig.subHeadline || '');
      setCtaTextA(activeHeroConfig.ctaText || '');
      // Optionally clear campaign focus or keep previous
      // setCampaignFocusA(''); 
    }
  }, [activeHeroConfig, activeAccordionItem]);

  useEffect(() => {
    setIsLoadingABTestConfigs(true);
    try {
      const storedConfigs = localStorage.getItem(AB_TEST_LOCAL_STORAGE_KEY);
      if (storedConfigs) {
        setSavedABTestConfigs(JSON.parse(storedConfigs));
      }
    } catch (error) {
      console.error("Error loading A/B test configs from localStorage:", error);
      toast({ title: 'Error Loading Saved A/B Configurations', variant: 'destructive' });
    } finally {
      setIsLoadingABTestConfigs(false);
    }
  }, [toast]);

  useEffect(() => {
    if(!isLoadingABTestConfigs) { 
      try {
        localStorage.setItem(AB_TEST_LOCAL_STORAGE_KEY, JSON.stringify(savedABTestConfigs));
      } catch (error) {
        console.error("Error saving A/B configs to localStorage:", error);
        toast({ title: 'Error Persisting A/B Configurations', variant: 'destructive'});
      }
    }
  }, [savedABTestConfigs, isLoadingABTestConfigs, toast]);

  const generateABTestJson = (headline: string, subHeadline: string, ctaText: string): string => {
    if (!headline.trim() && !subHeadline.trim() && !ctaText.trim()) {
      return JSON.stringify({ headline: '', subHeadline: '', ctaText: '' } as ABTestHeroConfig, null, 2);
    }
    return JSON.stringify({ headline: headline.trim(), subHeadline: subHeadline.trim(), ctaText: ctaText.trim() } as ABTestHeroConfig, null, 2);
  };

  useEffect(() => { setGeneratedJsonA(generateABTestJson(headlineA, subHeadlineA, ctaTextA)); }, [headlineA, subHeadlineA, ctaTextA]);
  useEffect(() => { setGeneratedJsonB(generateABTestJson(headlineB, subHeadlineB, ctaTextB)); }, [headlineB, subHeadlineB, ctaTextB]);

  const handleRenderABTestPreview = () => {
    let configAIsValid = false;
    let configBIsValid = false;
    try { const d = JSON.parse(generatedJsonA); if(d.headline && d.subHeadline && d.ctaText) configAIsValid = true; } catch (e) {}
    try { const d = JSON.parse(generatedJsonB); if(d.headline && d.subHeadline && d.ctaText) configBIsValid = true; } catch (e) {}

    if (!configAIsValid || !configBIsValid) {
         toast({ title: 'A/B Config Incomplete for Preview', description: 'Please ensure all fields for both Version A and B are filled.', variant: 'destructive'});
        return;
    }
    try {
        const query = new URLSearchParams();
        query.set('configA', generatedJsonA);
        query.set('configB', generatedJsonB);
        window.open(`/landing-preview?${query.toString()}`, '_blank');
    } catch (error) {
        toast({ title: 'Error Preparing A/B Preview', variant: 'destructive'});
        console.error("Error preparing A/B preview link: ", error);
    }
  };

  const saveABTestConfiguration = (version: 'A' | 'B') => {
    const name = (version === 'A' ? nameForConfigA : nameForConfigB).trim();
    const currentHeadline = version === 'A' ? headlineA : headlineB;
    const currentSubHeadline = version === 'A' ? subHeadlineA : subHeadlineB;
    const currentCtaText = version === 'A' ? ctaTextA : ctaTextB;
    const currentCampaignFocus = version === 'A' ? campaignFocusA : campaignFocusB;

    if (!name) { toast({ title: 'Config Name Missing', description: `Enter name for Version ${version}.`, variant: 'destructive' }); return; }
    if (!currentHeadline.trim() || !currentSubHeadline.trim() || !currentCtaText.trim()) {
      toast({ title: 'Content Missing', description: `Fill content for Version ${version}.`, variant: 'destructive' }); return;
    }

    const existingConfigIndex = savedABTestConfigs.findIndex(c => c.name === name);
    if (existingConfigIndex !== -1) {
      const updatedConfigs = savedABTestConfigs.map((config, index) => 
        index === existingConfigIndex 
        ? { ...config, name, headline: currentHeadline.trim(), subHeadline: currentSubHeadline.trim(), ctaText: currentCtaText.trim(), campaignFocus: currentCampaignFocus.trim() }
        : config
      );
      setSavedABTestConfigs(updatedConfigs);
      toast({ title: 'A/B Config Updated!', description: `"${name}" updated.` });
    } else {
      const newConfig: ManagedABTestHeroConfig = { id: Date.now().toString(), name, headline: currentHeadline.trim(), subHeadline: currentSubHeadline.trim(), ctaText: currentCtaText.trim(), campaignFocus: currentCampaignFocus.trim() };
      setSavedABTestConfigs(prev => [...prev, newConfig]);
      toast({ title: 'A/B Config Saved!', description: `"${newConfig.name}" saved locally.` });
    }
    if (version === 'A') setNameForConfigA(''); else setNameForConfigB('');
  };

  const loadABTestConfigIntoVersion = (configId: string, versionToLoadInto: 'A' | 'B') => {
    const configToLoad = savedABTestConfigs.find(c => c.id === configId);
    if (!configToLoad) { toast({ title: 'Error', description: 'Could not find A/B config.', variant: 'destructive'}); return; }
    if (versionToLoadInto === 'A') {
      setHeadlineA(configToLoad.headline); setSubHeadlineA(configToLoad.subHeadline); setCtaTextA(configToLoad.ctaText);
      setCampaignFocusA(configToLoad.campaignFocus || ''); setNameForConfigA(configToLoad.name); 
    } else {
      setHeadlineB(configToLoad.headline); setSubHeadlineB(configToLoad.subHeadline); setCtaTextB(configToLoad.ctaText);
      setCampaignFocusB(configToLoad.campaignFocus || ''); setNameForConfigB(configToLoad.name);
    }
    toast({ title: 'A/B Config Loaded', description: `"${configToLoad.name}" loaded into Version ${versionToLoadInto}.` });
  };

  const deleteSavedABTestConfig = (configId: string) => {
    const configToDelete = savedABTestConfigs.find(c => c.id === configId);
    setSavedABTestConfigs(prev => prev.filter(c => c.id !== configId));
    toast({ title: 'A/B Config Deleted', description: `"${configToDelete?.name || 'Config'}" deleted.` });
  };

  const accordionItems = [
    {
      value: "step-1",
      title: "Step 1: Review Recommendations",
      icon: <UploadCloud className="mr-2 h-5 w-5 text-primary" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Upload Page Blueprint JSON</CardTitle>
            <CardDescription>Upload the JSON file containing recommendations from the URL scraping tool. This will form the base for your new landing page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept=".json" onChange={handleFileUpload} className="text-base" />
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            {uploadedBlueprint && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h4 className="font-semibold text-lg mb-2">Blueprint Loaded: {uploadedBlueprint.pageName}</h4>
                <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-60">{JSON.stringify(uploadedBlueprint, null, 2)}</pre>
                <Button onClick={() => setActiveAccordionItem('step-2')} className="mt-4">
                  Proceed to Build <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      value: "step-2",
      title: "Step 2: Build & Preview Page",
      icon: <Eye className="mr-2 h-5 w-5 text-primary" />,
      disabled: !activeHeroConfig,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Preview Landing Page (Hero Section)</CardTitle>
            <CardDescription>This is a preview of the Hero section based on the loaded blueprint. You can adjust it in the next step.</CardDescription>
          </CardHeader>
          <CardContent>
            {!activeHeroConfig && <p className="text-muted-foreground">Load a blueprint in Step 1 to see a preview.</p>}
            {activeHeroConfig && (
              <>
                <HeroSection 
                  headline={activeHeroConfig.headline}
                  subHeadline={activeHeroConfig.subHeadline}
                  ctaText={activeHeroConfig.ctaText}
                />
                <Button onClick={() => setActiveAccordionItem('step-3')} className="mt-6">
                  Proceed to Adjust <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      value: "step-3",
      title: "Step 3: Adjust Content",
      icon: <Edit3 className="mr-2 h-5 w-5 text-primary" />,
      disabled: !activeHeroConfig,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Adjust Hero Section Content</CardTitle>
            <CardDescription>Fine-tune the content for the Hero section. Changes here will update the active page blueprint and can be used as Version A in A/B testing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!activeHeroConfig && <p className="text-muted-foreground">Load a blueprint in Step 1 and preview in Step 2 before adjusting.</p>}
            {activeHeroConfig && (
              <>
                <div>
                  <Label htmlFor="adjustHeadline" className="text-base font-medium">Headline</Label>
                  <Input id="adjustHeadline" value={activeHeroConfig.headline || ''} onChange={(e) => handleHeroConfigChange('headline', e.target.value)} className="mt-1 text-base" />
                </div>
                <div>
                  <Label htmlFor="adjustSubHeadline" className="text-base font-medium">Sub-Headline</Label>
                  <Input id="adjustSubHeadline" value={activeHeroConfig.subHeadline || ''} onChange={(e) => handleHeroConfigChange('subHeadline', e.target.value)} className="mt-1 text-base" />
                </div>
                <div>
                  <Label htmlFor="adjustCtaText" className="text-base font-medium">CTA Text</Label>
                  <Input id="adjustCtaText" value={activeHeroConfig.ctaText || ''} onChange={(e) => handleHeroConfigChange('ctaText', e.target.value)} className="mt-1 text-base" />
                </div>
                <div>
                  <Label htmlFor="adjustUVP" className="text-base font-medium">Unique Value Proposition (UVP for Hero)</Label>
                  <Textarea id="adjustUVP" value={activeHeroConfig.uniqueValueProposition || ''} onChange={(e) => handleHeroConfigChange('uniqueValueProposition', e.target.value)} className="mt-1 text-base" rows={2} />
                </div>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1"/> Content updated.</p>
                    <Button onClick={() => setActiveAccordionItem('step-4')}>
                    Configure A/B Test <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      value: "step-4",
      title: "Step 4: Configure A/B Test",
      icon: <Settings className="mr-2 h-5 w-5 text-primary" />,
      disabled: !activeHeroConfig,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>A/B Test Hero Section Configurator</CardTitle>
            <CardDescription>
              Configure two versions (A and B) of hero section content. Version A is pre-filled from your adjusted content.
              Use AI suggestions, save, manage, and load your configurations locally. Then, preview both active versions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!activeHeroConfig && <p className="text-muted-foreground">Adjust content in Step 3 before configuring A/B tests.</p>}
            {activeHeroConfig && (
              <>
                <ABTestConfigForm
                  version="A"
                  headline={headlineA} setHeadline={setHeadlineA}
                  subHeadline={subHeadlineA} setSubHeadline={setSubHeadlineA}
                  ctaText={ctaTextA} setCtaText={setCtaTextA}
                  campaignFocus={campaignFocusA} setCampaignFocus={setCampaignFocusA}
                  generatedJson={generatedJsonA}
                  configName={nameForConfigA} setConfigName={setNameForConfigA}
                  onSave={() => saveABTestConfiguration('A')}
                />
                <ABTestConfigForm
                  version="B"
                  headline={headlineB} setHeadline={setHeadlineB}
                  subHeadline={subHeadlineB} setSubHeadline={setSubHeadlineB}
                  ctaText={ctaTextB} setCtaText={setCtaTextB}
                  campaignFocus={campaignFocusB} setCampaignFocus={setCampaignFocusB}
                  generatedJson={generatedJsonB}
                  configName={nameForConfigB} setConfigName={setNameForConfigB}
                  onSave={() => saveABTestConfiguration('B')}
                />
                <div className="mt-8 pt-6 border-t border-border text-center">
                  <Button 
                    onClick={handleRenderABTestPreview} 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm whitespace-normal sm:px-6 md:px-8 md:py-3 md:text-base md:whitespace-nowrap"
                  >
                    <Eye className="mr-2 h-5 w-5" /> Render A/B Versions for Preview
                  </Button>
                </div>
                <Separator className="my-10" />
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Managed A/B Hero Configurations (Local)</CardTitle>
                    <CardDescription>Load saved A/B configurations into Version A or B forms, or delete them.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    {isLoadingABTestConfigs && <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /> Loading...</div>}
                    {!isLoadingABTestConfigs && savedABTestConfigs.length === 0 && <p className="text-muted-foreground text-center py-4">No A/B configurations saved.</p>}
                    {!isLoadingABTestConfigs && savedABTestConfigs.length > 0 && (
                      <div className="border border-border rounded-lg overflow-hidden">
                        {savedABTestConfigs.map((config, index) => (
                          <div key={config.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3 ${index % 2 === 0 ? 'bg-card' : 'bg-muted/50'} ${index < savedABTestConfigs.length - 1 ? 'border-b border-border' : ''}`}>
                            <div className="flex-grow mb-3 sm:mb-0 min-w-0"> 
                              <p className="font-semibold text-foreground">{config.name}</p>
                              <p className="text-sm text-muted-foreground break-words">Headline: {config.headline}</p> 
                              {config.campaignFocus && <p className="text-xs text-muted-foreground mt-1">Focus: {config.campaignFocus}</p>}
                            </div>
                            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
                              <Button onClick={() => loadABTestConfigIntoVersion(config.id, 'A')} variant="outline" size="sm" className="w-full sm:w-auto">Load to A</Button>
                              <Button onClick={() => loadABTestConfigIntoVersion(config.id, 'B')} variant="outline" size="sm" className="w-full sm:w-auto">Load to B</Button>
                              <Button onClick={() => deleteSavedABTestConfig(config.id)} variant="destructive" size="sm" className="w-full sm:w-auto"><Trash2 /> Delete</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                 <Button onClick={() => setActiveAccordionItem('step-5')} className="mt-8 w-full">
                    Proceed to Deployment Steps <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      value: "step-5",
      title: "Step 5: Prepare for Deployment",
      icon: <Rocket className="mr-2 h-5 w-5 text-primary" />,
      disabled: !generatedJsonA || !generatedJsonB, // Or some other validation from Step 4
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Instructions</CardTitle>
            <CardDescription>Follow these steps to use your configured A/B test variations in Firebase.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 mt-0.5 shrink-0 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-lg font-semibold text-foreground mb-2">Ready to Start Your A/B Test in Firebase?</p>
                        <p className="mb-3">
                            After configuring and previewing your content variations using this tool:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                            <li>
                                <strong>Prepare JSON:</strong> Ensure you have copied or downloaded the JSON for both Version A and Version B (from Step 4) using the buttons within each version's card. These JSON strings are what you'll use in Firebase.
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
                                <strong>Consult the Playbook:</strong> For detailed, step-by-step instructions on creating the A/B test in Firebase (including setting up parameters, goals, and targeting), please refer to the <strong>`PLAYBOOK.md`</strong> file. 
                                <div className="mt-2 text-xs flex items-center text-muted-foreground">
                                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                                  <span>This crucial document is located in the root directory of this project and provides comprehensive guidance.</span>
                                </div>
                            </li>
                        </ol>
                        <p className="mt-4 text-xs italic">
                           Remember, this tool helps you prepare and manage content variations. The actual A/B test (targeting users, measuring results) is run and managed within the Firebase A/B Testing platform.
                        </p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl rounded-lg">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg text-center">
          <CardTitle className="text-3xl font-bold text-primary">Landing Page Creation & A/B Testing Workflow</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Follow these steps to build, adjust, and A/B test your landing page content.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Accordion 
            type="single" 
            collapsible 
            className="w-full" 
            value={activeAccordionItem}
            onValueChange={setActiveAccordionItem}
          >
            {accordionItems.map(item => (
              <AccordionItem value={item.value} key={item.value} disabled={item.disabled}>
                <AccordionTrigger className="text-lg hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="flex items-center">
                    {item.icon}
                    {item.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
