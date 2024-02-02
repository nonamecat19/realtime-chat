import {ArgumentsHost, Catch, HttpException} from '@nestjs/common';
import {WsException} from '@nestjs/websockets';
import {Socket} from 'socket.io';

interface Response {
  message: string[];
  error: string;
  statusCode: number;
}

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    if (!(exception instanceof HttpException)) {
      console.log(exception);
      return;
    }
    const status = exception.getStatus();
    const message = (exception.getResponse() as Response)?.message || 'Internal Server Error';
    client.emit('error', {status, message});
  }
}
