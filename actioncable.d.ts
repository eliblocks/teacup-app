declare module "@rails/actioncable" {
  interface Subscription {
    unsubscribe(): void;
    perform(action: string, data?: Record<string, unknown>): void;
  }

  interface Subscriptions {
    create(
      channel: string | Record<string, unknown>,
      mixin?: {
        received?: (data: any) => void;
        connected?: () => void;
        disconnected?: () => void;
        rejected?: () => void;
      }
    ): Subscription;
  }

  interface Consumer {
    subscriptions: Subscriptions;
    disconnect(): void;
  }

  export function createConsumer(url?: string): Consumer;
}
