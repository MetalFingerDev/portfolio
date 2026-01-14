export default class Shaders {
  private store = new Map<string, string>();
  public add(name: string, code: string) {
    this.store.set(name, code);
  }
  public get(name: string): string | undefined {
    return this.store.get(name);
  }
}
