import { writable } from "svelte/store";
export const theme = writable<"light" | "dark">("light");
export const user = writable<{ name: string; loggedIn: boolean } | null>(null);
