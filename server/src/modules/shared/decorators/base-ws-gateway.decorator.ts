import {WebSocketGateway} from '@nestjs/websockets';

export function BaseWebSocketGateway(options: Record<string, any> = {}) {
  return WebSocketGateway({
    cors: {
      origin: 'http://localhost:5173',
      ...options.cors,
    },
    ...options,
  });
}
