<template>
  <div class="container">
    <h2>Editar Curso</h2>
    <div v-if="courseStore.isLoading">Carregando curso...</div>
    <div v-else-if="courseStore.error" class="error-message">
      {{ courseStore.error }}
    </div>
    <form v-else @submit.prevent="updateCourse">
      <div class="form-group">
        <label for="name">Nome do Curso:</label>
        <input type="text" id="name" v-model="course.name" required />
      </div>
      <div class="form-group">
        <label for="description">Descrição:</label>
        <textarea id="description" v-model="course.description" required></textarea>
      </div>
      <button type="submit" class="btn-primary" :disabled="courseStore.isLoading">
        {{ courseStore.isLoading ? 'Atualizando...' : 'Atualizar Curso' }}
      </button>

      <h3>Vídeos do Curso</h3>
      <button @click="addVideo" class="btn-primary add-video-btn" type="button">Adicionar Vídeo</button>

      <ul class="video-list">
        <li v-for="(video, index) in course.videos" :key="video.id || index" class="video-item">
          <div class="video-inputs">
            <div class="form-group">
              <label :for="`video-name-${index}`">Nome do Vídeo:</label>
              <input type="text" :id="`video-name-${index}`" v-model="video.name" required />
            </div>
            <div class="form-group">
              <label :for="`video-description-${index}`">Descrição do Vídeo:</label>
              <textarea :id="`video-description-${index}`" v-model="video.description" required></textarea>
            </div>
            <div class="form-group">
              <label :for="`video-url-${index}`">URL do Vídeo (Ex: /uploads/video.mp4):</label>
              <input type="text" :id="`video-url-${index}`" v-model="video.url" required />
            </div>
          </div>
          <div class="video-actions">
            <button @click="saveVideo(course.id, video, index)" class="btn-primary save-video-btn" type="button">Salvar Vídeo</button>
            <button @click="deleteVideo(course.id, video.id, index)" class="btn-primary delete-video-btn" type="button">Deletar Vídeo</button>
          </div>
        </li>
      </ul>
      <p v-if="courseStore.error" class="error-message">{{ courseStore.error }}</p>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCourseStore } from "@/stores/course_store";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const courseStore = useCourseStore();

    const course = ref({
      name: "",
      description: "",
      videos: [],
    });

    const courseId = route.params.id;

    onMounted(async () => {
      if (courseId) {
        await courseStore.fetchCourseById(courseId);
        if (courseStore.currentCourse) {
          course.value = { ...courseStore.currentCourse };
          if (!course.value.videos) {
            course.value.videos = [];
          }
        } else {
          router.push("/courses");
        }
      }
    });

    watch(
      () => courseStore.currentCourse,
      (newCourse) => {
        if (newCourse) {
          course.value = { ...newCourse };
          if (!course.value.videos) {
            course.value.videos = [];
          }
        }
      },
      { deep: true }
    );

    const updateCourse = async () => {
      const result = await courseStore.updateCourse(courseId, {
        name: course.value.name,
        description: course.value.description,
      });
      if (result.success) {
        alert("Curso atualizado com sucesso!");
      } else {
        alert(`Erro: ${result.message}`);
      }
    };

    const addVideo = () => {
      course.value.videos.push({
        name: "",
        description: "",
        url: "",
        isNew: true,
      });
    };

    const saveVideo = async (courseId, video, index) => {
      if (!video.name || !video.description || !video.url) {
        alert("Por favor, preencha todos os campos do vídeo.");
        return;
      }

      if (video.isNew) {
        const result = await courseStore.addVideoToCourse(courseId, {
          name: video.name,
          description: video.description,
          url: video.url,
        });
        if (result.success) {
          alert("Vídeo adicionado com sucesso!");
          course.value.videos[index] = { ...result.data, isNew: false };
        } else {
          alert(`Erro ao adicionar vídeo: ${result.message}`);
        }
      } else {
        const result = await courseStore.updateCourseVideo(
          courseId,
          video.id,
          {
            name: video.name,
            description: video.description,
            url: video.url,
          }
        );
        if (result.success) {
          alert("Vídeo atualizado com sucesso!");
        } else {
          alert(`Erro ao atualizar vídeo: ${result.message}`);
        }
      }
    };

    const deleteVideo = async (courseId, videoId, index) => {
      if (!videoId) {
        course.value.videos.splice(index, 1);
        alert("Vídeo removido da lista (não estava salvo).");
        return;
      }

      if (confirm("Tem certeza que deseja deletar este vídeo?")) {
        const result = await courseStore.deleteCourseVideo(courseId, videoId);
        if (result.success) {
          alert("Vídeo deletado com sucesso!");
        } else {
          alert(`Erro ao deletar vídeo: ${result.message}`);
        }
      }
    };

    return {
      course,
      courseStore,
      updateCourse,
      addVideo,
      saveVideo,
      deleteVideo,
    };
  },
};
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 800px;
}

h2, h3 {
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
  min-height: 80px;
  resize: vertical;
}

.btn-primary {
  margin-top: 1rem;
  margin-right: 1rem;
}

.add-video-btn {
  background-color: var(--secondary);
  margin-bottom: 1.5rem;
}

.video-list {
  list-style: none;
  padding: 0;
}

.video-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-inputs {
  flex-grow: 1;
}

.video-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.save-video-btn {
  background-color: var(--primary);
  width: auto;
}

.delete-video-btn {
  background-color: var(--accent);
  width: auto;
}

.error-message {
  color: var(--accent);
  margin-top: 1rem;
  text-align: center;
  font-weight: bold;
}
</style>