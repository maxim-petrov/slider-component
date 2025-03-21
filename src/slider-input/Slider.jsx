import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  useSliderAnimation,
  getSliderTransitionStyle,
  getInputDraggingStyle,
  SLIDER_ANIMATION,
} from './scripts/animation.js';
import '../index.css';
import './styles/slider.scss';
import './styles/animation.scss';
import tokens from './tokens/utils/tokenUtils';



const Slider = ({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 0,
  label = 'Значение',
  steps = [0, 25, 50, 75, 100],
  withInput = true,
  active = false,
  showCounter = true,
  customTokens = null,
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, startAnimation, stopAnimation] = useSliderAnimation(
    customTokens?.SLIDER_ANIMATION_DURATION || null,
    customTokens?.SLIDER_TRANSITION_DURATION || tokens.SLIDER_TRANSITION_DURATION
  );
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef(null);
  const inputRef = useRef(null);

  // Рассчитываем процент для отображения ползунка и заполнения оси
  const percentage = ((value - min) / (max - min)) * 100;

  // Используем пользовательские токены, если они предоставлены
  const getAnimationTokens = () => {
    if (customTokens) {
      return {
        duration: customTokens.duration,
        motion: customTokens.motion
      };
    } else {
      return {
        duration: tokens.SLIDER_TRANSITION_DURATION,
        motion: tokens.SLIDER_TRANSITION_EASING
      };
    }
  };
  
  const animationTokens = getAnimationTokens();
  
  // Use animation tokens in getSliderTransitionStyle
  const getCustomSliderTransitionStyle = (isDragging, isAnimating) => {
    if (isDragging && !isAnimating) {
      return 'none';
    }
    
    // Используем все токены при наличии пользовательских настроек
    if (customTokens && isAnimating) {
      // Используем самую медленную из анимаций для синхронизации движения
      const longestDuration = customTokens.SLIDER_TRANSITION_DURATION || customTokens.duration;
      const motionType = customTokens.SLIDER_TRANSITION_EASING || customTokens.motion;
      
      return `left ${longestDuration} ${motionType}, right ${longestDuration} ${motionType}`;
    }
    
    return isAnimating
      ? `left ${tokens.SLIDER_TRANSITION_DURATION} ${tokens.SLIDER_TRANSITION_EASING}, 
         right ${tokens.SLIDER_TRANSITION_DURATION} ${tokens.SLIDER_TRANSITION_EASING}`
      : 'none';
  };

  // Обработчик изменения значения в поле ввода
  const handleInputChange = (e) => {
    const newValue = Math.min(
      Math.max(parseInt(e.target.value) || min, min),
      max
    );
    setValue(newValue);
    // Включаем анимацию при изменении через инпут
    startAnimation();
    if (onChange) onChange(newValue);
  };

  // Функция активации инпута
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  // Обработчики фокуса инпута
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  // Обработчик нажатия клавиш в инпуте
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(value + step, max);
      setValue(newValue);
      // Отключаем анимацию при изменении через клавиатуру
      stopAnimation();
      if (onChange) onChange(newValue);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(value - step, min);
      setValue(newValue);
      // Отключаем анимацию при изменении через клавиатуру
      stopAnimation();
      if (onChange) onChange(newValue);
    }
  };

  // Обработчик клика на контейнер инпута
  const handleInputContainerClick = (e) => {
    focusInput();
    e.stopPropagation();
  };

  // Обработчик движения мыши на уровне документа (для перетаскивания)
  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const offset = Math.min(
      Math.max(0, e.clientX - sliderRect.left),
      sliderWidth
    );

    // Рассчитываем новое значение на основе позиции
    let newPercentage = Math.max(
      0,
      Math.min(100, (offset / sliderWidth) * 100)
    );
    let newValue =
      min + Math.round(((newPercentage / 100) * (max - min)) / step) * step;

    // При перетаскивании анимация отключена
    stopAnimation();
    setValue(newValue);

    // Предотвращаем выделение текста
    e.preventDefault();
  };

  // Обработчик начала перетаскивания
  const handleDragStart = (e) => {
    console.log('Drag start');
    setIsDragging(true);
    // При перетаскивании анимация отключена
    stopAnimation();

    // Предотвращаем выделение текста и всплытие события
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = 'none';
  };

  // Обработчик окончания перетаскивания
  const handleDragEnd = () => {
    console.log('Drag end');
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  // Добавляем и удаляем обработчики событий на уровне документа
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  // Обработчик клика по оси
  const handleAxisClick = (e) => {
    if (!sliderRef.current || isDragging) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const offset = e.clientX - sliderRect.left;

    // Рассчитываем новое значение на основе клика
    let newPercentage = Math.max(
      0,
      Math.min(100, (offset / sliderWidth) * 100)
    );
    let newValue =
      min + Math.round(((newPercentage / 100) * (max - min)) / step) * step;

    setValue(newValue);

    // Устанавливаем состояние нажатия при mouse down
    setIsDragging(true);

    // Включаем анимацию при клике на линию
    startAnimation();

    // Добавляем обработчики для слежения за мышью и отпусканием кнопки
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('mousemove', handleMouseMove);

    // Вызываем обработчик изменения
    if (onChange) onChange(newValue);

    // Предотвращаем выделение текста и всплытие события
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = 'none';
  };

  // Обработчик клика по значениям
  const handleStepClick = (stepValue) => (e) => {
    if (isDragging) return;

    // Устанавливаем значение равным значению шага
    setValue(stepValue);

    // Устанавливаем состояние нажатия при mouse down
    setIsDragging(true);

    // Включаем анимацию при клике на значение
    startAnimation();

    // Добавляем обработчики для слежения за мышью и отпусканием кнопки
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('mousemove', handleMouseMove);

    // Вызываем обработчик изменения
    if (onChange) onChange(stepValue);

    // Предотвращаем выделение текста и всплытие события
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = 'none';
  };

  // Обработчик клика по контейнеру значений (между цифрами)
  const handleHintsContainerClick = (e) => {
    if (isDragging) return;

    // Проверяем, что клик не был на самой метке значения
    if (
      e.target.className.includes('slider-input-valueHint-1ed-11-0-8') ||
      e.target.className.includes('slider-input-hintText-eb7-11-0-8')
    ) {
      return;
    }

    const containerRect = e.currentTarget.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const offset = e.clientX - containerRect.left;

    // Рассчитываем новое значение на основе клика
    let newPercentage = Math.max(
      0,
      Math.min(100, (offset / containerWidth) * 100)
    );
    let newValue =
      min + Math.round(((newPercentage / 100) * (max - min)) / step) * step;

    setValue(newValue);

    // Устанавливаем состояние нажатия при mouse down
    setIsDragging(true);

    // Включаем анимацию при клике на область между цифрами
    startAnimation();

    // Добавляем обработчики для слежения за мышью и отпусканием кнопки
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('mousemove', handleMouseMove);

    // Вызываем обработчик изменения
    if (onChange) onChange(newValue);

    // Предотвращаем выделение текста и всплытие события
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = 'none';
  };

  // Update usage of getSliderTransitionStyle to getCustomSliderTransitionStyle
  const axisStyles = {
    transition: getCustomSliderTransitionStyle(isDragging, isAnimating),
  };

  // Вариант с текстовым полем ввода
  const renderWithInput = () => (
    <div className="_Gq5_ ql7Up" data-e2e-id="slider-default">
      <div style={{ width: '282px' }}>
        <div
          className={`slider-inputRoot-bee-11-0-8 ${
            isDragging ? 'slider-input-dragging-input' : ''
          }`}
          data-e2e-id="slider"
        >
          <div
            className="inpt-fluid-199-12-3-0"
            style={getInputDraggingStyle(isDragging)}
          >
            <div
              className={`inpt-root-670-12-3-0 inpt-large-258-12-3-0 inpt-primary-8dd-12-3-0 inpt-notEmpty-432-12-3-0 inpt-fluid-199-12-3-0 inpt-hasLabel-14b-12-3-0 nmbr-inp-root-220-11-1-0 ${
                isFocused ? 'inpt-focused-b65-12-3-0' : ''
              }`}
              data-e2e-id="slider-input"
              onClick={handleInputContainerClick}
              style={getInputDraggingStyle(isDragging)}
            >
              <div className="inpt-inputContainer-d7e-12-3-0">
                <input
                  ref={inputRef}
                  className="inpt-input-3c4-12-3-0"
                  step={step}
                  tabIndex="0"
                  value={value}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                />
                <label className="inpt-label-a7f-12-3-0 inpt-labelWithoutLabelId-299-12-3-0">
                  {label}
                </label>
              </div>
            </div>
          </div>

          <span
            className={`slider-root-80f-11-0-8 slider-inputSliderMode-be3-11-0-8 ${
              isDragging ? 'slider-dragging' : ''
            } ${showCounter ? 'slider-withCounter-21e-11-0-8' : ''}`}
            data-e2e-id="slider-slider"
          >
            <span
              className="slider-axisContainer-04b-11-0-8"
              ref={sliderRef}
              onMouseDown={handleAxisClick}
            >
              <span className="slider-axis-923-11-0-8">
                <span
                  className="slider-axisFill-f1d-11-0-8"
                  style={{
                    right: `${100 - percentage}%`,
                    transition: getCustomSliderTransitionStyle(
                      isDragging,
                      isAnimating
                    ),
                  }}
                />
              </span>

              {showCounter && (
                <span 
                  className="slider-counter-container"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '80px', // Явно задаем высоту для лучшего захвата кликов
                    top: '-30px', // Поднимаем выше, чтобы покрыть область над осью
                    left: 0,
                    zIndex: 1,
                    pointerEvents: 'auto', // Разрешаем события клика
                    cursor: 'ew-resize', // Меняем на ew-resize
                  }}
                  onMouseDown={handleAxisClick}
                >
                  <span 
                    className="slider-counter-a01-11-0-8" 
                    style={{
                      left: `${percentage}%`,
                      transition: getCustomSliderTransitionStyle(isDragging, isAnimating),
                      cursor: isDragging ? 'grabbing' : 'grab',
                      position: 'absolute',
                      zIndex: 2,
                      pointerEvents: 'auto', // Разрешаем события на counter
                    }}
                    onMouseDown={handleDragStart}
                  >
                    {value}
                  </span>
                </span>
              )}

              <span
                className={`slider-thumb-2b5-11-0-8 ${
                  isDragging ? 'slider-dragging' : ''
                }`}
                data-e2e-id="slider-slider-thumb"
                style={{
                  left: `${percentage}%`,
                  transition: getCustomSliderTransitionStyle(isDragging, isAnimating),
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleDragStart}
                tabIndex="0"
              >
                <span className="slider-thumbInner-c38-11-0-8">
                  <span className="slider-thumbInnerDot"></span>
                </span>
              </span>
            </span>

            <span
              className="slider-valueHints-c0e-11-0-8"
              onMouseDown={handleHintsContainerClick}
              style={{ cursor: 'ew-resize' }}
            >
              {steps.map((step, index) => (
                <span
                  key={index}
                  className="slider-valueHint-1ed-11-0-8"
                  onMouseDown={handleStepClick(step)}
                  style={{ cursor: 'ew-resize' }}
                >
                  <span className="slider-hintText-eb7-11-0-8">{step}</span>
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  // Вариант без текстового поля ввода
  const renderWithoutInput = () => (
    <div className="_Gq5_ ql7Up" data-e2e-id="slider-default">
      <div style={{ width: '282px' }}>
        <span
          className={`slider-root-80f-11-0-8 ${
            active ? 'slider-active-c30-11-0-8' : ''
          } ${isDragging ? 'slider-dragging' : ''} ${showCounter ? 'slider-withCounter-21e-11-0-8' : ''}`}
          data-e2e-id="slider"
          tabIndex="0"
        >
          <span
            className="slider-axisContainer-04b-11-0-8"
            ref={sliderRef}
            onMouseDown={handleAxisClick}
          >
            <span className="slider-axis-923-11-0-8">
              <span
                className="slider-axisFill-f1d-11-0-8"
                style={{
                  right: `${100 - percentage}%`,
                  transition: getCustomSliderTransitionStyle(isDragging, isAnimating),
                }}
              />
            </span>

            {showCounter && (
              <span 
                className="slider-counter-container"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '80px', // Явно задаем высоту для лучшего захвата кликов
                  top: '-30px', // Поднимаем выше, чтобы покрыть область над осью
                  left: 0,
                  zIndex: 1,
                  pointerEvents: 'auto', // Разрешаем события клика
                  cursor: 'ew-resize', // Меняем на ew-resize
                }}
                onMouseDown={handleAxisClick}
              >
                <span 
                  className="slider-counter-a01-11-0-8" 
                  style={{
                    left: `${percentage}%`,
                    transition: getCustomSliderTransitionStyle(isDragging, isAnimating),
                    cursor: isDragging ? 'grabbing' : 'grab',
                    position: 'absolute',
                    zIndex: 2,
                    pointerEvents: 'auto', // Разрешаем события на counter
                  }}
                  onMouseDown={handleDragStart}
                >
                  {value}
                </span>
              </span>
            )}

            <span
              className={`slider-thumb-2b5-11-0-8 ${
                isDragging ? 'slider-dragging' : ''
              }`}
              data-e2e-id="slider-thumb"
              style={{
                left: `${percentage}%`,
                transition: getCustomSliderTransitionStyle(isDragging, isAnimating),
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleDragStart}
              tabIndex="0"
            >
              <span className="slider-thumbInner-c38-11-0-8">
                <span className="slider-thumbInnerDot"></span>
              </span>
            </span>
          </span>

          <span
            className="slider-valueHints-c0e-11-0-8"
            onMouseDown={handleHintsContainerClick}
            style={{ cursor: 'ew-resize' }}
          >
            {steps.map((step, index) => (
              <span
                key={index}
                className="slider-valueHint-1ed-11-0-8"
                onMouseDown={handleStepClick(step)}
                style={{ cursor: 'ew-resize' }}
              >
                <span className="slider-hintText-eb7-11-0-8">{step}</span>
              </span>
            ))}
          </span>
        </span>
      </div>
    </div>
  );

  return withInput ? renderWithInput() : renderWithoutInput();
};

export default Slider;
