import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router"; // Import the router
import "./styles/global.css"; //

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router); // Use the router

app.mount("#app");