<template>
  <div id="app">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container">
        <router-link to="/" class="navbar-brand">Learn FDD</router-link>

        <div class="nav-links">
          <router-link to="/" exact class="nav-item" active-class="active-link">
            Home
          </router-link>
          <router-link to="/courses" class="nav-item" active-class="active-link">
            Cursos
          </router-link>

          <!-- Se NÃO estiver logado, mostra Login e Registrar -->
          <template v-if="!authStore.isLoggedIn">
            <router-link to="/login" class="nav-item" active-class="active-link">
              Login
            </router-link>
            <router-link to="/register" class="nav-item" active-class="active-link">
              Registrar
            </router-link>
          </template>

          <!-- Se JÁ estiver logado, exibe “Bem-vindo, usuário!” e botão Sair -->
          <template v-else>
            <span class="nav-user">
              Bem-vindo, {{ displayName }}!
            </span>
            <button @click="handleLogout" class="btn btn-accent logout-btn">
              Sair
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Landing page em “/” -->
    <div v-if="$route.path === '/'" class="home container text-center">
      <h1>Bem‐vindo ao Learn FDD!</h1>
      <p class="description">
        Aprenda Feature Driven Development e transforme sua equipe de desenvolvimento.
      </p>
      <router-link to="/courses" class="btn btn-primary btn-lg home-btn">
        Ver Cursos
      </router-link>
    </div>

    <!-- Qualquer outra rota -->
    <router-view v-else />
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth_store";
import { useRouter } from "vue-router";
import { onMounted, computed } from "vue";

export default {
  name: "App",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    // Inicializa a autenticação (carrega token + user do storage)
    onMounted(async () => {
      await authStore.initAuth();
    });

    // Computed que decide qual campo mostrar: username ou name
    const displayName = sessionStorage.getItem(name.valueOf());

    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    return {
      authStore,
      displayName,
      handleLogout,
    };
  },
};
</script>

<style>
/* ---- Navbar ---- */
.navbar {
  background-color: var(--dark);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar .container {
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.navbar-brand {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--text-light);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Garante que, mesmo no hover ou ativo, o texto continue branco */
.nav-item {
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  transition: background-color 0.2s, color 0.2s;
  background-color: transparent;
}

.nav-item:hover {
  background-color: var(--primary-dark);
  color: var(--text-light) !important;
}

.nav-item.router-link-active,
.nav-item.active-link {
  background-color: var(--primary);
  color: var(--text-light) !important;
}

.nav-user {
  color: var(--text-light);
  font-weight: 500;
  margin-left: 1.5rem;
}

.logout-btn {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: var(--accent-dark);
}

/* ---- Landing Page (rota “/”) ---- */
.home {
  padding-top: 4rem; /* Espaço abaixo da navbar */
  padding-bottom: 4rem;
  background-color: var(--light);
  width: 100%;
}

.home h1 {
  font-size: 2.8rem;
  margin-bottom: 1rem;
  color: var(--dark);
}

.home .description {
  font-size: 1.125rem;
  color: #4b4b4b;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.home-btn {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1.125rem;
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.home-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(52, 152, 219, 0.4);
}

/* ---- Utilitários / Responsividade ---- */
.container {
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
}

.text-center {
  text-align: center;
}

@media (max-width: 576px) {
  .home h1 {
    font-size: 2.2rem;
  }
  .home .description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  .home-btn {
    font-size: 1rem;
    padding: 0.85rem 1.8rem;
  }
}
</style>
