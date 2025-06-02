<!-- =========================================
     src/views/Courses.vue
     ========================================= -->
<template>
  <div class="courses-page container">
    <!-- Título da Seção -->
    <h2 class="section-title">Cursos Disponíveis</h2>

    <!-- Botão “Criar Novo Curso” (visível apenas para admin) -->
    <div class="actions" v-if="isAdmin">
      <button @click="goToCreateCourse" class="btn btn-primary btn-lg">
        Criar Novo Curso
      </button>
    </div>

    <!-- Feedback de carregamento ou erro -->
    <div v-if="courseStore.isLoading" class="status-message">
      Carregando cursos...
    </div>
    <div v-else-if="courseStore.error" class="status-message error-message">
      {{ courseStore.error }}
    </div>

    <!-- Lista de cursos (cartões) -->
    <div v-else>
      <div v-if="courseStore.courses.length > 0" class="course-grid">
        <div
            v-for="course in courseStore.courses"
            :key="course.id"
            class="course-card card"
        >
          <div class="card-content">
            <h3 class="card-title">{{ course.name }}</h3>
            <p class="card-text">{{ course.description }}</p>
          </div>
          <div class="card-actions">
            <router-link
                :to="`/courses/${course.id}`"
                class="btn btn-primary btn-sm"
            >
              Ver Curso
            </router-link>
            <button
                v-if="isAdmin"
                @click="editCourse(course.id)"
                class="btn btn-secondary btn-sm"
            >
              Editar
            </button>
            <button
                v-if="isAdmin"
                @click="deleteCourse(course.id)"
                class="btn btn-accent btn-sm"
            >
              Deletar
            </button>
          </div>
        </div>
      </div>
      <div v-else class="status-message no-courses">
        Nenhum curso disponível.
      </div>
    </div>
  </div>
</template>

<script>
import { useCourseStore } from "@/stores/course_store";
import { useAuthStore } from "@/stores/auth_store";
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "Courses",
  setup() {
    const courseStore = useCourseStore();
    const authStore = useAuthStore();
    const router = useRouter();

    const isAdmin = computed(() => authStore.isAdmin);

    onMounted(() => {
      courseStore.fetchAllCourses();
    });

    const goToCreateCourse = () => {
      router.push("/courses/create");
    };

    const editCourse = (id) => {
      router.push(`/courses/edit/${id}`);
    };

    const deleteCourse = async (id) => {
      if (confirm("Tem certeza que deseja deletar este curso?")) {
        const result = await courseStore.deleteCourse(id);
        if (result.success) {
          alert("Curso deletado com sucesso!");
          // Recarrega lista após exclusão
          courseStore.fetchAllCourses();
        } else {
          alert(`Erro: ${result.message}`);
        }
      }
    };

    return {
      courseStore,
      isAdmin,
      goToCreateCourse,
      editCourse,
      deleteCourse,
    };
  },
};
</script>

<style scoped>
/* Container geral */
.courses-page {
  padding: 2rem 1rem;
}

/* Título de seção */
.section-title {
  font-size: 2rem;
  color: var(--dark);
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Botão de ação superior */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

/* Mensagens de status (carregando, erro, sem cursos) */
.status-message {
  text-align: center;
  font-size: 1.125rem;
  color: var(--text-muted);
  margin: 2rem 0;
}

.status-message.error-message {
  color: var(--accent);
}

.status-message.no-courses {
  color: var(--dark);
}

/* Grid responsivo de cartões de curso */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* Cartão de curso */
.course-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--card-bg);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

/* Conteúdo interno do cartão */
.card-content {
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  color: var(--primary);
  margin: 0 0 0.5rem 0;
}

.card-text {
  font-size: 1rem;
  color: var(--dark);
  margin: 0;
}

/* Ações (botões) no rodapé do cartão */
.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Botões pequenos */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Classes adicionais aproveitam estilo já definido em global.css: */
/* .btn-primary, .btn-secondary, .btn-accent */

/* Em telas menores, ajustar gap e padding */
@media (max-width: 576px) {
  .courses-page {
    padding: 1.5rem 0.5rem;
  }
  .section-title {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  .actions {
    justify-content: center;
  }
}
</style>
