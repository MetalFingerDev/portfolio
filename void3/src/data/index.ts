export default class DataStore {
  public async load(url: string): Promise<Response> {
    return fetch(url);
  }
}
