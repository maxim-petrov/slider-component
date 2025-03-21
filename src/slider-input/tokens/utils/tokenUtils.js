import rootTokens from '../../../tokens.json';

// Создаем функцию для корректной обработки любых пользовательских значений
const parseTokenValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Преобразуем миллисекунды в числовое значение, если это нужно
  if (value.endsWith('ms')) {
    const match = value.match(/^(\d+)ms$/);
    if (match) {
      return value; // Оставляем как есть для CSS
    }
  }
  
  // Проверяем, это cubic-bezier или нет
  if (value.startsWith('cubic-bezier')) {
    return value;
  }
  
  return value;
};

// Processed tokens generated from component/tokens.json
const processedTokens = {
  "THUMB_TRANSITION_DURATION": "300ms",
  "THUMB_TRANSITION_EASING": "cubic-bezier(0.25, 0.1, 0.25, 1)",
  "THUMB_HOVER_DURATION": "300ms",
  "THUMB_DRAG_DURATION": "200ms",
  "THUMB_DRAG_EASING": "cubic-bezier(.165, .84, .44, 1)",
  "THUMB_DOT_EXPAND_DURATION": "300ms",
  "THUMB_DOT_COLLAPSE_DURATION": "300ms",
  "THUMB_DOT_TRANSITION_EASING": "cubic-bezier(.165, .84, .44, 1)",
  "AXIS_TRANSITION_DURATION": "200ms",
  "AXIS_TRANSITION_EASING": "cubic-bezier(0, 0, 1, 1)",
  "AXIS_FILL_TRANSITION_DURATION": "200ms",
  "AXIS_FILL_ACTIVE_DURATION": 0,
  "COUNTER_TRANSITION_DURATION": "100ms",
  "COUNTER_TRANSITION_EASING": "cubic-bezier(0, 0, 1, 1)",
  "SLIDER_ANIMATION_DURATION": "500ms",
  "SLIDER_TRANSITION_DURATION": "300ms",
  "SLIDER_TRANSITION_EASING": "cubic-bezier(.165, .84, .44, 1)"
};

// Метод для обновления токенов на лету
processedTokens.updateToken = function(tokenName, tokenValue) {
  if (this.hasOwnProperty(tokenName)) {
    this[tokenName] = parseTokenValue(tokenValue);
    return true;
  }
  return false;
};

// Log for debugging
console.log('TokenUtils loaded with values:', processedTokens);

export default processedTokens;