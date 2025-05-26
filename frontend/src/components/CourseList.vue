<template>
  <div class="container">
    <h2>Cursos Disponíveis</h2>
    <button v-if="isAdmin" @click="goToCreateCourse" class="btn-primary">
      Criar Novo Curso
    </button>

    <div v-if="courseStore.isLoading">Carregando cursos...</div>
    <div v-else-if="courseStore.error" class="error-message">
      {{ courseStore.error }}
    </div>
    <div v-else>
      <ul class="course-list">
        <li v-for="course in courseStore.courses" :key="course.id" class="course-item">
          <h3>{{ course.name }}</h3>
          <p>{{ course.description }}</p>
          <router-link :to="`/courses/${course.id}`" class="btn-primary view-button">Ver Curso</router-link>
          <button v-if="isAdmin" @click="editCourse(course.id)" class="btn-primary edit-button">Editar</button>
          <button v-if="isAdmin" @click="deleteCourse(course.id)" class="btn-primary delete-button">Deletar</button>
        </li>
      </ul>
      <p v-if="courseStore.courses.length === 0">Nenhum curso disponível.</p>
    </div>
  </div>
</template>

<script>
import { useCourseStore } from "@/stores/course_store";
import { useAuthStore } from "@/stores/auth_store"; //
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";

export default {
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
.container {
  padding: 2rem;
}

h2 {
  color: var(--dark);
  text-align: center;
  margin-bottom: 2rem;
}

.btn-primary {
  margin-top: 1rem;
  margin-right: 1rem;
}

.course-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.course-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.course-item h3 {
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.course-item p {
  color: var(--dark);
  margin-bottom: 1rem;
  flex-grow: 1;
}

.view-button {
  background-color: var(--primary);
}

.edit-button {
  background-color: var(--secondary);
}

.delete-button {
  background-color: var(--accent);
}

.error-message {
  color: var(--accent);
  text-align: center;
  margin-top: 1rem;
  font-weight: bold;
}
</style>