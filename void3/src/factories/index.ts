export default class Factory {
  public create<T>(ctor: new (...args: any[]) => T, ...args: any[]): T {
    return new ctor(...args);
  }
}
