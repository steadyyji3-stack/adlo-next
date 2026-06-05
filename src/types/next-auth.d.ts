import type { DefaultSession } from 'next-auth';
import type { ServiceStatus } from '@/lib/customers';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      customerId: string | null;
      storeName: string | null;
      serviceStatus: ServiceStatus | null;
    } & DefaultSession['user'];
  }
}
