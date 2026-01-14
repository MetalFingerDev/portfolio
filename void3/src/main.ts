import "./style.css";

const canvas = document.querySelector<HTMLDivElement>("#app")!.innerHTML;
if (!canvas) throw new Error("Canvas not found");
