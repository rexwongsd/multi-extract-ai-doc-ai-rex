import { useState, useEffect } from 'react';

export interface TemperatureData {
  temperature: number;
  temperatureRange: 'cool' | 'medium' | 'hot';
  colors: {
    background: string;
    primary: string;
    accent: string;
    foreground: string;
  };
  animationIntensity: number;
}

// Color sequence: Dark Blue → Purple → Light Green → Yellow
const colorSteps = [
  {
    // Dark Blue
    background: 'linear-gradient(135deg, hsl(220, 80%, 20%), hsl(210, 70%, 25%), hsl(200, 60%, 30%))',
    primary: 'hsl(220, 80%, 20%)',
    accent: 'hsl(210, 70%, 25%)',
    foreground: 'hsl(0, 0%, 90%)'
  },
  {
    // Purple
    background: 'linear-gradient(135deg, hsl(280, 70%, 40%), hsl(270, 75%, 45%), hsl(260, 65%, 50%))',
    primary: 'hsl(280, 70%, 40%)',
    accent: 'hsl(270, 75%, 45%)',
    foreground: 'hsl(0, 0%, 95%)'
  },
  {
    // Light Green
    background: 'linear-gradient(135deg, hsl(120, 60%, 70%), hsl(130, 55%, 75%), hsl(140, 50%, 80%))',
    primary: 'hsl(120, 60%, 70%)',
    accent: 'hsl(130, 55%, 75%)',
    foreground: 'hsl(0, 0%, 20%)'
  },
  {
    // Yellow
    background: 'linear-gradient(135deg, hsl(60, 90%, 75%), hsl(55, 85%, 80%), hsl(50, 80%, 85%))',
    primary: 'hsl(60, 90%, 75%)',
    accent: 'hsl(55, 85%, 80%)',
    foreground: 'hsl(0, 0%, 15%)'
  }
];

const getColorsForStep = (stepIndex: number): TemperatureData['colors'] => {
  return colorSteps[stepIndex % colorSteps.length];
};

const getTemperatureRange = (stepIndex: number): TemperatureData['temperatureRange'] => {
  const ranges: TemperatureData['temperatureRange'][] = ['cool', 'medium', 'hot', 'cool'];
  return ranges[stepIndex % ranges.length];
};

const getAnimationIntensity = (stepIndex: number): number => {
  // Variable animation intensity for each step
  const intensities = [0.8, 1.2, 1.5, 1.0];
  return intensities[stepIndex % intensities.length];
};

export const useCPUTemperature = (): TemperatureData => {
  const [colorStepIndex, setColorStepIndex] = useState(0);
  const [temperature, setTemperature] = useState(45);

  useEffect(() => {
    let timeoutId: number;
    let lastTime = 0;

    const updateColorStep = () => {
      // Generate random interval between 3000-5000ms (3-5 seconds) for slower transitions
      const randomInterval = Math.random() * 2000 + 3000;
      
      timeoutId = window.setTimeout(() => {
        setColorStepIndex(prev => (prev + 1) % colorSteps.length);
        // Update temperature for display (keeping existing temp simulation)
        const currentTime = performance.now();
        const timeVariation = Math.sin(currentTime / 10000) * 0.5;
        const performanceLoad = performance.now() % 1000 / 1000;
        const hardwareCores = navigator.hardwareConcurrency || 4;
        const memoryUsage = (navigator as any).deviceMemory ? (navigator as any).deviceMemory / 8 : 0.5;
        
        const baseTemp = 45;
        const maxVariation = 35;
        const simulatedTemp = baseTemp + 
          (timeVariation * maxVariation * 0.3) + 
          (performanceLoad * maxVariation * 0.4) + 
          (Math.sin(currentTime / 5000) * maxVariation * 0.2) +
          ((hardwareCores - 4) * 2) +
          (memoryUsage * 8);
          
        const clampedTemp = Math.max(30, Math.min(90, simulatedTemp));
        setTemperature(clampedTemp);
        
        updateColorStep(); // Schedule next update
      }, randomInterval);
    };

    // Start the cycle
    updateColorStep();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const temperatureRange = getTemperatureRange(colorStepIndex);
  const colors = getColorsForStep(colorStepIndex);
  const animationIntensity = getAnimationIntensity(colorStepIndex);

  return {
    temperature,
    temperatureRange,
    colors,
    animationIntensity
  };
};