import { computed, inject, Injectable, signal } from '@angular/core';
import type { CurrentUser, EmployeeRecord } from '@demo/shared';
import { ApiService } from '../api.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly api = inject(ApiService);
  private readonly currentUserState = signal<CurrentUser | null>(null);
  private readonly sessionChecked = signal(false);

  readonly currentUser = this.currentUserState.asReadonly();
  readonly hasSession = computed(() => Boolean(this.currentUser()?.email));
  readonly isSessionChecked = this.sessionChecked.asReadonly();

  getEmployees(signal: AbortSignal): Promise<EmployeeRecord[]> {
    return this.api.request<EmployeeRecord[]>('GET', '/api/employees', {
      signal,
      fallbackError: 'LOGIN_EMPLOYEES_FETCH_FAILED',
    });
  }

  getSession(): Promise<CurrentUser> {
    return this.api.request<CurrentUser>('GET', '/api/login/session', {
      fallbackError: 'LOGIN_SESSION_FETCH_FAILED',
    });
  }

  async loadSession(): Promise<void> {
    try {
      this.currentUserState.set(await this.getSession());
    } finally {
      this.sessionChecked.set(true);
    }
  }

  async login(email: string): Promise<void> {
    const currentUser = await this.api.request<CurrentUser>('POST', '/api/login', {
      body: { email },
      fallbackError: 'LOGIN_FAILED',
    });
    if (!currentUser.email) {
      throw new Error('LOGIN_FAILED');
    }

    this.currentUserState.set(currentUser);
    this.sessionChecked.set(true);
  }

  async logout(): Promise<void> {
    await this.api.request<void>('DELETE', '/api/login/session', {
      fallbackError: 'LOGOUT_FAILED',
    });

    this.currentUserState.set(null);
  }
}

