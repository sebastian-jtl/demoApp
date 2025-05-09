import { ChannelMessage, EventObject, IMessageLookup, MessageType, MethodCallBody } from './types';

export default class PluginBridge {
  private _messagePort: MessagePort;

  private _messageLookup: Map<string, IMessageLookup<unknown>> = new Map<string, IMessageLookup<unknown>>();
  private _eventListeners: Record<string, ((data: unknown) => Promise<unknown>)[]> = {};
  private _exposedMethods: Record<string, (...params: unknown[]) => unknown> = {};

  public constructor(messagePort: MessagePort) {
    this._messagePort = messagePort;
    this._messagePort.onmessage = this._handleMessage.bind(this);
  }

  public subscribe(event: string, callback: (data: unknown) => Promise<unknown>) {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(callback);
  }

  public async publish<TPayload>(topic: string, payload: TPayload) {
    const eventObject: EventObject = {
      topic,
      payload,
    };

    return this.sendMessage<EventObject>('EVENT_TRIGGER', eventObject);
  }

  public exposeMethod<TMethod>(methodName: string, method: TMethod) {
    this._exposedMethods[methodName] = method as (...params: unknown[]) => unknown;
  }

  public isMethodExposed(methodName: string): boolean {
    return !!this._exposedMethods[methodName];
  }

  public async callMethod<TResponse>(methodName: string, ...args: unknown[]): Promise<TResponse> {
    return this.sendMessage<MethodCallBody, TResponse>('METHOD_CALL', { methodName, args });
  }

  private async _handleMessage(e: MessageEvent<ChannelMessage>) {
    const { id, type, body } = ChannelMessage.parse(e.data);

    switch (type) {
      // We asked Plugin
      case 'METHOD_CALL_RETURN': {
        const requestMessage = this._messageLookup.get(id);
        if (!requestMessage) {
          return;
        }

        requestMessage.promise.resolve(body);
        this._messageLookup.delete(id);
        break;
      }
      case 'METHOD_CALL_ERROR': {
        const requestMessage = this._messageLookup.get(id);
        if (!requestMessage) {
          return;
        }

        requestMessage.promise.reject(body);
        this._messageLookup.delete(id);
        break;
      }

      // Plugin asks us
      case 'METHOD_CALL': {
        const methodCallBody = MethodCallBody.parse(body);
        const method = this._exposedMethods[methodCallBody.methodName];
        if (!method) {
          console.error(`Method ${methodCallBody.methodName} is not exposed`);
          return;
        }
        let result = method(...methodCallBody.args);

        // If method is async, wait for it to resolve
        if (result instanceof Promise) {
          result = await result;
        }

        const answerMessage: ChannelMessage = {
          id,
          type: 'METHOD_CALL_RETURN',
          body: result,
        };
        this._messagePort.postMessage(answerMessage);
        break;
      }

      // Plugin confirmed it received event
      case 'EVENT_TRIGGER_CONFIRMATION': {
        const eventMessage = this._messageLookup.get(id);
        if (!eventMessage) {
          return;
        }

        eventMessage.promise.resolve();
        this._messageLookup.delete(id);
        break;
      }

      // We confirm that we received event message and invoke listeners
      case 'EVENT_TRIGGER': {
        const event = EventObject.parse(body);
        const listeners = this._eventListeners[event.topic];
        listeners?.forEach(t => t(event.payload));

        const eventResponse: ChannelMessage = {
          id,
          type: 'EVENT_TRIGGER_CONFIRMATION',
        };

        this._messagePort.postMessage(eventResponse);
        break;
      }

      default:
        break;
    }
  }

  private async sendMessage<TBody, TResponse = void>(type: MessageType, body: TBody): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      const id = crypto.randomUUID();
      this._messageLookup.set(id, {
        promise: { resolve, reject },
      } as IMessageLookup<unknown>);

      const transferObject: ChannelMessage = {
        id,
        type,
        body,
      };

      this._messagePort.postMessage(transferObject);
      setTimeout(() => reject('Plugin timeout'), 30 * 1000);
    });
  }
}
