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

const getTemperatureColors = (temp: number): TemperatureData['colors'] => {
  if (temp <= 45) {
    // Cold: Dark blue to light green shining gradient
    const ratio = (temp - 30) / 15;
    return {
      background: `linear-gradient(135deg, hsl(220, ${70 + ratio * 20}%, ${25 + ratio * 15}%), hsl(180, ${60 + ratio * 20}%, ${40 + ratio * 20}%), hsl(120, ${80 + ratio * 10}%, ${60 + ratio * 15}%))`,
      primary: `hsl(180, ${65 + ratio * 15}%, ${45 + ratio * 20}%)`,
      accent: `hsl(120, ${75 + ratio * 15}%, ${55 + ratio * 20}%)`,
      foreground: `hsl(0, 0%, ${85 + ratio * 10}%)`
    };
  } else if (temp <= 65) {
    // Medium: Transition between cold and hot
    const ratio = (temp - 45) / 20;
    return {
      background: `linear-gradient(135deg, hsl(${220 + ratio * 40}, ${70 - ratio * 20}%, ${40 - ratio * 15}%), hsl(${240 + ratio * 20}, ${65 - ratio * 15}%, ${35 - ratio * 10}%))`,
      primary: `hsl(${230 + ratio * 30}, ${70 - ratio * 20}%, ${40 - ratio * 15}%)`,
      accent: `hsl(${250 + ratio * 10}, ${65 - ratio * 15}%, ${45 - ratio * 10}%)`,
      foreground: `hsl(0, 0%, ${85 - ratio * 15}%)`
    };
  } else {
    // Hot: Dark purple to blue gradient
    const ratio = (temp - 65) / 25;
    return {
      background: `linear-gradient(135deg, hsl(${270 - ratio * 30}, ${80 + ratio * 10}%, ${20 + ratio * 10}%), hsl(${240 - ratio * 20}, ${75 + ratio * 15}%, ${25 + ratio * 15}%), hsl(${210 - ratio * 10}, ${70 + ratio * 20}%, ${30 + ratio * 20}%))`,
      primary: `hsl(${260 - ratio * 25}, ${75 + ratio * 15}%, ${25 + ratio * 15}%)`,
      accent: `hsl(${230 - ratio * 15}, ${80 + ratio * 10}%, ${35 + ratio * 15}%)`,
      foreground: `hsl(0, 0%, ${90 + ratio * 10}%)`
    };
  }
};

const getTemperatureRange = (temp: number): TemperatureData['temperatureRange'] => {
  if (temp <= 45) return 'cool';
  if (temp <= 65) return 'medium';
  return 'hot';
};

const getAnimationIntensity = (temp: number): number => {
  // Higher temperature = faster animations (0.5x to 2x speed)
  return 0.5 + (temp - 30) / 60 * 1.5;
};

export const useCPUTemperature = (): TemperatureData => {
  const [temperature, setTemperature] = useState(45);

  useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;
    const baseTemp = 45;
    const maxVariation = 35;

    const updateTemperature = (currentTime: number) => {
      if (currentTime - lastTime > 2000) { // Update every 2 seconds
        // Simulate CPU temperature using performance metrics and time-based variation
        const timeVariation = Math.sin(currentTime / 10000) * 0.5; // Slow sine wave
        const performanceLoad = performance.now() % 1000 / 1000; // Pseudo-random based on performance
        const hardwareCores = navigator.hardwareConcurrency || 4;
        const memoryUsage = (navigator as any).deviceMemory ? (navigator as any).deviceMemory / 8 : 0.5;
        
        // Calculate simulated temperature (30°C to 90°C)
        const simulatedTemp = baseTemp + 
          (timeVariation * maxVariation * 0.3) + 
          (performanceLoad * maxVariation * 0.4) + 
          (Math.sin(currentTime / 5000) * maxVariation * 0.2) +
          ((hardwareCores - 4) * 2) +
          (memoryUsage * 8);
          
        const clampedTemp = Math.max(30, Math.min(90, simulatedTemp));
        setTemperature(clampedTemp);
        lastTime = currentTime;
      }
      
      animationFrame = requestAnimationFrame(updateTemperature);
    };

    animationFrame = requestAnimationFrame(updateTemperature);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const temperatureRange = getTemperatureRange(temperature);
  const colors = getTemperatureColors(temperature);
  const animationIntensity = getAnimationIntensity(temperature);

  return {
    temperature,
    temperatureRange,
    colors,
    animationIntensity
  };
};