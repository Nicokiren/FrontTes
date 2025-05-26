<template>
  <div class="container">
    <h2>Criar Novo Curso</h2>
    <form @submit.prevent="createCourse">
      <div class="form-group">
        <label for="name">Nome do Curso:</label>
        <input type="text" id="name" v-model="course.name" required />
      </div>
      <div class="form-group">
        <label for="description">Descrição:</label>
        <textarea id="description" v-model="course.description" required></textarea>
      </div>
      <button type="submit" class="btn-primary" :disabled="courseStore.isLoading">
        {{ courseStore.isLoading ? 'Criando...' : 'Salvar Curso' }}
      </button>
      <p v-if="courseStore.error" class="error-message">{{ courseStore.error }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { useCourseStore } from "@/stores/course_store";
import { useRouter } from "vue-router";

export default {
  setup() {
    const courseStore = useCourseStore();
    const router = useRouter();

    const course = ref({
      name: "",
      description: "",
    });

    const createCourse = async () => {
      const result = await courseStore.createCourse(course.value);
      if (result.success) {
        alert("Curso criado com sucesso!");
        router.push("/courses");
      } else {
        alert(`Erro: ${result.message}`);
      }
    };

    return {
      course,
      courseStore,
      createCourse,
    };
  },
};
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 600px;
}

h2 {
  text-align: center;
  color: var(--dark);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--dark);
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.btn-primary {
  width: auto;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
}

.error-message {
  color: var(--accent);
  margin-top: 1rem;
  text-align: center;
  font-weight: bold;
}
</style>