// frontend/src/stores/auth_store.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,             // será { id, name, email, role }
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    getUserData: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated,
    getUserRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === "admin",
    isStudent: (state) => state.user?.role === "student",
  },

  actions: {
    // -----------------------------
    // 1) Inicializar o store (token + userData do Storage)
    // -----------------------------
    initAuth() {
      const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
      const userDataString =
          localStorage.getItem("userData") || sessionStorage.getItem("userData");

      if (token) {
        this.token = token;
        if (userDataString) {
          this.user = JSON.parse(userDataString);
          this.isAuthenticated = true;
        } else {
          // Se não há userData, limpa para forçar novo login
          this.clearAuthData();
        }
      }
    },

    // -----------------------------
    // 2) Fazer login (adaptado para capturar name, seja em result.user ou em result)
    // -----------------------------
    async login(credentials) {
      this.isLoading = true;

      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (response.ok) {
          const result = await response.json();
          // Supondo que result === { token, id, name, email, role } OU { token, user: { id, name, email, role } }

          // Extrai o token
          this.token = result.token;
          this.isAuthenticated = true;

          // Determina o objeto userPayload corretamente
          let userPayload;
          if (result.user) {
            // Se veio no formato { user: { ... } }
            userPayload = result.user;
          } else {
            // Se veio no topo: { id, name, email, role }
            userPayload = {
              id: result.id,
              name: result.name,
              email: result.email,
              role: result.role,
            };
          }
          this.user = userPayload;

          // Salva no Storage (localStorage se rememberMe, senão sessionStorage)
          const storage = credentials.rememberMe ? localStorage : sessionStorage;
          storage.setItem("authToken", result.token);
          storage.setItem("userData", JSON.stringify(userPayload));

          return { success: true, data: result };
        } else {
          const error = await response.json();
          return {
            success: false,
            message: error.message || "Credenciais inválidas",
          };
        }
      } catch (error) {
        console.error("Erro na requisição de login:", error);
        return { success: false, message: "Erro ao conectar com o servidor" };
      } finally {
        this.isLoading = false;
      }
    },

    // -----------------------------
    // 3) Fazer registro (mantém igual)
    // -----------------------------
    async register(userData) {
      this.isLoading = true;
      try {
        const response = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        if (response.ok) {
          const result = await response.json();
          return { success: true, data: result };
        } else {
          const error = await response.json();
          return {
            success: false,
            message: error.message || "Erro ao criar conta",
          };
        }
      } catch (error) {
        console.error("Erro na requisição de registro:", error);
        return { success: false, message: "Erro ao conectar com o servidor" };
      } finally {
        this.isLoading = false;
      }
    },

    // -----------------------------
    // 4) Fazer logout
    // -----------------------------
    async logout() {
      try {
        if (this.token) {
          await fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          });
        }
      } catch (error) {
        console.error("Erro no logout do servidor:", error);
      } finally {
        this.clearAuthData();
      }
    },

    // -----------------------------
    // 5) Limpar dados de autenticação
    // -----------------------------
    clearAuthData() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
    },

    // -----------------------------
    // 6) Requisição autenticada (sem alteração)
    // -----------------------------
    async authenticatedRequest(url, options = {}) {
      const headers = {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      };
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        await this.logout();
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      return response;
    },

    // -----------------------------
    // 7) Validar token (sem alteração)
    // -----------------------------
    async validateToken() {
      if (!this.token) return false;
      try {
        const response = await this.authenticatedRequest(
            "http://localhost:3000/auth/validate"
        );
        return response.ok;
      } catch (error) {
        console.error("Erro ao validar token:", error);
        return false;
      }
    },

    // -----------------------------
    // 8) Atualizar dados do usuário (sem alteração)
    // -----------------------------
    updateUser(userData) {
      this.user = { ...this.user, ...userData };
      const storage = localStorage.getItem("authToken")
          ? localStorage
          : sessionStorage;
      storage.setItem("userData", JSON.stringify(this.user));
    },
  },
});
