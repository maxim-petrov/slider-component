import { generateTokenFiles } from './generateTokens.js';
import path from 'path';

// Плагин для Vite, который отслеживает изменения в файлах токенов
export default function tokensPlugin() {
  return {
    name: 'vite-plugin-tokens',
    
    // Генерируем токены при старте сервера
    buildStart() {
      console.log('🔄 Generating tokens files on build start...');
      generateTokenFiles();
    },
    
    // Отслеживаем изменения в файлах токенов
    configureServer(server) {
      // Отслеживаем изменения в файлах токенов
      const watcher = server.watcher;
      
      watcher.add([
        path.resolve('src/slider-input/tokens/tokens.json'),
        path.resolve('src/tokens.json')
      ]);
      
      watcher.on('change', async (filePath) => {
        if (filePath.includes('tokens.json')) {
          console.log(`🔄 Token file changed: ${filePath}`);
          // Генерируем новые файлы с токенами
          const success = await generateTokenFiles();
          
          if (success) {
            // Уведомляем клиента об обновлении
            server.ws.send({
              type: 'full-reload',
              path: '*'
            });
          }
        }
      });
    }
  };
} 