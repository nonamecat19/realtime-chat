import {CanActivate, ExecutionContext, Injectable, Logger} from '@nestjs/common';
import {Socket} from 'socket.io';
import {RoleEnum} from '../../../../db/entities/user.entity';

@Injectable()
export class AdminWsGuard implements CanActivate {
  logger = new Logger(AdminWsGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const role = client?.data?.user?.user?.role ?? RoleEnum.USER;
    if (role === RoleEnum.ADMIN) {
      return true;
    }
    this.logger.debug('Permission error');
    client.emit('error', {status: 403, message: 'Permission error'});
    return false;
  }
}
