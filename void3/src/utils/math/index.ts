export default class MathUtils {
  public static clamp(value: number, min = 0, max = 1): number {
    return Math.min(Math.max(value, min), max);
  }
}
