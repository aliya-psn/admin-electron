import { defineStore, createPinia } from 'pinia';

export const GlobalStore = defineStore({
  id: 'GlobalState',
  state: () => ({
    token: '',
    isCollapse: false
  }),
  getters: {},
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setIsCollapse(data: boolean) {
      this.isCollapse = data;
    }
  }
});

const store = createPinia();

export default store;
