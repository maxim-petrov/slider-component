import { useEffect, useState } from 'react';
import tokens from '../tokens/utils/tokenUtils.js';

// Функция для извлечения значения ms из строки, например "10000ms" -> 10000
const extractMs = (duration) => {
  if (typeof duration !== 'string') {
    // Если это число, предполагаем, что это уже в миллисекундах
    if (typeof duration === 'number') {
      return duration;
    }
    return 500; // значение по умолчанию
  }
  
  // Парсинг миллисекунд (например, "300ms")
  const msMatch = duration.match(/(\d+)ms/);
  if (msMatch && msMatch[1]) {
    return parseInt(msMatch[1]);
  }
  
  // Парсинг секунд (например, "0.3s")
  const secMatch = duration.match(/(\d*\.?\d+)s/);
  if (secMatch && secMatch[1]) {
    return parseFloat(secMatch[1]) * 1000;
  }
  
  // Попытка парсить как чистое число, если строка содержит только цифры
  if (/^\d+$/.test(duration)) {
    return parseInt(duration);
  }
  
  console.warn(`Couldn't parse duration: ${duration}, using default value`);
  return 500; // значение по умолчанию, если не удалось распарсить
};

export const useSliderAnimation = (customDuration = null, customTransitionDuration = null) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      // Логи для отладки переданных значений
      console.log(`Custom animation duration: ${customDuration}`);
      console.log(`Custom transition duration: ${customTransitionDuration}`);
      console.log(`Default SLIDER_TRANSITION_DURATION: ${tokens.SLIDER_TRANSITION_DURATION}`);
      console.log(`Default SLIDER_ANIMATION_DURATION: ${tokens.SLIDER_ANIMATION_DURATION}`);
      
      // Используем пользовательское значение длительности transition, если оно передано
      // иначе используем значение из токенов
      // Приоритет: 1. customTransitionDuration, 2. customDuration, 3. tokens.SLIDER_TRANSITION_DURATION, 4. tokens.SLIDER_ANIMATION_DURATION
      let animationDuration;
      
      if (customTransitionDuration) {
        animationDuration = extractMs(customTransitionDuration);
      } else if (customDuration) {
        animationDuration = extractMs(customDuration);
      } else {
        // Используем SLIDER_TRANSITION_DURATION для более плавной анимации
        animationDuration = extractMs(tokens.SLIDER_TRANSITION_DURATION) || 
                          parseInt(tokens.SLIDER_ANIMATION_DURATION);
      }
      
      // Устанавливаем таймер, который ВСЕГДА больше длительности анимации
      // чтобы никогда не обрезать анимацию
      const durationWithBuffer = animationDuration + 100;
      
      console.log(`Animation will run for ${durationWithBuffer}ms with transition duration: ${animationDuration}ms`);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, durationWithBuffer);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, customDuration, customTransitionDuration]);

  const startAnimation = () => setIsAnimating(true);

  const stopAnimation = () => setIsAnimating(false);

  return [isAnimating, startAnimation, stopAnimation];
};


export const getSliderTransitionStyle = (isDragging, isAnimating) => {
  if (isDragging && !isAnimating) {
    return 'none';
  }
  return isAnimating
    ? `left ${tokens.SLIDER_TRANSITION_DURATION} ${tokens.SLIDER_TRANSITION_EASING}, right ${tokens.SLIDER_TRANSITION_DURATION} ${tokens.SLIDER_TRANSITION_EASING}`
    : 'none';
};


export const getInputDraggingStyle = (isDragging) => {
  if (isDragging) {
    return { pointerEvents: 'none' };
  }
  return {};
};

export const SLIDER_ANIMATION = {
  DURATION_MS: parseInt(tokens.SLIDER_ANIMATION_DURATION),
  TRANSITION_DURATION: tokens.SLIDER_TRANSITION_DURATION,
  EASING: tokens.SLIDER_TRANSITION_EASING,
};
