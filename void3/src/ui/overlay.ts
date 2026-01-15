export default class Overlay {
  private el: HTMLDivElement;

  constructor() {
    this.el = document.createElement("div");
    this.el.style.position = "fixed";
    this.el.style.left = "8px";
    this.el.style.top = "8px";
    this.el.style.padding = "6px 8px";
    this.el.style.background = "rgba(0,0,0,0.6)";
    this.el.style.color = "#fff";
    this.el.style.fontFamily = "monospace, sans-serif";
    this.el.style.fontSize = "12px";
    this.el.style.borderRadius = "4px";
    this.el.style.zIndex = "9999";
    this.el.style.pointerEvents = "none";
    this.el.innerText = "System: (none)\nScale: -";
    document.body.appendChild(this.el);
  }

  update(name: string | null, scale: number | null) {
    const n = name ?? "(none)";
    const s = typeof scale === "number" ? scale.toFixed(3) : "-";
    this.el.innerText = `System: ${n}\nScale: ${s}`;
  }

  destroy() {
    this.el.remove();
  }
}
