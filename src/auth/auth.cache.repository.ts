import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async CacheRefreshToken(user: string, refresh_token: string) {
    await this.cacheManager.del(user);
    await this.cacheManager.set(user, refresh_token, 600000);
  }

  async RetrieveRefreshTokenFromCache(user: string) {
    const refresh_token = await this.cacheManager.get(user);
    return refresh_token;
  }

  async DeleteRefreshTokenFromCache(user: string) {
    await this.cacheManager.del(user);
  }
}
