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
  transitionProgress: number;
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

// Helper function to parse HSL string and extract values
const parseHSL = (hslString: string): { h: number; s: number; l: number } => {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return { h: 0, s: 0, l: 0 };
  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  };
};

// Helper function to interpolate between two HSL colors
const interpolateHSL = (color1: string, color2: string, progress: number): string => {
  const hsl1 = parseHSL(color1);
  const hsl2 = parseHSL(color2);
  
  // Handle hue interpolation (shortest path around color wheel)
  let hDiff = hsl2.h - hsl1.h;
  if (hDiff > 180) hDiff -= 360;
  if (hDiff < -180) hDiff += 360;
  
  const h = Math.round(hsl1.h + hDiff * progress);
  const s = Math.round(hsl1.s + (hsl2.s - hsl1.s) * progress);
  const l = Math.round(hsl1.l + (hsl2.l - hsl1.l) * progress);
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Function to interpolate background gradients
const interpolateGradient = (grad1: string, grad2: string, progress: number): string => {
  // Extract HSL colors from gradient strings
  const hsl1Matches = grad1.match(/hsl\(\d+,\s*\d+%,\s*\d+%\)/g) || [];
  const hsl2Matches = grad2.match(/hsl\(\d+,\s*\d+%,\s*\d+%\)/g) || [];
  
  if (hsl1Matches.length === 0 || hsl2Matches.length === 0) return grad1;
  
  const interpolatedColors = hsl1Matches.map((color1, index) => {
    const color2 = hsl2Matches[index] || hsl2Matches[0];
    return interpolateHSL(color1, color2, progress);
  });
  
  return `linear-gradient(135deg, ${interpolatedColors.join(', ')})`;
};

// Function to get interpolated colors between current and next step
const getInterpolatedColors = (currentIndex: number, nextIndex: number, progress: number): TemperatureData['colors'] => {
  const currentColors = colorSteps[currentIndex % colorSteps.length];
  const nextColors = colorSteps[nextIndex % colorSteps.length];
  
  return {
    background: interpolateGradient(currentColors.background, nextColors.background, progress),
    primary: interpolateHSL(currentColors.primary, nextColors.primary, progress),
    accent: interpolateHSL(currentColors.accent, nextColors.accent, progress),
    foreground: interpolateHSL(currentColors.foreground, nextColors.foreground, progress)
  };
};

export const useCPUTemperature = (): TemperatureData => {
  const [colorStepIndex, setColorStepIndex] = useState(0);
  const [temperature, setTemperature] = useState(45);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let animationId: number;

  const startTransition = () => {
    setIsTransitioning(true);
    setTransitionProgress(0);
    
    const duration = 20000; // 20 seconds for very smooth transition
    const startTime = performance.now();
    
    const animateTransition = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use very smooth easing function
      const easedProgress = 0.5 * (1 + Math.sin(Math.PI * progress - Math.PI / 2));
      setTransitionProgress(easedProgress);
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animateTransition);
      } else {
        // Transition complete, move to next color step
        setColorStepIndex(prev => (prev + 1) % colorSteps.length);
        setIsTransitioning(false);
        setTransitionProgress(0);
        
        // Schedule next color change after a pause
        scheduleNextTransition();
      }
    };
    
    animationId = requestAnimationFrame(animateTransition);
  };

    const scheduleNextTransition = () => {
      // Wait 100-120 seconds (1.6-2 minutes) before starting next transition
      const randomInterval = Math.random() * 20000 + 100000;
      
      timeoutId = window.setTimeout(() => {
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
        
        startTransition();
      }, randomInterval);
    };

    // Start the cycle
    scheduleNextTransition();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const temperatureRange = getTemperatureRange(colorStepIndex);
  const animationIntensity = getAnimationIntensity(colorStepIndex);
  
  // Get colors based on transition state
  const colors = isTransitioning 
    ? getInterpolatedColors(colorStepIndex, (colorStepIndex + 1) % colorSteps.length, transitionProgress)
    : getColorsForStep(colorStepIndex);

  return {
    temperature,
    temperatureRange,
    colors,
    animationIntensity,
    transitionProgress
  };
};