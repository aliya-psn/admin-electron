// src/shims-vue.d.ts
declare module '@/utils/scroll-to' {
  function scrollTo(to: number, duration: number): void;
  export { scrollTo };
}
