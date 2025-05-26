<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/">Home</router-link>
      <router-link to="/courses">Cursos</router-link>
      <template v-if="!authStore.isLoggedIn">
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>
      <template v-else>
        <span>Bem-vindo, {{ authStore.user?.username }}!</span>
        <button @click="handleLogout" class="logout-btn">Sair</button>
      </template>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth_store";
import { useRouter } from "vue-router";
import { onMounted } from "vue";

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    onMounted(() => {
      authStore.initAuth();
    });

    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    return {
      authStore,
      handleLogout,
    };
  },
};
</script>

<style>
.main-nav {
  background-color: var(--dark);
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.main-nav a {
  color: var(--light);
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  background-color: var(--primary);
}

.main-nav span {
  color: var(--light);
  font-weight: bold;
  margin-left: auto;
}

.logout-btn {
  background-color: var(--accent);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>