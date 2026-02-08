import { useState, useEffect, useCallback, useRef } from 'react';

type GenerationType = 'cat' | 'alien' | 'cat-alien';

interface GenerationStep {
  message: string;
  duration: number;
}

interface GenerationProgress {
  isGenerating: boolean;
  currentMessage: string;
  startGeneration: (type: GenerationType) => void;
  stopGeneration: () => void;
  resetGeneration: () => void;
}

const GENERATION_STEPS: Record<GenerationType, GenerationStep[]> = {
  cat: [
    { message: '[GENERATING_GENOME...]', duration: 200 },
    { message: '[INTERPRETING_GENOME...]', duration: 300 },
    { message: '[GENERATING_DESCRIPTION...]', duration: 1500 },
    { message: '[GENERATING_IMAGE...]', duration: 200 },
  ],
  alien: [
    { message: '[GENERATING_GENOME...]', duration: 200 },
    { message: '[INTERPRETING_GENOME...]', duration: 300 },
    { message: '[GRANTING_ABILITIES...]', duration: 400 },
    { message: '[GENERATING_DESCRIPTION...]', duration: 1500 },
    { message: '[GENERATING_IMAGE...]', duration: 200 },
  ],
  'cat-alien': [
    { message: '[GENERATING_GENOME...]', duration: 200 },
    { message: '[INTERPRETING_GENOME...]', duration: 300 },
    { message: '[GRANTING_ABILITIES...]', duration: 400 },
    { message: '[GENERATING_DESCRIPTION...]', duration: 1500 },
    { message: '[GENERATING_IMAGE...]', duration: 200 },
  ],
};

export function useGenerationProgress(): GenerationProgress {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generationType, setGenerationType] = useState<GenerationType | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startGeneration = useCallback((type: GenerationType) => {
    clearCurrentTimeout();
    setIsGenerating(true);
    setGenerationType(type);
    setCurrentStep(0);
  }, [clearCurrentTimeout]);

  const stopGeneration = useCallback(() => {
    clearCurrentTimeout();
    setIsGenerating(false);
    setGenerationType(null);
    setCurrentStep(0);
    setCurrentMessage('');
  }, [clearCurrentTimeout]);

  const resetGeneration = useCallback(() => {
    clearCurrentTimeout();
    setIsGenerating(false);
    setGenerationType(null);
    setCurrentStep(0);
    setCurrentMessage('');
  }, [clearCurrentTimeout]);

  useEffect(() => {
    if (!isGenerating || !generationType) {
      return;
    }

    const steps = GENERATION_STEPS[generationType];
    
    if (currentStep >= steps.length) {
      return;
    }

    const step = steps[currentStep];
    setCurrentMessage(step.message);

    timeoutRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, step.duration);

    return () => {
      clearCurrentTimeout();
    };
  }, [isGenerating, generationType, currentStep, clearCurrentTimeout]);

  useEffect(() => {
    return () => {
      clearCurrentTimeout();
    };
  }, [clearCurrentTimeout]);

  return {
    isGenerating,
    currentMessage,
    startGeneration,
    stopGeneration,
    resetGeneration,
  };
}