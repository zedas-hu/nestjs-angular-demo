import { ApiService } from './api.service';
import type { KeyResponse } from '@demo/shared';

export type KeyProviderType = 'albums' | 'artists';

export class KeyProvider {
  private keyList: KeyResponse[] | undefined;
  private keyListRequest: Promise<KeyResponse[]> | undefined;

  constructor(
    private readonly api: ApiService,
    private readonly type: KeyProviderType,
  ) {}

  getKeyList(): Promise<KeyResponse[]> {
    if (this.keyList !== undefined)
      return Promise.resolve(this.keyList);

    if (this.keyListRequest === undefined)
      this.keyListRequest = this.loadKeyList()
        .then((keyList) => {
          this.keyList = keyList;
          return keyList;
        })
        .catch((error: unknown) => {
          this.keyListRequest = undefined;
          throw error;
        });

    return this.keyListRequest;
  }

  private loadKeyList(): Promise<KeyResponse[]> {
    return this.api.request<KeyResponse[]>('GET', `/api/${this.type}/keys`, {
      fallbackError: 'KEY_FETCH_ERROR',
    });
  }
}