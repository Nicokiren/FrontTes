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
      state.courses.find((course) => course.id === id),
    getCurrentCourse: (state) => state.currentCourse,
    getCourseVideos: (state) => state.currentCourse?.videos || [],
  },

  actions: {
    // Helper para requisições autenticadas
    async authenticatedRequest(url, options = {}) {
      const authStore = useAuthStore();
      return authStore.authenticatedRequest(url, options);
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
          const errorData = await response.json();
          this.error = errorData.message || "Erro ao buscar cursos";
          return { success: false, message: this.error };
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
          return { success: true, data: this.currentCourse };
        } else {
          const errorData = await response.json();
          this.error = errorData.message || "Curso não encontrado";
          return { success: false, message: this.error };
        }
      } catch (error) {
        console.error("Erro ao buscar curso:", error);
        this.error = "Erro ao conectar com o servidor para buscar o curso";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Criar um novo curso
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
          this.courses.push(newCourse);
          return { success: true, data: newCourse };
        } else {
          const errorData = await response.json();
          this.error = errorData.message || "Erro ao criar curso";
          return { success: false, message: this.error };
        }
      } catch (error) {
        console.error("Erro ao criar curso:", error);
        this.error = "Erro ao conectar com o servidor para criar curso";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Atualizar um curso existente
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
          const updatedCourse = await response.json();
          const index = this.courses.findIndex((c) => c.id === id);
          if (index !== -1) {
            this.courses[index] = updatedCourse;
          }
          if (this.currentCourse?.id === id) {
            this.currentCourse = updatedCourse;
          }
          return { success: true, data: updatedCourse };
        } else {
          const errorData = await response.json();
          this.error = errorData.message || "Erro ao atualizar curso";
          return { success: false, message: this.error };
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
          this.courses = this.courses.filter((course) => course.id !== id);
          return { success: true, message: "Curso deletado com sucesso" };
        } else {
          const errorData = await response.json();
          this.error = errorData.message || "Erro ao deletar curso";
          return { success: false, message: this.error };
        }
      } catch (error) {
        console.error("Erro ao deletar curso:", error);
        this.error = "Erro ao conectar com o servidor para deletar curso";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Adicionar um vídeo a um curso
    async addVideoToCourse(courseId, videoData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
          `http://localhost:3000/courses/${courseId}/videos`,
          {
            method: "POST",
            body: JSON.stringify(videoData),
          }
        );
        if (response.ok) {
          const newVideo = await response.json();
          if (this.currentCourse && this.currentCourse.id === courseId) {
            if (!this.currentCourse.videos) {
              this.currentCourse.videos = [];
            }
            this.currentCourse.videos.push(newVideo);
          }
          return { success: true, data: newVideo };
        } else {
          const errorData = await response.json();
          this.error = errorData.message || "Erro ao adicionar vídeo";
          return { success: false, message: this.error };
        }
      } catch (error) {
        console.error("Erro ao adicionar vídeo:", error);
        this.error = "Erro ao conectar com o servidor para adicionar vídeo";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Atualizar um vídeo de um curso
    async updateCourseVideo(courseId, videoId, videoData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
          `http://localhost:3000/courses/${courseId}/videos/${videoId}`,
          {
            method: "PUT",
            body: JSON.stringify(videoData),
          }
        );
        if (response.ok) {
          const updatedVideo = await response.json();
          if (this.currentCourse && this.currentCourse.id === courseId) {
            const index = this.currentCourse.videos.findIndex(
              (v) => v.id === videoId
            );
            if (index !== -1) {
              this.currentCourse.videos[index] = updatedVideo;
            }
          }
          return { success: true, data: updatedVideo };
        } else {
          const errorData = await response.json();
          this.error = errorData.message || "Erro ao atualizar vídeo";
          return { success: false, message: this.error };
        }
      } catch (error) {
        console.error("Erro ao atualizar vídeo:", error);
        this.error = "Erro ao conectar com o servidor para atualizar vídeo";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Deletar um vídeo de um curso
    async deleteCourseVideo(courseId, videoId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await this.authenticatedRequest(
          `http://localhost:3000/courses/${courseId}/videos/${videoId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          if (this.currentCourse && this.currentCourse.id === courseId) {
            this.currentCourse.videos = this.currentCourse.videos.filter(
              (video) => video.id !== videoId
            );
          }
          return { success: true, message: "Vídeo deletado com sucesso" };
        } else {
          const errorData = await response.json();
          this.error = errorData.message || "Erro ao deletar vídeo";
          return { success: false, message: this.error };
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