export default class SystemManager {
  public systems: unknown[] = [];
  public add(system: unknown) {
    this.systems.push(system);
  }
}
