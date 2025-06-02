// frontend/src/stores/course_store.js
import { defineStore } from "pinia";
import { useAuthStore } from "./auth_store"; // Import the auth store

export const useCourseStore = defineStore("course", {
  state: () => ({
    courses: [],
    currentCourse: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getAllCourses: (state) => state.courses,
    getCourseById: (state) => (id) =>
        state.courses.find((course) => course.id === parseInt(id)),
    getCurrentCourse: (state) => state.currentCourse,
    getCourseVideos: (state) => state.currentCourse?.videos || [],
  },

  actions: {
    // Helper para requisições autenticadas
    async authenticatedRequest(url, options = {}, isFormData = false) {
      const authStore = useAuthStore();
      const defaultHeaders = {};
      if (!isFormData) {
        defaultHeaders['Content-Type'] = 'application/json';
      }

      const fetchOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
      };

      if (isFormData) {
        const token = authStore.token;
        if (!token) {
          console.error("Token não encontrado para requisição FormData");
          throw new Error("Token não encontrado");
        }
        fetchOptions.headers = { // Sobrescreve headers para FormData
          'Authorization': `Bearer ${token}`,
          ...(options.headers || {}),
        };
        delete fetchOptions.headers['Content-Type'];
        return fetch(url, fetchOptions);
      } else {
        // Para JSON, usamos o helper authStore.authenticatedRequest
        // que deve adicionar o token e o Content-Type se não for FormData
        return authStore.authenticatedRequest(url, fetchOptions);
      }
    },

    // Buscar todos os cursos
    async fetchAllCourses() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
            "http://localhost:3000/courses"
        );
        if (response.ok) {
          this.courses = await response.json();
          return { success: true, data: this.courses };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Erro ao buscar cursos";
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        this.error = "Erro ao conectar com o servidor para buscar cursos";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Buscar um curso pelo ID
    async fetchCourseById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
            `http://localhost:3000/courses/${id}`
        );
        if (response.ok) {
          this.currentCourse = await response.json();
          if (this.currentCourse && !Array.isArray(this.currentCourse.videos)) {
            this.currentCourse.videos = [];
          }
          return { success: true, data: this.currentCourse };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Curso não encontrado";
          this.currentCourse = null;
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao buscar curso:", error);
        this.error = "Erro ao conectar com o servidor para buscar o curso";
        this.currentCourse = null;
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Criar um novo curso (envia JSON)
    async createCourse(courseData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
            "http://localhost:3000/courses",
            {
              method: "POST",
              body: JSON.stringify(courseData),
            }
        );
        if (response.ok) {
          const newCourse = await response.json();
          return { success: true, data: newCourse };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Erro ao criar curso";
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao criar curso:", error);
        this.error = "Erro ao conectar com o servidor para criar curso";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Atualizar um curso existente (envia JSON)
    async updateCourse(id, courseData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
            `http://localhost:3000/courses/${id}`,
            {
              method: "PUT",
              body: JSON.stringify(courseData),
            }
        );
        if (response.ok) {
          const updatedCourseData = await response.json();
          const index = this.courses.findIndex((c) => c.id === parseInt(id));
          if (index !== -1) {
            this.courses[index] = { ...this.courses[index], ...updatedCourseData };
          }
          if (this.currentCourse && this.currentCourse.id === parseInt(id)) {
            const currentVideos = this.currentCourse.videos;
            this.currentCourse = { ...this.currentCourse, ...updatedCourseData };
            if (updatedCourseData.videos === undefined && currentVideos) {
              this.currentCourse.videos = currentVideos;
            } else if (updatedCourseData.videos && !Array.isArray(updatedCourseData.videos)) {
              this.currentCourse.videos = [];
            }
          }
          return { success: true, data: updatedCourseData };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Erro ao atualizar curso";
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao atualizar curso:", error);
        this.error = "Erro ao conectar com o servidor para atualizar curso";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Deletar um curso
    async deleteCourse(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
            `http://localhost:3000/courses/${id}`,
            {
              method: "DELETE",
            }
        );
        if (response.ok) {
          this.courses = this.courses.filter((course) => course.id !== parseInt(id));
          if (this.currentCourse && this.currentCourse.id === parseInt(id)) {
            this.currentCourse = null;
          }
          return { success: true, message: "Curso deletado com sucesso" };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Erro ao deletar curso";
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao deletar curso:", error);
        this.error = "Erro ao conectar com o servidor para deletar curso";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // --- AÇÕES DE VÍDEO ---

    async addVideoWithUpload(courseId, formData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
            `http://localhost:3000/courseVideos/upload`, // Rota correta
            {
              method: "POST",
              body: formData,
            },
            true // Indica FormData
        );

        if (response.ok) {
          const newVideoData = await response.json();
          if (this.currentCourse && this.currentCourse.id === parseInt(courseId)) {
            if (!this.currentCourse.videos) {
              this.currentCourse.videos = [];
            }
            // A resposta do backend para uploadVideo agora retorna o objeto completo do vídeo
            this.currentCourse.videos.push(newVideoData);
          }
          // Retorna o objeto completo do vídeo (id, name, description, url, etc.)
          return { success: true, data: newVideoData };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Erro ao adicionar vídeo com upload";
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao adicionar vídeo com upload:", error);
        this.error = "Erro de conexão ao fazer upload do vídeo";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async updateVideoMetadata(videoId, metadataPayload) {
      this.isLoading = true;
      this.error = null;
      try {
        // URL CORRIGIDA para PUT /courseVideos/:videoId
        const response = await this.authenticatedRequest(
            `http://localhost:3000/courseVideos/${videoId}`,
            {
              method: "PUT",
              body: JSON.stringify(metadataPayload),
            }
            // false para isFormData (ou omitir, já que é o padrão do helper)
        );
        if (response.ok) {
          const updatedVideoResponse = await response.json(); // Backend retorna { message, data: videoAtualizado }
          const updatedVideoData = updatedVideoResponse.data;

          if (this.currentCourse && this.currentCourse.videos && updatedVideoData) {
            const index = this.currentCourse.videos.findIndex(
                (v) => v.id === parseInt(updatedVideoData.id || videoId)
            );
            if (index !== -1) {
              this.currentCourse.videos[index] = {
                ...this.currentCourse.videos[index],
                ...updatedVideoData // Mescla com os dados retornados
              };
            }
          }
          return { success: true, data: updatedVideoData };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Erro ao atualizar metadados do vídeo";
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao atualizar metadados do vídeo:", error);
        this.error = error.message || "Erro de conexão ao atualizar metadados do vídeo";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCourseVideo(videoId) { // courseId não é mais necessário para a URL da API
      this.isLoading = true;
      this.error = null;
      try {
        // URL CORRIGIDA para DELETE /courseVideos/:videoId
        const response = await this.authenticatedRequest(
            `http://localhost:3000/courseVideos/${videoId}`,
            {
              method: "DELETE",
            }
        );
        if (response.ok) {
          // Remove o vídeo da lista local do currentCourse
          if (this.currentCourse && this.currentCourse.videos) {
            this.currentCourse.videos = this.currentCourse.videos.filter(
                (video) => video.id !== parseInt(videoId)
            );
          }
          return { success: true, message: "Vídeo deletado com sucesso" };
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          this.error = errorData.message || "Erro ao deletar vídeo";
          return { success: false, message: this.error, status: response.status };
        }
      } catch (error) {
        console.error("Erro ao deletar vídeo:", error);
        this.error = "Erro ao conectar com o servidor para deletar vídeo";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },
  },
});
