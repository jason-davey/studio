
'use client';

import { useState, type ChangeEvent, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, Info, Download, Eye, ExternalLink, BookOpen, Save, Trash2, Loader2, Sparkles, RefreshCcw, UploadCloud, ChevronRight, CheckCircle, Edit3, Settings, Rocket, Image as ImageIconLucide, Type, MessageSquare as MessageSquareIconLucide, ListChecks, Palette, Edit, Award as AwardIcon, BarChart3 as StatisticIcon, BadgeCent, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { suggestHeroCopy, type SuggestHeroCopyInput } from '@/ai/flows/suggest-hero-copy-flow';

import Header from '@/components/landing/Header'; // For preview, not directly used but needed for context
import HeroSection from '@/components/landing/HeroSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import TrustSignalsSection from '@/components/landing/TrustSignalsSection';
import QuoteFormSection from '@/components/landing/QuoteFormSection';
import Footer from '@/components/landing/Footer'; // For preview context

import type { PageBlueprint, RecommendationHeroConfig, RecommendationBenefit, RecommendationTestimonial, RecommendationTrustSignal, RecommendationFormConfig, SectionVisibility } from '@/types/recommendations';

import { WalkthroughProvider, useWalkthrough } from '@/contexts/WalkthroughContext';
import WelcomeModal from '@/components/walkthrough/WelcomeModal';
import HighlightCallout from '@/components/walkthrough/HighlightCallout';
import FeedbackModal from '@/components/shared/FeedbackModal';
import { TOP_BAR_HEIGHT_PX } from '@/components/layout/TopBar';
import { useUIActions } from '@/contexts/UIActionContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';


interface ABTestHeroConfig {
  headline: string;
  subHeadline: string;
  ctaText: string;
  campaignFocus?: string;
}

interface ManagedABTestHeroConfig extends ABTestHeroConfig {
  id: string;
  name: string;
}

const AB_TEST_LOCAL_STORAGE_KEY = 'heroConfigManager';
const PAGE_BLUEPRINT_LOCAL_STORAGE_KEY = 'pageBlueprintManager'; // New key

interface ManagedPageBlueprint extends PageBlueprint {
  id: string;
  name: string;
}

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

const ConfigForm = ({
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
        productName: "SecureTomorrow Life Insurance",
        productDescription: "Life insurance for families, offering cashback and a free will.",
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
    fieldSetter: (val: string) => void,
    buttonId?: string,
  ) => (
    <Popover open={aiState.popoverOpen} onOpenChange={(open) => aiStateSetter(prev => ({...prev, popoverOpen: open}))}>
      <PopoverTrigger asChild>
        <Button
          id={buttonId}
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
      <CardTitle className="text-xl font-semibold text-primary">Version {version} Hero Content</CardTitle>
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
        <p className="text-xs text-muted-foreground mt-1">Helps AI tailor suggestions. Saved with this Hero configuration.</p>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`headline${version}-input`} className="text-base font-medium text-foreground">Headline</Label>
          {renderAISuggestionPopover(headline, 'headline', aiStateHeadline, setAiStateHeadline, setHeadline, version === 'A' ? 'ai-suggest-headlineA-button' : 'ai-suggest-headlineB-button')}
        </div>
        <Input
          id={`headline${version}-input`}
          type="text"
          value={headline}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setHeadline(e.target.value)}
          placeholder={`Enter headline for Version ${version}`}
          className="mt-1 text-base"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`subHeadline${version}-input`} className="text-base font-medium text-foreground">Sub-Headline</Label>
          {renderAISuggestionPopover(subHeadline, 'subHeadline', aiStateSubHeadline, setAiStateSubHeadline, setSubHeadline)}
        </div>
        <Input
          id={`subHeadline${version}-input`}
          type="text"
          value={subHeadline}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSubHeadline(e.target.value)}
          placeholder={`Enter sub-headline for Version ${version}`}
          className="mt-1 text-base"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
         <Label htmlFor={`ctaText${version}-input`} className="text-base font-medium text-foreground">Call to Action (CTA) Text</Label>
         {renderAISuggestionPopover(ctaText, 'ctaText', aiStateCtaText, setAiStateCtaText, setCtaText)}
        </div>
        <Input
          id={`ctaText${version}-input`}
          type="text"
          value={ctaText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCtaText(e.target.value)}
          placeholder={`Enter CTA text for Version ${version}`}
          className="mt-1 text-base"
        />
      </div>

      {generatedJson && (JSON.parse(generatedJson).headline !== "" || JSON.parse(generatedJson).subHeadline !== "" || JSON.parse(generatedJson).ctaText !== "") && (
        <div className="mt-6 pt-4 border-t border-border space-y-3">
          <Label htmlFor={`generatedJson${version}`} className="text-base font-medium text-foreground">Generated JSON for Version {version} Hero</Label>
          <Textarea
            id={`generatedJson${version}`}
            value={generatedJson}
            readOnly
            rows={6}
            className="font-mono text-sm bg-muted/50 border-border p-3 rounded-md"
            aria-label={`Generated JSON configuration for Version ${version} Hero`}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleCopyToClipboard(generatedJson, `Version ${version} Hero`, toast)} variant="outline" size="sm">
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy JSON
            </Button>
            <Button onClick={() => handleDownloadJson(generatedJson, `Version ${version} Hero`, toast)} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Download JSON
            </Button>
          </div>
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-border space-y-3">
        <Label htmlFor={`configName${version}-input`} className="text-base font-medium text-foreground">Save Version {version} Hero Content As:</Label>
        <div className="flex gap-2">
          <Input
            id={`configName${version}-input`}
            type="text"
            value={configName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfigName(e.target.value)}
            placeholder={`Name for this Hero config (e.g., Spring Promo ${version})`}
            className="text-base flex-grow"
          />
          <Button onClick={onSave} variant="outline" size="sm" id={`save-config-${version}-button`}>
            <Save className="mr-2 h-4 w-4" /> Save Hero Content
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};

const handleCopyToClipboard = async (jsonString: string, configType: string, toastFn: Function) => {
  if (!jsonString || (configType.includes("Hero") && JSON.parse(jsonString).headline === "")) {
    toastFn({
      title: `Nothing to Copy for ${configType}`,
      description: 'Please fill in the content fields for this configuration.',
      variant: 'destructive',
    });
    return;
  }
  try {
    await navigator.clipboard.writeText(jsonString);
    toastFn({
      title: `Copied to Clipboard (${configType})!`,
      description: 'The JSON configuration has been copied.',
    });
  } catch (err) {
    console.error(`Failed to copy ${configType} JSON: `, err);
    toastFn({
      title: `Copy Failed (${configType})`,
      description: 'Could not copy the JSON to clipboard. Please copy it manually.',
      variant: 'destructive',
    });
  }
};

const handleDownloadJson = (jsonString: string, configType: string, toastFn: Function) => {
  if (!jsonString || (configType.includes("Hero") && JSON.parse(jsonString).headline === "")) {
     toastFn({
      title: `Nothing to Download for ${configType}`,
      description: 'Please fill in the content fields for this configuration.',
      variant: 'destructive',
    });
    return;
  }
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${configType.toLowerCase().replace(/\s+/g, '-')}-config.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toastFn({
    title: `JSON Downloaded (${configType})!`,
    description: `${configType.toLowerCase().replace(/\s+/g, '-')}-config.json has been downloaded.`,
  });
};


function LandingPageWorkflowPageContent() {
  console.log("Rendering LandingPageWorkflowPageContent");
  const { toast } = useToast();
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>('step-1');

  const walkthrough = useWalkthrough();
  const uiActions = useUIActions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to bridge global UIActionContext's showWelcomeModal to WalkthroughContext's startWalkthrough
 useEffect(() => {
    console.log("page.tsx: uiActions.showWelcomeModal changed to:", uiActions.showWelcomeModal);
    if (uiActions.showWelcomeModal && walkthrough) { // Ensure walkthrough is defined
      console.log("page.tsx: Calling walkthrough.startWalkthrough()");
      walkthrough.startWalkthrough();
    }
  }, [uiActions.showWelcomeModal, walkthrough]);


  const [uploadedBlueprint, setUploadedBlueprint] = useState<PageBlueprint | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const defaultSectionVisibility: SectionVisibility = {
    hero: true,
    benefits: true,
    testimonials: true,
    trustSignals: true,
    form: true,
  };

  const initialBlueprintState: PageBlueprint = {
    pageName: 'Untitled Page',
    targetUrl: '',
    seoTitle: '',
    executiveSummary: '',
    keyRecommendationsSummary: '',
    heroConfig: { headline: '', subHeadline: '', ctaText: '', uniqueValueProposition: '', heroImageUrl: '', heroImageAltText: ''},
    benefits: [],
    testimonials: [],
    trustSignals: [],
    formConfig: { headline: '', ctaText: '' },
    sectionVisibility: { ...defaultSectionVisibility }
  };
  const [activePageBlueprint, setActivePageBlueprint] = useState<PageBlueprint>(initialBlueprintState);
  
  const [nameForCurrentBlueprint, setNameForCurrentBlueprint] = useState<string>('');
  const [savedPageBlueprints, setSavedPageBlueprints] = useState<ManagedPageBlueprint[]>([]);
  const [isLoadingPageBlueprints, setIsLoadingPageBlueprints] = useState(true);


  const handleLoadBlueprintFromWalkthrough = useCallback((blueprint: PageBlueprint) => {
    const blueprintWithVisibility = {
      ...blueprint,
      sectionVisibility: blueprint.sectionVisibility || { ...defaultSectionVisibility }
    };
    setActivePageBlueprint(blueprintWithVisibility);
    setUploadedBlueprint(blueprintWithVisibility);
    setFileName("sample-blueprint.json");
    toast({ title: 'Sample Blueprint Loaded!', description: 'A sample blueprint has been loaded for the walkthrough.' });
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__blueprintForWalkthrough && !uploadedBlueprint && walkthrough) {
        walkthrough.autoLoadSampleBlueprint(); // This will call the callback registered with WalkthroughProvider
        delete (window as any).__blueprintForWalkthrough; // Clean up global flag
    }
  }, [uploadedBlueprint, walkthrough]);


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

  // Load saved page blueprints from local storage on mount
  useEffect(() => {
    setIsLoadingPageBlueprints(true);
    try {
      const storedBlueprints = localStorage.getItem(PAGE_BLUEPRINT_LOCAL_STORAGE_KEY);
      if (storedBlueprints) {
        setSavedPageBlueprints(JSON.parse(storedBlueprints));
      }
    } catch (error) {
      console.error("Error loading page blueprints from localStorage:", error);
      toast({ title: 'Error Loading Saved Blueprints', description: 'Could not load blueprints from your browser storage.', variant: 'destructive' });
    } finally {
      setIsLoadingPageBlueprints(false);
    }
  }, [toast]);

  // Persist saved page blueprints to local storage when they change
  useEffect(() => {
    if (!isLoadingPageBlueprints) {
      try {
        localStorage.setItem(PAGE_BLUEPRINT_LOCAL_STORAGE_KEY, JSON.stringify(savedPageBlueprints));
      } catch (error) {
        console.error("Error saving page blueprints to localStorage:", error);
        toast({ title: 'Error Persisting Blueprints', description: 'Could not save blueprints to your browser storage.', variant: 'destructive'});
      }
    }
  }, [savedPageBlueprints, isLoadingPageBlueprints, toast]);


  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setUploadedBlueprint(null);
    setActivePageBlueprint(initialBlueprintState); 
    setFileName('');

    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const parsedJson = JSON.parse(content) as PageBlueprint;
            if (parsedJson.pageName && parsedJson.heroConfig) {
              const blueprintWithVisibility = {
                ...initialBlueprintState, 
                ...parsedJson,
                sectionVisibility: {
                  ...defaultSectionVisibility,
                  ...(parsedJson.sectionVisibility || {}), 
                }
              };
              setUploadedBlueprint(blueprintWithVisibility);
              setActivePageBlueprint(blueprintWithVisibility);
              toast({ title: 'Blueprint Loaded!', description: `"${parsedJson.pageName}" recommendations loaded.` });
              setActiveAccordionItem('step-2');
            } else {
              throw new Error('Invalid blueprint structure. Missing required fields like pageName or heroConfig.');
            }
          } catch (error: any) {
            console.error('Error parsing JSON file:', error);
            setFileError(`Error parsing JSON: ${error.message}. Ensure it's a valid PageBlueprint JSON.`);
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
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleSimpleBlueprintFieldChange = <K extends keyof PageBlueprint>(field: K, value: PageBlueprint[K]) => {
    setActivePageBlueprint(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedObjectChange = <S extends 'heroConfig' | 'formConfig'>(
    section: S,
    field: keyof NonNullable<PageBlueprint[S]>,
    value: string
  ) => {
    setActivePageBlueprint(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any || {}), 
        [field]: value,
      },
    }));
  };
  
  const handleSectionVisibilityChange = (section: keyof SectionVisibility, isVisible: boolean) => {
    setActivePageBlueprint(prev => ({
      ...prev,
      sectionVisibility: {
        ...(prev.sectionVisibility || defaultSectionVisibility),
        [section]: isVisible,
      }
    }));
  };


  const handleArrayObjectChange = <S extends 'benefits' | 'testimonials' | 'trustSignals'>(
    section: S,
    index: number,
    field: keyof NonNullable<PageBlueprint[S]>[number],
    value: string | boolean // Allow boolean for potential future fields like 'isFeatured'
  ) => {
    setActivePageBlueprint(prev => {
      const newArray = [...(prev[section] || [])] as any[];
      if (newArray[index]) {
        newArray[index] = {
          ...newArray[index],
          [field]: value,
        };
      }
      return { ...prev, [section]: newArray as any };
    });
  };


  useEffect(() => {
    if (activePageBlueprint.heroConfig && (activeAccordionItem === 'step-4' || (walkthrough?.isWalkthroughActive && walkthrough.steps[walkthrough.currentStepIndex]?.requiresAccordionOpen === 'step-4'))) {
      setHeadlineA(activePageBlueprint.heroConfig.headline || '');
      setSubHeadlineA(activePageBlueprint.heroConfig.subHeadline || '');
      setCtaTextA(activePageBlueprint.heroConfig.ctaText || '');
      setCampaignFocusA((activePageBlueprint.heroConfig as any)?.campaignFocus || '');
    }
  }, [activePageBlueprint.heroConfig, activeAccordionItem, walkthrough?.isWalkthroughActive, walkthrough?.currentStepIndex, walkthrough?.steps]);

  useEffect(() => {
    setIsLoadingABTestConfigs(true);
    try {
      const storedConfigs = localStorage.getItem(AB_TEST_LOCAL_STORAGE_KEY);
      if (storedConfigs) {
        setSavedABTestConfigs(JSON.parse(storedConfigs));
      }
    } catch (error) {
      console.error("Error loading A/B test configs from localStorage:", error);
      toast({ title: 'Error Loading Saved A/B Configurations', description: 'Could not load configurations from your browser storage.', variant: 'destructive' });
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
        toast({ title: 'Error Persisting A/B Configurations', description: 'Could not save configurations to your browser storage.', variant: 'destructive'});
      }
    }
  }, [savedABTestConfigs, isLoadingABTestConfigs, toast]);

  const generateABTestJson = (headline: string, subHeadline: string, ctaText: string, campaignFocus: string): string => {
    const config: ABTestHeroConfig = {
        headline: headline.trim(),
        subHeadline: subHeadline.trim(),
        ctaText: ctaText.trim(),
    };
    if (campaignFocus.trim()) {
        config.campaignFocus = campaignFocus.trim();
    }
    if (!config.headline && !config.subHeadline && !config.ctaText && !config.campaignFocus) {
        return JSON.stringify({ headline: '', subHeadline: '', ctaText: '', campaignFocus: '' } as ABTestHeroConfig, null, 2);
    }
    return JSON.stringify(config, null, 2);
  };

  useEffect(() => { setGeneratedJsonA(generateABTestJson(headlineA, subHeadlineA, ctaTextA, campaignFocusA)); }, [headlineA, subHeadlineA, ctaTextA, campaignFocusA]);
  useEffect(() => { setGeneratedJsonB(generateABTestJson(headlineB, subHeadlineB, ctaTextB, campaignFocusB)); }, [headlineB, subHeadlineB, ctaTextB, campaignFocusB]);

  const handleRenderABTestPreview = () => {
    if (!activePageBlueprint || !activePageBlueprint.pageName) {
      toast({ title: 'No Active Blueprint', description: 'Please load or define a page blueprint in Step 1 & 3 before previewing A/B versions.', variant: 'destructive'});
      return;
    }

    let blueprintAForPreview: PageBlueprint = { ...activePageBlueprint };
    let blueprintBForPreview: PageBlueprint = { ...activePageBlueprint }; 

    const heroConfigA = JSON.parse(generatedJsonA) as RecommendationHeroConfig;
    const heroConfigB = JSON.parse(generatedJsonB) as RecommendationHeroConfig;

    if (heroConfigA.headline || heroConfigA.subHeadline || heroConfigA.ctaText) {
      blueprintAForPreview.heroConfig = { ...blueprintAForPreview.heroConfig, ...heroConfigA };
    }
    if (heroConfigB.headline || heroConfigB.subHeadline || heroConfigB.ctaText) {
      blueprintBForPreview.heroConfig = { ...blueprintBForPreview.heroConfig, ...heroConfigB };
    }
    
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('previewBlueprintA', JSON.stringify(blueprintAForPreview));
            sessionStorage.setItem('previewBlueprintB', JSON.stringify(blueprintBForPreview));
            window.open('/landing-preview', '_blank'); 
        } else {
            throw new Error("Session storage is not available.");
        }
    } catch (error) {
        toast({ title: 'Error Preparing A/B Preview', description: `Could not prepare for the A/B preview page. ${error instanceof Error ? error.message : ''}`, variant: 'destructive'});
        console.error("Error preparing A/B preview: ", error);
    }
  };


 const saveABHeroConfiguration = (version: 'A' | 'B') => {
    const name = (version === 'A' ? nameForConfigA : nameForConfigB).trim();
    const currentHeadline = version === 'A' ? headlineA : headlineB;
    const currentSubHeadline = version === 'A' ? subHeadlineA : subHeadlineB;
    const currentCtaText = version === 'A' ? ctaTextA : ctaTextB;
    const currentCampaignFocus = (version === 'A' ? campaignFocusA : campaignFocusB).trim();

    if (!name) { toast({ title: 'Config Name Missing', description: `Please enter a name for Version ${version} Hero content before saving.`, variant: 'destructive' }); return; }
    if (!currentHeadline.trim() && !currentSubHeadline.trim() && !currentCtaText.trim()) {
      toast({ title: 'Content Missing', description: `Please fill in Headline, Sub-Headline, and CTA Text for Version ${version} Hero before saving.`, variant: 'destructive' }); return;
    }

    const newConfigData: Omit<ManagedABTestHeroConfig, 'id' | 'name'> = {
        headline: currentHeadline.trim(),
        subHeadline: currentSubHeadline.trim(),
        ctaText: currentCtaText.trim(),
        campaignFocus: currentCampaignFocus || undefined,
    };

    setSavedABTestConfigs(prev => {
      const existingConfigIndex = prev.findIndex(c => c.name === name);
      if (existingConfigIndex !== -1) {
        const updatedConfigs = [...prev];
        updatedConfigs[existingConfigIndex] = { ...prev[existingConfigIndex], ...newConfigData };
        toast({ title: 'A/B Hero Config Updated!', description: `Local Hero configuration "${name}" has been updated.` });
        return updatedConfigs;
      } else {
        const newConfig: ManagedABTestHeroConfig = { id: Date.now().toString(), name, ...newConfigData };
        toast({ title: 'A/B Hero Config Saved!', description: `Hero configuration "${newConfig.name}" saved locally.` });
        return [...prev, newConfig];
      }
    });

    if (version === 'A') setNameForConfigA(''); else setNameForConfigB('');
  };

  const loadABHeroConfigIntoVersion = (configId: string, versionToLoadInto: 'A' | 'B') => {
    const configToLoad = savedABTestConfigs.find(c => c.id === configId);
    if (!configToLoad) { toast({ title: 'Error', description: 'Could not find the selected A/B Hero configuration.', variant: 'destructive'}); return; }
    if (versionToLoadInto === 'A') {
      setHeadlineA(configToLoad.headline); setSubHeadlineA(configToLoad.subHeadline); setCtaTextA(configToLoad.ctaText);
      setCampaignFocusA(configToLoad.campaignFocus || ''); setNameForConfigA(configToLoad.name);
    } else {
      setHeadlineB(configToLoad.headline); setSubHeadlineB(configToLoad.subHeadline); setCtaTextB(configToLoad.ctaText);
      setCampaignFocusB(configToLoad.campaignFocus || ''); setNameForConfigB(configToLoad.name);
    }
    toast({ title: 'A/B Hero Config Loaded', description: `Hero configuration "${configToLoad.name}" loaded into Version ${versionToLoadInto}.` });
  };

  const deleteSavedABTestConfig = (configId: string) => {
    const configToDelete = savedABTestConfigs.find(c => c.id === configId);
    setSavedABTestConfigs(prev => prev.filter(c => c.id !== configId));
    toast({ title: 'A/B Hero Config Deleted', description: `Local Hero configuration "${configToDelete?.name || 'Config'}" has been deleted.` });
  };

  const handleSaveCurrentBlueprint = () => {
    const name = nameForCurrentBlueprint.trim();
    if (!name) {
      toast({ title: 'Blueprint Name Missing', description: 'Please enter a name for the blueprint before saving.', variant: 'destructive' });
      return;
    }
    if (!activePageBlueprint || !activePageBlueprint.pageName) {
      toast({ title: 'No Active Blueprint', description: 'Please load or define a blueprint before saving.', variant: 'destructive' });
      return;
    }

    setSavedPageBlueprints(prev => {
      const existingIndex = prev.findIndex(bp => bp.name === name);
      const newBlueprintToSave: ManagedPageBlueprint = { ...activePageBlueprint, id: existingIndex !== -1 ? prev[existingIndex].id : Date.now().toString(), name };
      
      if (existingIndex !== -1) {
        const updatedBlueprints = [...prev];
        updatedBlueprints[existingIndex] = newBlueprintToSave;
        toast({ title: 'Page Blueprint Updated!', description: `Blueprint "${name}" has been updated locally.` });
        return updatedBlueprints;
      } else {
        toast({ title: 'Page Blueprint Saved!', description: `Blueprint "${name}" has been saved locally.` });
        return [...prev, newBlueprintToSave];
      }
    });
    setNameForCurrentBlueprint(''); // Clear input after save
  };

  const handleLoadPageBlueprint = (blueprintId: string) => {
    const blueprintToLoad = savedPageBlueprints.find(bp => bp.id === blueprintId);
    if (blueprintToLoad) {
      setActivePageBlueprint(blueprintToLoad);
      setUploadedBlueprint(blueprintToLoad); // Treat as if it was "uploaded"
      setFileName(blueprintToLoad.name); // Update file name indicator
      setNameForCurrentBlueprint(blueprintToLoad.name); // Pre-fill save name for convenience
      toast({ title: 'Page Blueprint Loaded!', description: `Blueprint "${blueprintToLoad.name}" is now active.` });
      setActiveAccordionItem('step-2'); // Move to preview
    } else {
      toast({ title: 'Error Loading Blueprint', description: 'Could not find the selected blueprint.', variant: 'destructive' });
    }
  };

  const handleDeletePageBlueprint = (blueprintId: string) => {
    const blueprintToDelete = savedPageBlueprints.find(bp => bp.id === blueprintId);
    setSavedPageBlueprints(prev => prev.filter(bp => bp.id !== blueprintId));
    toast({ title: 'Page Blueprint Deleted', description: `Blueprint "${blueprintToDelete?.name || 'Unnamed'}" has been deleted locally.` });
  };


  const accordionItems = [
    {
      value: "step-1",
      title: "Step 1: Review Recommendations",
      icon: <UploadCloud className="mr-2 h-5 w-5 text-primary" />,
      content: (
        <Card id="step-1-card">
          <CardHeader>
            <CardTitle>Upload Page Blueprint JSON</CardTitle>
            <CardDescription>Upload the JSON file containing recommendations for your landing page. This blueprint will populate the content for subsequent steps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center space-x-3">
                <Input
                  id="blueprint-upload-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  id="blueprint-upload-button"
                >
                  <UploadCloud className="mr-2 h-4 w-4" /> Choose File
                </Button>
                <span id="blueprint-file-name-indicator" className="text-sm text-muted-foreground">
                  {fileName || "No file chosen"}
                </span>
            </div>
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            {uploadedBlueprint && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h4 className="font-semibold text-lg mb-2">Blueprint Loaded: {fileName || uploadedBlueprint.pageName}</h4>
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
      icon: <Palette className="mr-2 h-5 w-5 text-primary" />,
      disabled: !uploadedBlueprint && !activePageBlueprint.pageName,
      content: (
        <Card id="step-2-card">
          <CardHeader>
            <CardTitle>Preview Landing Page</CardTitle>
            <CardDescription>This is a preview of the landing page based on the loaded or adjusted blueprint. Toggle section visibility in Step 3.</CardDescription>
          </CardHeader>
          <CardContent>
            {(!activePageBlueprint?.pageName || activePageBlueprint.pageName === 'Untitled Page' && !uploadedBlueprint) && <p className="text-muted-foreground">Load or define a blueprint in Step 1 or Step 3 to see a preview.</p>}
            {(activePageBlueprint?.pageName && activePageBlueprint.pageName !== 'Untitled Page' || uploadedBlueprint) && (
              <div id="step-2-preview-area" className="space-y-0 border border-border p-0 rounded-lg shadow-inner bg-background overflow-hidden">
                {activePageBlueprint.sectionVisibility?.hero && (
                  <HeroSection
                    headline={activePageBlueprint.heroConfig?.headline}
                    subHeadline={activePageBlueprint.heroConfig?.subHeadline}
                    ctaText={activePageBlueprint.heroConfig?.ctaText}
                    uniqueValueProposition={activePageBlueprint.heroConfig?.uniqueValueProposition}
                    heroImageUrl={activePageBlueprint.heroConfig?.heroImageUrl}
                    heroImageAltText={activePageBlueprint.heroConfig?.heroImageAltText}
                  />
                )}
                {activePageBlueprint.sectionVisibility?.benefits && (
                  <BenefitsSection benefits={activePageBlueprint.benefits} />
                )}
                {activePageBlueprint.sectionVisibility?.testimonials && (
                  <TestimonialsSection testimonials={activePageBlueprint.testimonials} />
                )}
                {activePageBlueprint.sectionVisibility?.trustSignals && (
                  <TrustSignalsSection trustSignals={activePageBlueprint.trustSignals} />
                )}
                {activePageBlueprint.sectionVisibility?.form && activePageBlueprint.formConfig && (
                    <QuoteFormSection 
                        headline={activePageBlueprint.formConfig.headline} 
                        ctaText={activePageBlueprint.formConfig.ctaText} 
                    />
                 )}

                <Button onClick={() => setActiveAccordionItem('step-3')} className="mt-6 w-full rounded-none">
                  Proceed to Adjust Content <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      value: "step-3",
      title: "Step 3: Adjust Content & Manage Blueprints",
      icon: <Edit className="mr-2 h-5 w-5 text-primary" />,
      disabled: !uploadedBlueprint && !activePageBlueprint.pageName,
      content: (
        <Card id="step-3-card">
          <CardHeader>
            <CardTitle>Adjust Content & Manage Full Page Blueprints</CardTitle>
            <CardDescription>Fine-tune content, toggle section visibility, and save/load full landing page blueprints locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(!activePageBlueprint?.pageName || activePageBlueprint.pageName === 'Untitled Page' && !uploadedBlueprint) && <p className="text-muted-foreground">Load a blueprint in Step 1 or from saved blueprints below to begin adjusting.</p>}
            {(activePageBlueprint?.pageName && activePageBlueprint.pageName !== 'Untitled Page' || uploadedBlueprint) && (
              <>
                {/* Page Information Section */}
                <Card className="bg-muted/50 p-1">
                  <CardHeader><CardTitle className="text-lg flex items-center"><Info className="mr-2 h-5 w-5" /> Page Information</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><Label htmlFor="bpPageName-adjust-input">Page Name</Label><Input id="bpPageName-adjust-input" value={activePageBlueprint.pageName} onChange={(e) => handleSimpleBlueprintFieldChange('pageName', e.target.value)} /></div>
                    <div><Label htmlFor="bpSeoTitle-adjust-input">SEO Title</Label><Input id="bpSeoTitle-adjust-input" value={activePageBlueprint.seoTitle || ''} onChange={(e) => handleSimpleBlueprintFieldChange('seoTitle', e.target.value)} /></div>
                    <div><Label htmlFor="bpTargetUrl-adjust-input">Target URL</Label><Input id="bpTargetUrl-adjust-input" value={activePageBlueprint.targetUrl || ''} onChange={(e) => handleSimpleBlueprintFieldChange('targetUrl', e.target.value)} /></div>
                    <div><Label htmlFor="bpExecSummary-adjust-input">Executive Summary</Label><Textarea id="bpExecSummary-adjust-input" value={activePageBlueprint.executiveSummary || ''} onChange={(e) => handleSimpleBlueprintFieldChange('executiveSummary', e.target.value)} rows={3}/></div>
                    <div><Label htmlFor="bpKeyRecs-adjust-input">Key Recommendations Summary</Label><Textarea id="bpKeyRecs-adjust-input" value={activePageBlueprint.keyRecommendationsSummary || ''} onChange={(e) => handleSimpleBlueprintFieldChange('keyRecommendationsSummary', e.target.value)} rows={3}/></div>
                  </CardContent>
                </Card>

                {/* Hero Section Adjustments */}
                <Card className="bg-muted/50 p-1">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center"><ImageIconLucide className="mr-2 h-5 w-5" /> Hero Section</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="hero-visible-switch" className="text-sm">Show</Label>
                      <Switch
                        id="hero-visible-switch"
                        checked={!!activePageBlueprint.sectionVisibility?.hero}
                        onCheckedChange={(checked) => handleSectionVisibilityChange('hero', checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className={cn("space-y-3", !activePageBlueprint.sectionVisibility?.hero && "opacity-50 pointer-events-none")}>
                    <div><Label htmlFor="heroHeadline-adjust-input">Headline</Label><Input id="heroHeadline-adjust-input" value={activePageBlueprint.heroConfig?.headline || ''} onChange={(e) => handleNestedObjectChange('heroConfig', 'headline', e.target.value)} /></div>
                    <div><Label htmlFor="heroSubHeadline-adjust-input">Sub-Headline</Label><Input id="heroSubHeadline-adjust-input" value={activePageBlueprint.heroConfig?.subHeadline || ''} onChange={(e) => handleNestedObjectChange('heroConfig', 'subHeadline', e.target.value)} /></div>
                    <div><Label htmlFor="heroCtaText-adjust-input">CTA Text</Label><Input id="heroCtaText-adjust-input" value={activePageBlueprint.heroConfig?.ctaText || ''} onChange={(e) => handleNestedObjectChange('heroConfig', 'ctaText', e.target.value)} /></div>
                    <div><Label htmlFor="heroUVP-adjust-input">Unique Value Proposition</Label><Textarea id="heroUVP-adjust-input" value={activePageBlueprint.heroConfig?.uniqueValueProposition || ''} onChange={(e) => handleNestedObjectChange('heroConfig', 'uniqueValueProposition', e.target.value)} rows={2}/></div>
                    <div><Label htmlFor="heroImageUrl-adjust-input">Image URL</Label><Input id="heroImageUrl-adjust-input" value={activePageBlueprint.heroConfig?.heroImageUrl || ''} onChange={(e) => handleNestedObjectChange('heroConfig', 'heroImageUrl', e.target.value)} /></div>
                    <div><Label htmlFor="heroImageAltText-adjust-input">Image Alt Text</Label><Input id="heroImageAltText-adjust-input" value={activePageBlueprint.heroConfig?.heroImageAltText || ''} onChange={(e) => handleNestedObjectChange('heroConfig', 'heroImageAltText', e.target.value)} /></div>
                  </CardContent>
                </Card>

                {/* Benefits Section Adjustments */}
                <Card className="bg-muted/50 p-1">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center"><ListChecks className="mr-2 h-5 w-5" /> Benefits Section</CardTitle>
                     <div className="flex items-center space-x-2">
                      <Label htmlFor="benefits-visible-switch" className="text-sm">Show</Label>
                      <Switch
                        id="benefits-visible-switch"
                        checked={!!activePageBlueprint.sectionVisibility?.benefits}
                        onCheckedChange={(checked) => handleSectionVisibilityChange('benefits', checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className={cn("space-y-4", !activePageBlueprint.sectionVisibility?.benefits && "opacity-50 pointer-events-none")}>
                    {(activePageBlueprint.benefits || []).map((benefit, index) => (
                      <Card key={`benefit-${index}-adjust`} className="p-3 bg-card shadow-sm">
                        <Label className="font-semibold text-md">Benefit {index + 1}</Label>
                        <div className="space-y-2 mt-1">
                          <div><Label htmlFor={`benefitTitle${index}-adjust-input`}>Title</Label><Input id={`benefitTitle${index}-adjust-input`} value={benefit.title} onChange={(e) => handleArrayObjectChange('benefits', index, 'title', e.target.value)} /></div>
                          <div><Label htmlFor={`benefitDesc${index}-adjust-input`}>Description</Label><Textarea id={`benefitDesc${index}-adjust-input`} value={benefit.description} onChange={(e) => handleArrayObjectChange('benefits', index, 'description', e.target.value)} rows={2}/></div>
                          <div><Label htmlFor={`benefitIcon${index}-adjust-input`}>Icon (Lucide Name)</Label><Input id={`benefitIcon${index}-adjust-input`} value={benefit.icon || ''} onChange={(e) => handleArrayObjectChange('benefits', index, 'icon', e.target.value)} /></div>
                        </div>
                      </Card>
                    ))}
                     {(!activePageBlueprint.benefits || activePageBlueprint.benefits.length === 0) && <p className="text-sm text-muted-foreground">No benefits defined in the current blueprint.</p>}
                  </CardContent>
                </Card>

                 {/* Testimonials Section Adjustments */}
                <Card className="bg-muted/50 p-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center"><MessageSquareIconLucide className="mr-2 h-5 w-5"/> Testimonials Section</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="testimonials-visible-switch" className="text-sm">Show</Label>
                          <Switch
                            id="testimonials-visible-switch"
                            checked={!!activePageBlueprint.sectionVisibility?.testimonials}
                            onCheckedChange={(checked) => handleSectionVisibilityChange('testimonials', checked)}
                          />
                        </div>
                    </CardHeader>
                    <CardContent className={cn("space-y-4", !activePageBlueprint.sectionVisibility?.testimonials && "opacity-50 pointer-events-none")}>
                        {(activePageBlueprint.testimonials || []).map((testimonial, index) => (
                            <Card key={`testimonial-${index}-adjust`} className="p-3 bg-card shadow-sm">
                                <Label className="font-semibold text-md">Testimonial {index + 1}</Label>
                                <div className="space-y-2 mt-1">
                                    <div><Label htmlFor={`testimonialName${index}-adjust-input`}>Name</Label><Input id={`testimonialName${index}-adjust-input`} value={testimonial.name} onChange={(e) => handleArrayObjectChange('testimonials',index, 'name', e.target.value)} /></div>
                                    <div><Label htmlFor={`testimonialLocation${index}-adjust-input`}>Location</Label><Input id={`testimonialLocation${index}-adjust-input`} value={testimonial.location || ''} onChange={(e) => handleArrayObjectChange('testimonials',index, 'location', e.target.value)} /></div>
                                    <div><Label htmlFor={`testimonialQuote${index}-adjust-input`}>Quote</Label><Textarea id={`testimonialQuote${index}-adjust-input`} value={testimonial.quote} onChange={(e) => handleArrayObjectChange('testimonials',index, 'quote', e.target.value)} rows={3}/></div>
                                    <div><Label htmlFor={`testimonialAvatarUrl${index}-adjust-input`}>Avatar Image URL</Label><Input id={`testimonialAvatarUrl${index}-adjust-input`} value={testimonial.avatarImageUrl || ''} onChange={(e) => handleArrayObjectChange('testimonials',index, 'avatarImageUrl', e.target.value)} /></div>
                                    <div><Label htmlFor={`testimonialInitial${index}-adjust-input`}>Avatar Initial</Label><Input id={`testimonialInitial${index}-adjust-input`} value={testimonial.avatarInitial || ''} onChange={(e) => handleArrayObjectChange('testimonials',index, 'avatarInitial', e.target.value)} /></div>
                                    <div><Label htmlFor={`testimonialSince${index}-adjust-input`}>Protected Since</Label><Input id={`testimonialSince${index}-adjust-input`} value={testimonial.since || ''} onChange={(e) => handleArrayObjectChange('testimonials',index, 'since', e.target.value)} /></div>
                                </div>
                            </Card>
                        ))}
                         {(!activePageBlueprint.testimonials || activePageBlueprint.testimonials.length === 0) && <p className="text-sm text-muted-foreground">No testimonials defined in the current blueprint.</p>}
                    </CardContent>
                </Card>

                {/* Trust Signals Section Adjustments */}
                 <Card className="bg-muted/50 p-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center"><AwardIcon className="mr-2 h-5 w-5"/> Trust Signals Section</CardTitle>
                         <div className="flex items-center space-x-2">
                          <Label htmlFor="trustSignals-visible-switch" className="text-sm">Show</Label>
                          <Switch
                            id="trustSignals-visible-switch"
                            checked={!!activePageBlueprint.sectionVisibility?.trustSignals}
                            onCheckedChange={(checked) => handleSectionVisibilityChange('trustSignals', checked)}
                          />
                        </div>
                    </CardHeader>
                    <CardContent className={cn("space-y-4", !activePageBlueprint.sectionVisibility?.trustSignals && "opacity-50 pointer-events-none")}>
                        {(activePageBlueprint.trustSignals || []).map((signal, index) => (
                            <Card key={`trust-${index}-adjust`} className="p-3 bg-card shadow-sm">
                                <Label className="font-semibold text-md">Trust Signal {index + 1}</Label>
                                <div className="space-y-2 mt-1">
                                    <div><Label htmlFor={`trustSignalText${index}-adjust-input`}>Text</Label><Input id={`trustSignalText${index}-adjust-input`} value={signal.text} onChange={(e) => handleArrayObjectChange('trustSignals', index, 'text', e.target.value)} /></div>
                                    <div><Label htmlFor={`trustSignalDetails${index}-adjust-input`}>Details</Label><Input id={`trustSignalDetails${index}-adjust-input`} value={signal.details || ''} onChange={(e) => handleArrayObjectChange('trustSignals', index, 'details', e.target.value)} /></div>
                                    <div><Label htmlFor={`trustSignalSource${index}-adjust-input`}>Source</Label><Input id={`trustSignalSource${index}-adjust-input`} value={signal.source || ''} onChange={(e) => handleArrayObjectChange('trustSignals', index, 'source', e.target.value)} /></div>
                                    <div><Label htmlFor={`trustSignalImageUrl${index}-adjust-input`}>Image URL</Label><Input id={`trustSignalImageUrl${index}-adjust-input`} value={signal.imageUrl || ''} onChange={(e) => handleArrayObjectChange('trustSignals', index, 'imageUrl', e.target.value)} /></div>
                                    <div>
                                        <Label htmlFor={`trustSignalType${index}-adjust-input`}>Type</Label>
                                        <select
                                            id={`trustSignalType${index}-adjust-input`}
                                            value={signal.type}
                                            onChange={(e) => handleArrayObjectChange('trustSignals', index, 'type', e.target.value as RecommendationTrustSignal['type'])}
                                            className="w-full mt-1 p-2 border border-input rounded-md text-base bg-background text-foreground"
                                        >
                                            <option value="award">Award</option>
                                            <option value="rating">Rating</option>
                                            <option value="statistic">Statistic</option>
                                            <option value="badge">Badge</option>
                                            <option value="text">Text</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {(!activePageBlueprint.trustSignals || activePageBlueprint.trustSignals.length === 0) && <p className="text-sm text-muted-foreground">No trust signals defined in the current blueprint.</p>}
                    </CardContent>
                </Card>

                {/* Form Config Section Adjustments */}
                <Card className="bg-muted/50 p-1">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center"><Edit3 className="mr-2 h-5 w-5" /> Quote Form Section</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="form-visible-switch" className="text-sm">Show</Label>
                        <Switch
                        id="form-visible-switch"
                        checked={!!activePageBlueprint.sectionVisibility?.form}
                        onCheckedChange={(checked) => handleSectionVisibilityChange('form', checked)}
                        />
                    </div>
                  </CardHeader>
                  <CardContent className={cn("space-y-3", !activePageBlueprint.sectionVisibility?.form && "opacity-50 pointer-events-none")}>
                    <div><Label htmlFor="formHeadline-adjust-input">Form Headline</Label><Input id="formHeadline-adjust-input" value={activePageBlueprint.formConfig?.headline || ''} onChange={(e) => handleNestedObjectChange('formConfig', 'headline', e.target.value)} /></div>
                    <div><Label htmlFor="formCtaText-adjust-input">Form CTA Text</Label><Input id="formCtaText-adjust-input" value={activePageBlueprint.formConfig?.ctaText || ''} onChange={(e) => handleNestedObjectChange('formConfig', 'ctaText', e.target.value)} /></div>
                  </CardContent>
                </Card>

                {/* Manage Full Page Blueprints Section */}
                <Separator className="my-8" />
                <Card className="mt-6 border-primary">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center"><Save className="mr-2 h-5 w-5" /> Manage Full Page Blueprints (Local)</CardTitle>
                    <CardDescription>Save your current page setup (all content and section visibility) or load a previously saved blueprint.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="blueprintName-save-input">Name for Current Blueprint:</Label>
                      <div className="flex gap-2">
                        <Input
                          id="blueprintName-save-input"
                          value={nameForCurrentBlueprint}
                          onChange={(e) => setNameForCurrentBlueprint(e.target.value)}
                          placeholder="e.g., Spring Campaign - Full Draft"
                          className="flex-grow"
                        />
                        <Button onClick={handleSaveCurrentBlueprint} variant="default">
                          <Save className="mr-2 h-4 w-4" /> Save Current Blueprint
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Saved Blueprints:</h4>
                      {isLoadingPageBlueprints && <div className="flex items-center justify-center py-3"><Loader2 className="h-5 w-5 animate-spin" /> Loading blueprints...</div>}
                      {!isLoadingPageBlueprints && savedPageBlueprints.length === 0 && (
                        <p className="text-sm text-muted-foreground">No blueprints saved yet.</p>
                      )}
                      {!isLoadingPageBlueprints && savedPageBlueprints.length > 0 && (
                        <div className="border rounded-md overflow-hidden">
                          {savedPageBlueprints.map((bp, index) => (
                            <div 
                              key={bp.id} 
                              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-2 ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'} ${index < savedPageBlueprints.length - 1 ? 'border-b' : ''}`}
                            >
                              <p className="font-medium text-foreground flex-grow min-w-0 break-words">{bp.name}</p>
                              <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                                <Button onClick={() => handleLoadPageBlueprint(bp.id)} variant="outline" size="sm" className="w-full sm:w-auto">Load</Button>
                                <Button onClick={() => handleDeletePageBlueprint(bp.id)} variant="destructive" size="sm" className="w-full sm:w-auto">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>


                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <p className="text-sm text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1"/> Blueprint content updated.</p>
                    <Button onClick={() => setActiveAccordionItem('step-4')} className="w-full sm:w-auto">
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
      title: "Step 4: Configure A/B Test (Hero Section)",
      icon: <Settings className="mr-2 h-5 w-5 text-primary" />,
      disabled: !activePageBlueprint?.heroConfig,
      content: (
        <Card id="step-4-card">
          <CardHeader>
            <CardTitle>A/B Test Hero Section Configurator</CardTitle>
            <CardDescription>
              Configure two versions (A and B) of hero section content. Version A is pre-filled from your adjusted Hero content in Step 3.
              Use AI suggestions, save, manage, and load your Hero configurations locally. Then, preview both active versions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!activePageBlueprint?.heroConfig) && <p className="text-muted-foreground">Adjust content in Step 3 before configuring A/B tests.</p>}
            {(activePageBlueprint?.heroConfig) && (
              <>
                <ConfigForm
                  version="A"
                  headline={headlineA} setHeadline={setHeadlineA}
                  subHeadline={subHeadlineA} setSubHeadline={setSubHeadlineA}
                  ctaText={ctaTextA} setCtaText={setCtaTextA}
                  campaignFocus={campaignFocusA} setCampaignFocus={setCampaignFocusA}
                  generatedJson={generatedJsonA}
                  configName={nameForConfigA} setConfigName={setNameForConfigA}
                  onSave={() => saveABHeroConfiguration('A')}
                />
                <ConfigForm
                  version="B"
                  headline={headlineB} setHeadline={setHeadlineB}
                  subHeadline={subHeadlineB} setSubHeadline={setSubHeadlineB}
                  ctaText={ctaTextB} setCtaText={setCtaTextB}
                  campaignFocus={campaignFocusB} setCampaignFocus={setCampaignFocusB}
                  generatedJson={generatedJsonB}
                  configName={nameForConfigB} setConfigName={setNameForConfigB}
                  onSave={() => saveABHeroConfiguration('B')}
                />
                <div className="mt-8 pt-6 border-t border-border text-center">
                  <Button
                    id="render-ab-preview-button"
                    onClick={handleRenderABTestPreview}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 text-sm sm:px-4 sm:py-2 md:text-base text-wrap" 
                  >
                    <Eye className="mr-2 h-5 w-5" /> Render A/B Versions for Preview
                  </Button>
                </div>
                <Separator className="my-10" />
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Managed A/B Hero Configurations (Local)</CardTitle>
                    <CardDescription>Load saved A/B Hero configurations into Version A or B forms, or delete them. Includes campaign focus.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    {isLoadingABTestConfigs && <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /> Loading...</div>}
                    {!isLoadingABTestConfigs && savedABTestConfigs.length === 0 && <p className="text-muted-foreground text-center py-4">No A/B Hero configurations saved.</p>}
                    {!isLoadingABTestConfigs && savedABTestConfigs.length > 0 && (
                       <div className="border border-border rounded-lg overflow-hidden">
                        {savedABTestConfigs.map((config, index) => (
                          <div
                            key={config.id}
                            id={`managed-config-${config.id}`}
                            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3 ${index % 2 === 0 ? 'bg-card' : 'bg-muted/50'} ${index < savedABTestConfigs.length - 1 ? 'border-b border-border' : ''}`}
                          >
                            <div className="flex-grow mb-3 sm:mb-0 min-w-0">
                              <p className="font-semibold text-foreground">{config.name}</p>
                              <p className="text-sm text-muted-foreground break-words">Headline: {config.headline}</p>
                              {config.campaignFocus && <p className="text-xs text-muted-foreground mt-1">Focus: {config.campaignFocus}</p>}
                            </div>
                            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
                              <Button onClick={() => loadABHeroConfigIntoVersion(config.id, 'A')} variant="outline" size="sm" className="w-full sm:w-auto">Load to A</Button>
                              <Button onClick={() => loadABHeroConfigIntoVersion(config.id, 'B')} variant="outline" size="sm" className="w-full sm:w-auto">Load to B</Button>
                              <Button onClick={() => deleteSavedABTestConfig(config.id)} variant="destructive" size="sm" className="w-full sm:w-auto"><Trash2 className="h-4 w-4" /> Delete</Button>
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
      disabled: !generatedJsonA || !generatedJsonB,
      content: (
        <Card id="step-5-card">
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
                                <strong>Prepare JSON:</strong> Ensure you have copied or downloaded the JSON for both Version A and Version B (from Step 4) using the buttons within each version's card. These JSON strings are what you'll use in Firebase for the `heroConfig`.
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
                                <div className="flex items-center">
                                  <BookOpen className="mr-2 h-4 w-4 text-primary shrink-0" />
                                  <strong>Consult the Playbook:</strong>
                                </div>
                                <span className="ml-6">For detailed, step-by-step instructions on creating the A/B test in Firebase (including setting up parameters, goals, and targeting), please refer to the <strong>`PLAYBOOK.md`</strong> file. This crucial document is located in the root directory of this project and provides comprehensive guidance.</span>
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

  const mainCardMarginTopStyle = {
    marginTop: `${TOP_BAR_HEIGHT_PX}px`,
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8" style={mainCardMarginTopStyle}>
      <div id="walkthrough-end-target" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} />

      {walkthrough && <WelcomeModal />}
      {walkthrough?.isWalkthroughActive && walkthrough.steps[walkthrough.currentStepIndex] && (
        <HighlightCallout
          step={walkthrough.steps[walkthrough.currentStepIndex]}
          onNext={walkthrough.nextStep}
          onPrev={walkthrough.prevStep}
          onEnd={walkthrough.endWalkthrough}
          totalSteps={walkthrough.steps.length}
          currentStepNumber={walkthrough.currentStepIndex + 1}
        />
      )}

      {uiActions && <FeedbackModal
        serviceDeskEmail="feedback@realinsurance.com.au"
      /> }

      <Card className="w-full max-w-4xl mx-auto shadow-xl rounded-lg">
        <CardHeader className="px-6 pt-14 pb-6 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Landing Page Creation & A/B Testing Workflow</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Follow these steps to ingest recommendations, build, adjust, and A/B test your landing page content.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={activeAccordionItem}
            onValueChange={(value) => {
                const newActiveItem = value === activeAccordionItem ? undefined : value;
                setActiveAccordionItem(newActiveItem);
                if (walkthrough?.isWalkthroughActive && newActiveItem && walkthrough.setAccordionToOpen) {
                  walkthrough.setAccordionToOpen(newActiveItem);
                }
            }}
          >
            {accordionItems.map(item => (
              <AccordionItem value={item.value} key={item.value} disabled={item.disabled}>
                <AccordionTrigger id={`${item.value}-accordion-trigger`} className="text-lg hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed">
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


export default function LandingPageWorkflowPage() {
    console.log("Rendering LandingPageWorkflowPage (default export wrapper)");
    const router = useRouter();
    const { currentUser, loading: authLoading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      console.log("Auth Guard Effect: isMounted=", isMounted, "authLoading=", authLoading, "currentUser=", !!currentUser);
      if (!isMounted || authLoading) {
        return; 
      }
      if (!currentUser) {
        console.log("Redirecting to /login");
        router.push('/login');
      }
    }, [isMounted, currentUser, authLoading, router]);
    
    const [activeAccordionItemForWalkthrough, setActiveAccordionItemForWalkthrough] = useState<string | undefined>('step-1');
    const [blueprintForWalkthrough, setBlueprintForWalkthrough] = useState<PageBlueprint | null>(null); 

    const handleAccordionChangeForWalkthrough = useCallback((value: string | undefined) => {
        console.log("Walkthrough requests accordion change to:", value);
        setActiveAccordionItemForWalkthrough(value);
    }, []);

    const handleLoadBlueprintForWalkthrough = useCallback((blueprint: PageBlueprint) => {
        console.log("Walkthrough requests blueprint load:", blueprint);
        if (typeof window !== 'undefined') {
            (window as any).__blueprintForWalkthrough = blueprint; 
        }
        setBlueprintForWalkthrough(blueprint);
    }, []);
    
    if (authLoading || !isMounted) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">Loading Application...</p>
        </div>
      );
    }
    
    if (!currentUser && isMounted) { 
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">Redirecting to login...</p>
        </div>
      );
    }
    
    if (!currentUser) return null; 

    return (
        <WalkthroughProvider
            onAccordionChange={handleAccordionChangeForWalkthrough}
            onLoadBlueprint={handleLoadBlueprintForWalkthrough}
        >
          <LandingPageWorkflowPageContent />
        </WalkthroughProvider>
    );
}
