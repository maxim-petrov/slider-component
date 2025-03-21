/**
 * Описания токенов на русском языке
 * Ключи должны точно соответствовать названиям токенов в tokens.json
 * Токены со значением '__HIDDEN__' не будут отображаться на странице
 */

const tokenDescriptions = {
  // Токены ползунка (Thumb)
  "THUMB_TRANSITION_DURATION": "Скорость скрытия фокуса у ползунка (зеленая полупрозрачная рамка)",
  "THUMB_TRANSITION_EASING": "Плавность перехода ползунка - характер движения при базовой анимации",
  "THUMB_HOVER_DURATION": "__HIDDEN__",
  "THUMB_DRAG_DURATION": "__HIDDEN__",
  "THUMB_DRAG_EASING": "__HIDDEN__",
  "THUMB_DOT_EXPAND_DURATION": "Скорость увеличения и уменьшения точки",
  "THUMB_DOT_COLLAPSE_DURATION": "__HIDDEN__",
  "THUMB_DOT_TRANSITION_EASING": "Плавность анимации точки - характер движения точки ползунка",
  
  // Токены оси (Axis)
  "AXIS_TRANSITION_DURATION": "Скорость изменения цвета полосы",
  "AXIS_TRANSITION_EASING": "Плавность перехода оси - характер анимации оси слайдера",
  "AXIS_FILL_TRANSITION_DURATION": "__HIDDEN__",
  "AXIS_FILL_ACTIVE_DURATION": "__HIDDEN__",
  
  // Токены счетчика (Counter)
  "COUNTER_TRANSITION_DURATION": "__HIDDEN__",
  "COUNTER_TRANSITION_EASING": "__HIDDEN__",
  
  // Общие токены слайдера (Slider)
  "SLIDER_ANIMATION_DURATION": "__HIDDEN__",
  "SLIDER_TRANSITION_DURATION": "Скорость движения ползунка",
  "SLIDER_TRANSITION_EASING": "Плавность перехода слайдера - характер движения основных анимаций"
};

export default tokenDescriptions; 