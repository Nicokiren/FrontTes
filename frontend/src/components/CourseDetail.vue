<template>
  <div class="container">
    <div v-if="courseStore.isLoading">Carregando curso...</div>
    <div v-else-if="courseStore.error" class="error-message">
      {{ courseStore.error }}
    </div>
    <div v-else-if="course">
      <h2>{{ course.name }}</h2>
      <p class="course-description">{{ course.description }}</p>

      <h3>Conteúdo do Curso</h3>
      <div v-if="course.videos && course.videos.length > 0">
        <div v-for="video in course.videos" :key="video.id" class="video-section">
          <h4>{{ video.name }}</h4>
          <p>{{ video.description }}</p>
          <div class="video-wrapper">
            <video controls :src="`http://localhost:3000${video.video}`" class="course-video">
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
        </div>
      </div>
      <p v-else>Este curso ainda não possui vídeos.</p>
    </div>
    <div v-else class="not-found">
      <p>Curso não encontrado.</p>
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { useCourseStore } from "@/stores/course_store";
import { onMounted, computed } from "vue";

export default {
  setup() {
    const route = useRoute();
    const courseStore = useCourseStore();

    const courseId = route.params.id;

    onMounted(() => {
      if (courseId) {
        courseStore.fetchCourseById(courseId);
      }
    });

    const course = computed(() => courseStore.getCurrentCourse);

    return {
      courseStore,
      course,
    };
  },
};
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 900px;
}

h2 {
  color: var(--primary);
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2.8rem;
}

.course-description {
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  color: var(--dark);
}

h3 {
  color: var(--dark);
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 2rem;
}

.video-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.video-section h4 {
  color: var(--secondary);
  margin-bottom: 1rem;
  font-size: 1.8rem;
  text-align: center;
}

.video-section p {
  color: var(--dark);
  margin-bottom: 1.5rem;
  text-align: center;
}

.video-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  background-color: black;
}

.course-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.error-message, .not-found {
  color: var(--accent);
  text-align: center;
  margin-top: 2rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  h2 {
    font-size: 2.2rem;
  }
  h3 {
    font-size: 1.6rem;
  }
  .video-section h4 {
    font-size: 1.4rem;
  }
}
</style>