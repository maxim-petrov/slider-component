import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Пути к файлам
const COMPONENT_TOKENS_PATH = path.resolve('src/slider-input/tokens/tokens.json');
const ROOT_TOKENS_PATH = path.resolve('src/tokens.json');
const JS_UTILS_PATH = path.resolve('src/slider-input/tokens/utils/tokenUtils.js');
const SCSS_UTILS_PATH = path.resolve('src/slider-input/tokens/utils/tokenUtils.scss');

// Функция для генерации файлов с токенами
export async function generateTokenFiles() {
  try {
    // Загружаем tokens.json из корня и из компонента
    const rootTokens = JSON.parse(fs.readFileSync(ROOT_TOKENS_PATH, 'utf8'));
    const componentTokens = JSON.parse(fs.readFileSync(COMPONENT_TOKENS_PATH, 'utf8'));
    
    // Обрабатываем токены из slider-input/tokens.json
    const processedTokens = {};
    
    // Обрабатываем строки вида "tokens.duration('50')" и другие форматы токенов
    for (const [key, valueExpr] of Object.entries(componentTokens)) {
      if (typeof valueExpr === 'string') {
        // Обрабатываем выражения вида tokens.category('value')
        const match = valueExpr.match(/tokens\.(\w+)\('(.+)'\)/);
        if (match) {
          const [, category, tokenValue] = match;
          // Получаем реальное значение из корневых токенов
          if (rootTokens[category] && rootTokens[category][tokenValue] !== undefined) {
            processedTokens[key] = rootTokens[category][tokenValue];
          } else {
            console.warn(`Token not found for ${category}.${tokenValue}`);
            processedTokens[key] = valueExpr; // Используем как есть, если не найдено
          }
        } else {
          processedTokens[key] = valueExpr; // Используем как есть, если не в формате tokens.category
        }
      } else {
        processedTokens[key] = valueExpr; // Для нестроковых значений
      }
    }
    
    // Генерируем JS файл
    generateJSTokens(processedTokens);
    
    // Генерируем SCSS файл
    generateSCSSTokens(processedTokens);
    
    console.log('✅ Tokens successfully generated');
    return true;
  } catch (error) {
    console.error('❌ Error generating tokens:', error);
    return false;
  }
}

// Генерация JS файла с токенами
function generateJSTokens(processedTokens) {
  const jsContent = `import rootTokens from '../../../tokens.json';

// Создаем функцию для корректной обработки любых пользовательских значений
const parseTokenValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Преобразуем миллисекунды в числовое значение, если это нужно
  if (value.endsWith('ms')) {
    const match = value.match(/^(\\d+)ms$/);
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
const processedTokens = ${JSON.stringify(processedTokens, null, 2)};

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

export default processedTokens;`;

  fs.writeFileSync(JS_UTILS_PATH, jsContent);
}

// Генерация SCSS файла с токенами
function generateSCSSTokens(processedTokens) {
  // Создаем CSS переменные
  let cssVars = '// Определяем CSS переменные для токенов\n:root {\n';
  let scssVars = '\n// SCSS переменные для удобного использования\n';
  
  // Сортируем ключи для согласованности
  const sortedKeys = Object.keys(processedTokens).sort();
  
  for (const key of sortedKeys) {
    if (key === 'updateToken') continue; // Пропускаем метод updateToken
    
    // Преобразуем UPPER_CASE в kebab-case для CSS переменных
    const cssVarName = `--${key.toLowerCase().replace(/_/g, '-')}`;
    
    // Добавляем CSS переменную
    cssVars += `  ${cssVarName}: ${processedTokens[key]};\n`;
    
    // Добавляем SCSS переменную
    scssVars += `$${key}: var(${cssVarName});\n`;
  }
  
  cssVars += '}';
  const scssContent = cssVars + scssVars;
  
  fs.writeFileSync(SCSS_UTILS_PATH, scssContent);
}

// Если скрипт запущен напрямую (не импортирован)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateTokenFiles();
} 