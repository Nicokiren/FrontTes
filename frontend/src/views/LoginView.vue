<template>
  <div class="container login-register-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Usuário:</label>
        <input type="text" id="username" v-model="credentials.username" required />
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input type="password" id="password" v-model="credentials.password" required />
      </div>
      <div class="form-group remember-me">
        <input type="checkbox" id="rememberMe" v-model="credentials.rememberMe" />
        <label for="rememberMe">Lembrar-me</label>
      </div>
      <button type="submit" class="btn-primary" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Entrando...' : 'Entrar' }}
      </button>
      <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
    </form>
    <p class="switch-form">
      Não tem uma conta? <router-link to="/register">Registre-se aqui</router-link>
    </p>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth_store"; //
import { useRouter } from "vue-router";

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const credentials = ref({
      username: "",
      password: "",
      rememberMe: false,
    });

    const handleLogin = async () => {
      const result = await authStore.login(credentials.value);
      if (result.success) {
        router.push("/courses"); // Redirect to courses after successful login
      } else {
        // Error message is already handled by authStore.error and displayed in the template
      }
    };

    return {
      credentials,
      authStore,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-register-form {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  color: var(--primary);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--dark);
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.remember-me input[type="checkbox"] {
  margin-right: 0.5rem;
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  margin-top: 1.5rem;
}

.error-message {
  color: var(--accent);
  margin-top: 1rem;
  font-weight: bold;
}

.switch-form {
  margin-top: 2rem;
  font-size: 0.95rem;
  color: var(--dark);
}

.switch-form a {
  color: var(--primary);
  font-weight: bold;
}
</style>