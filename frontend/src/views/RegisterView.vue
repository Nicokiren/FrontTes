<template>
  <div class="container login-register-form">
    <h2>Registrar</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="reg-username">Usuário:</label>
        <input type="text" id="reg-username" v-model="registration.username" required />
      </div>
      <div class="form-group">
        <label for="reg-email">Email:</label>
        <input type="email" id="reg-email" v-model="registration.email" required />
      </div>
      <div class="form-group">
        <label for="reg-password">Senha:</label>
        <input type="password" id="reg-password" v-model="registration.password" required />
      </div>
      <div class="form-group">
        <label for="reg-role">Tipo de Usuário:</label>
        <select id="reg-role" v-model="registration.role">
          <option value="student">Estudante</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <button type="submit" class="btn-primary" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Registrando...' : 'Criar Conta' }}
      </button>
      <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
    </form>
    <p class="switch-form">
      Já tem uma conta? <router-link to="/login">Faça login aqui</router-link>
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

    const registration = ref({
      username: "",
      email: "",
      password: "",
      role: "student", // Default role
    });

    const handleRegister = async () => {
      const result = await authStore.register(registration.value);
      if (result.success) {
        alert("Conta criada com sucesso! Agora você pode fazer login.");
        router.push("/login");
      } else {
        alert(`Erro ao registrar: ${result.message}`);
      }
    };

    return {
      registration,
      authStore,
      handleRegister,
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
.form-group input[type="email"],
.form-group input[type="password"],
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
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