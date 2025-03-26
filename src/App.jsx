import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Slider from './slider-input/Slider';
import rootTokens from './tokens.json';
import componentTokens from './slider-input/tokens/tokens.json';
import tokenDescriptions from './slider-input/tokens/tokenDescriptions';

// Simple error boundary slider-input
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Caught error:', error);
      setHasError(true);
      setError(error);
      return true;
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
        <h2>Something went wrong!</h2>
        <p>{error?.toString() || 'Unknown error'}</p>
        <button onClick={() => setHasError(false)}>Try again</button>
      </div>
    );
  }

  return children;
}

function App() {
  // Загружаем токены динамически из slider-input/tokens.json
  const [tokenValues, setTokenValues] = useState(() => {
    // Преобразуем компонентные токены в начальное состояние
    const initialTokens = {};
    Object.entries(componentTokens).forEach(([key, value]) => {
      // Если значение ссылается на функцию tokens, получаем исходное значение
      if (typeof value === 'string' && value.startsWith('tokens.')) {
        // Например, из tokens.duration('100') извлекаем '100'
        const match = value.match(/tokens\.\w+\('([^']+)'\)/);
        if (match && match[1]) {
          const tokenKey = match[1];
          if (value.includes('duration')) {
            initialTokens[key] = rootTokens.duration[tokenKey] || value;
          } else if (value.includes('motion') || value.includes('easing')) {
            initialTokens[key] = rootTokens.motion[tokenKey] || value;
          } else {
            initialTokens[key] = value;
          }
        } else {
          initialTokens[key] = value;
        }
      } else {
        // Для прямых значений (например, для spring токенов)
        // Проверяем, является ли это spring токеном (STIFFNESS, DAMPING, MASS)
        if (key.includes('SPRING_STIFFNESS') || key.includes('SPRING_DAMPING') || key.includes('SPRING_MASS')) {
          // Преобразуем строковые значения в числа для spring токенов
          initialTokens[key] = parseFloat(value);
        } else {
          initialTokens[key] = value;
        }
      }
    });
    return initialTokens;
  });

  // Получаем все доступные значения из основного tokens.json
  const availableDurations = Object.entries(rootTokens.duration).map(([key, value]) => ({
    label: `${key} (${value})`,
    value: value
  }));

  const availableMotions = Object.entries(rootTokens.motion).map(([key, value]) => ({
    label: `${key} (${value})`,
    value: value
  }));

  // Обновляем CSS переменные при изменении токенов
  useEffect(() => {
    Object.entries(tokenValues).forEach(([key, value]) => {
      const cssVarName = `--${key.toLowerCase().replace(/_/g, '-')}`;
      document.documentElement.style.setProperty(cssVarName, value);
      
      // Также обновляем переменные в токенах для JS
      try {
        // Динамически импортируем tokenUtils для обновления значений на лету
        import('./slider-input/tokens/utils/tokenUtils').then(module => {
          if (module.default && typeof module.default.updateToken === 'function') {
            module.default.updateToken(key, value);
          }
        });
      } catch (error) {
        console.error('Failed to update token in JS:', error);
      }
    });
  }, [tokenValues]);

  // Обработчик изменения значения токена
  const handleTokenChange = (tokenName) => (e) => {
    let newValue = e.target.value;
    
    // Для spring токенов преобразуем значение в число
    if (tokenName.includes('SPRING_STIFFNESS') || 
        tokenName.includes('SPRING_DAMPING') || 
        tokenName.includes('SPRING_MASS')) {
      newValue = parseFloat(newValue);
      
      // Проверяем на NaN и устанавливаем значение по умолчанию
      if (isNaN(newValue)) {
        if (tokenName.includes('SPRING_STIFFNESS')) {
          newValue = 200; // Default stiffness
        } else if (tokenName.includes('SPRING_DAMPING')) {
          newValue = 18; // Default damping
        } else if (tokenName.includes('SPRING_MASS')) {
          newValue = 1; // Default mass
        }
      }
    }
    
    setTokenValues(prev => ({
      ...prev,
      [tokenName]: newValue
    }));
  };

  // Функция для получения описания токена или использования технического названия если описание отсутствует
  const getTokenDescription = (tokenName) => {
    const description = tokenDescriptions[tokenName];
    if (description === '__HIDDEN__') return null;
    return description || tokenName;
  };

  // Функция для получения названия компонента из токена
  const getComponentFromToken = (tokenName) => {
    const parts = tokenName.split('_');
    return parts[0];
  };

  // Группируем токены по типам и сортируем их по названию компонента
  const groupedTokens = Object.entries(tokenValues).reduce((acc, [key, value]) => {
    if (key.includes('DURATION') || key.includes('MOTION') || key.includes('EASING')) {
      // Объединяем токены длительности и плавности в одну группу
      acc.animation.push([key, value]);
    } else if (key.includes('SPRING')) {
      // Группируем spring токены по подтипам (STIFFNESS, DAMPING, MASS)
      if (key.includes('STIFFNESS')) {
        acc.springStiffness.push([key, value]);
      } else if (key.includes('DAMPING')) {
        acc.springDamping.push([key, value]);
      } else if (key.includes('MASS')) {
        acc.springMass.push([key, value]);
      }
    }
    return acc;
  }, { 
    animation: [], // Объединяем duration и motion в одну группу
    springStiffness: [],
    springDamping: [],
    springMass: []
  });

  // Сортируем токены по компонентам (THUMB, AXIS, COUNTER, SLIDER)
  const sortTokens = (tokens) => {
    return [...tokens].sort((a, b) => {
      const compA = a[0].split('_')[0];
      const compB = b[0].split('_')[0];
      return compA.localeCompare(compB);
    });
  };

  // Сортируем все группы токенов
  Object.keys(groupedTokens).forEach(key => {
    groupedTokens[key] = sortTokens(groupedTokens[key]);
  });

  // Функция для группировки токенов по компонентам
  const groupTokensByComponent = (tokens) => {
    return tokens.reduce((acc, token) => {
      const componentName = getComponentFromToken(token[0]);
      if (!acc[componentName]) {
        acc[componentName] = [];
      }
      acc[componentName].push(token);
      return acc;
    }, {});
  };

  // Группируем токены по компонентам
  const animationByComponent = groupTokensByComponent(groupedTokens.animation);

  // Функция для перевода названия компонента на русский
  const getComponentTranslation = (componentName) => {
    const translations = {
      'THUMB': 'Ползунок',
      'AXIS': 'Ось слайдера',
      'COUNTER': 'Счетчик',
      'SLIDER': 'Общие настройки'
    };
    return translations[componentName] || componentName;
  };

  // Функция для сортировки токенов в правильном порядке
  const sortTokensInPairs = (componentTokens) => {
    // Создаем объект для хранения пар токенов
    const tokenPairs = {};
    
    // Группируем токены по базовому имени (без DURATION/EASING)
    componentTokens.forEach(token => {
      const tokenName = token[0];
      const baseName = tokenName.replace('_DURATION', '').replace('_EASING', '').replace('_MOTION', '');
      
      if (!tokenPairs[baseName]) {
        tokenPairs[baseName] = [];
      }
      tokenPairs[baseName].push(token);
    });
    
    // Сортируем токены в порядке DURATION, затем EASING для каждого базового имени
    let result = [];
    Object.entries(tokenPairs).forEach(([baseName, tokens]) => {
      // Находим токен длительности
      const durationToken = tokens.find(t => t[0].includes('DURATION'));
      // Находим токен плавности
      const easingToken = tokens.find(t => t[0].includes('EASING') || t[0].includes('MOTION'));
      
      // Сначала добавляем токен длительности, если он есть
      if (durationToken) {
        result.push(durationToken);
      }
      
      // Затем добавляем токен плавности, если он есть
      if (easingToken) {
        result.push(easingToken);
      }
    });
    
    return result;
  };
  
  // Применяем новый порядок сортировки к каждому компоненту
  Object.keys(animationByComponent).forEach(componentName => {
    animationByComponent[componentName] = sortTokensInPairs(animationByComponent[componentName]);
  });

  return (
    <>
      <ErrorBoundary>
        <Slider customTokens={tokenValues} defaultValue={55} withInput={false} active={true} showCounter={true}/>
      </ErrorBoundary>
      
      <div className="tokens-configurator">
        <h3>Настройка токенов анимации</h3>
        
        <div className="tokens-section">          
          {Object.entries(animationByComponent)
            .filter(([componentName]) => componentName !== 'COUNTER' && componentName !== 'AXIS' && componentName !== 'THUMB')
            .map(([componentName, tokens]) => (
            <div key={componentName} className={`component-group component-group-${componentName}`}>
              {tokens.map(([tokenName, tokenValue]) => {
                const description = getTokenDescription(tokenName);
                if (description === null) return null; // Пропускаем скрытые токены
                
                // Определяем, какие элементы управления отображать в зависимости от типа токена
                const isEasing = tokenName.includes('EASING') || tokenName.includes('MOTION');
                const isDuration = tokenName.includes('DURATION');
                
                return (
                  <div className="token-group" key={tokenName}>
                    <div className="token-description">
                      <label htmlFor={`token-${tokenName}`}>{description}</label>
                    </div>
                    <div className="token-controls">
                      <select 
                        id={`token-${tokenName}`}
                        value={tokenValue}
                        onChange={handleTokenChange(tokenName)}
                      >
                        <optgroup label="Из tokens.json">
                          {isEasing && availableMotions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          {isDuration && availableDurations.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      
                      <input
                        type="text"
                        className="token-custom-value"
                        value={tokenValue}
                        onChange={handleTokenChange(tokenName)}
                        placeholder="Введите значение"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Добавляем секцию для Spring токенов */}
        {(groupedTokens.springStiffness.length > 0 || 
          groupedTokens.springDamping.length > 0 || 
          groupedTokens.springMass.length > 0) && (
          <div className="tokens-section">
            <h4>Токены Spring анимации</h4>
            
            {/* Stiffness tokens */}
            {groupedTokens.springStiffness.length > 0 && (
              <div className="spring-token-group">
                {groupedTokens.springStiffness.map(([tokenName, tokenValue]) => {
                  const description = getTokenDescription(tokenName);
                  if (description === null) return null; // Пропускаем скрытые токены
                  return (
                    <div className="token-group" key={tokenName}>
                      <div className="token-description">
                        <label htmlFor={`token-${tokenName}`}>{description}</label>
                      </div>
                      <input
                        type="number"
                        id={`token-${tokenName}`}
                        className="token-custom-value"
                        value={tokenValue}
                        onChange={handleTokenChange(tokenName)}
                        min="1"
                        max="1000"
                        step="10"
                      />
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Damping tokens */}
            {groupedTokens.springDamping.length > 0 && (
              <div className="spring-token-group">
                {groupedTokens.springDamping.map(([tokenName, tokenValue]) => {
                  const description = getTokenDescription(tokenName);
                  if (description === null) return null; // Пропускаем скрытые токены
                  return (
                    <div className="token-group" key={tokenName}>
                      <div className="token-description">
                        <label htmlFor={`token-${tokenName}`}>{description}</label>
                      </div>
                      <input
                        type="number"
                        id={`token-${tokenName}`}
                        className="token-custom-value"
                        value={tokenValue}
                        onChange={handleTokenChange(tokenName)}
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Mass tokens */}
            {groupedTokens.springMass.length > 0 && (
              <div className="spring-token-group">
                {groupedTokens.springMass.map(([tokenName, tokenValue]) => {
                  const description = getTokenDescription(tokenName);
                  if (description === null) return null; // Пропускаем скрытые токены
                  return (
                    <div className="token-group" key={tokenName}>
                      <div className="token-description">
                        <label htmlFor={`token-${tokenName}`}>{description}</label>
                      </div>
                      <input
                        type="number"
                        id={`token-${tokenName}`}
                        className="token-custom-value"
                        value={tokenValue}
                        onChange={handleTokenChange(tokenName)}
                        min="0.1"
                        max="10"
                        step="0.1"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;