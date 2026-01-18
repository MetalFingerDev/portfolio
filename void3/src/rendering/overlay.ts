export default class Overlay {
  private el: HTMLDivElement;
  private notifContainer: HTMLDivElement;

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

    // Container for transient notifications (top-right)
    this.notifContainer = document.createElement("div");
    this.notifContainer.style.position = "fixed";
    this.notifContainer.style.right = "8px";
    this.notifContainer.style.top = "8px";
    this.notifContainer.style.display = "flex";
    this.notifContainer.style.flexDirection = "column";
    this.notifContainer.style.gap = "8px";
    this.notifContainer.style.zIndex = "10000";
    document.body.appendChild(this.notifContainer);
  }

  update(name: string | null, scale: number | null) {
    const n = name ?? "(none)";
    const s = typeof scale === "number" ? scale.toFixed(3) : "-";
    this.el.innerText = `System: ${n}\nScale: ${s}`;
  }

  notify(message: string, durationMs: number = 3000) {
    const node = document.createElement("div");
    node.style.background = "rgba(0,0,0,0.75)";
    node.style.color = "#fff";
    node.style.fontFamily = "monospace, sans-serif";
    node.style.fontSize = "13px";
    node.style.padding = "8px 12px";
    node.style.borderRadius = "6px";
    node.style.opacity = "1";
    node.style.transition = "opacity 300ms ease, transform 300ms ease";
    node.style.pointerEvents = "auto";
    node.innerText = message;

    // Insert at top
    this.notifContainer.insertBefore(node, this.notifContainer.firstChild);

    // Auto-dismiss
    setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(-6px)";
      setTimeout(() => node.remove(), 350);
    }, durationMs);
  }

  destroy() {
    this.el.remove();
    this.notifContainer.remove();
  }
}
