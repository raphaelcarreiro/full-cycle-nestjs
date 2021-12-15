import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccountStorageService } from './account-storage/account-storage.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private accountStorage: AccountStorageService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isHttpRequest = this.checkIfIsHttpRequest(context);

    if (!isHttpRequest) {
      return true;
    }

    const token = this.getTokenFromHeader(context);

    if (!token) {
      return false;
    }

    try {
      await this.accountStorage.setBy(token);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  private getTokenFromHeader(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    return request.headers?.['x-token'] as string;
  }

  private checkIfIsHttpRequest(context: ExecutionContext): boolean {
    if (context.getType() === 'http') {
      return true;
    }

    return false;
  }
}
