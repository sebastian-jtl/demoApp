export default interface IMessageLookup<TOutput> {
  promise: {
    resolve: (value?: TOutput | PromiseLike<TOutput>) => void;
    reject: (reason?: unknown) => void;
  };
}
