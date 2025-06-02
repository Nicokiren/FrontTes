<template>
  <div class="container">
    <h2>Editar Curso</h2>
    <div v-if="isLoadingCourseData" class="loading-message">A carregar dados do curso...</div>
    <div v-else-if="courseLoadError" class="error-message" @click="courseLoadError = ''">{{ courseLoadError }}</div>

    <form v-else-if="course" @submit.prevent="handleUpdateCourseDetails">
      <fieldset>
        <legend>Detalhes do Curso</legend>
        <div class="form-group">
          <label for="courseTitle">Título do Curso: <span class="required">*</span></label>
          <input type="text" id="courseTitle" v-model="course.title" required />
        </div>
        <div class="form-group">
          <label for="courseDescription">Descrição do Curso: <span class="required">*</span></label>
          <textarea id="courseDescription" v-model="course.description" required></textarea>
        </div>
        <div class="form-group">
          <label for="courseDurationHours">Duração do Curso (em horas):</label>
          <input type="number" id="courseDurationHours" v-model.number="course.durationHours" placeholder="Ex: 40" min="0" />
        </div>
        <button type="submit" class="btn-primary" :disabled="isSubmittingCourse">
          {{ isSubmittingCourse ? 'A atualizar Detalhes...' : 'Guardar Alterações do Curso' }}
        </button>
      </fieldset>
    </form>
    <hr v-if="course" />

    <div v-if="course" class="videos-section">
      <h3>Vídeos do Curso</h3>
      <div class="controls-centered">
        <button @click="addNewVideoField" class="btn-secondary add-video-btn" type="button">
          Adicionar Novo Vídeo
        </button>
      </div>

      <div v-if="videosLoadError" class="error-message" @click="videosLoadError = ''">{{ videosLoadError }}</div>

      <ul class="video-list">
        <li v-for="(video, index) in editableVideos" :key="video.internalId" class="video-item">
          <h4>{{ video.isNew ? 'Novo Vídeo (Ainda não guardado)' : `Vídeo: ${video.name || 'Sem nome'}` }}</h4>
          <form @submit.prevent="handleSaveVideo(video, index)">
            <div class="form-group">
              <label :for="`video-name-${index}`">Nome do Vídeo: <span class="required">*</span></label>
              <input type="text" :id="`video-name-${index}`" v-model="video.name" required />
            </div>
            <div class="form-group">
              <label :for="`video-description-${index}`">Descrição do Vídeo:</label>
              <textarea :id="`video-description-${index}`" v-model="video.description"></textarea>
            </div>

            <div class="form-group" v-if="video.isNew">
              <label :for="`video-file-${index}`">Ficheiro de Vídeo (.mp4): <span class="required">*</span></label>
              <input type="file" :id="`video-file-${index}`" @change="event => handleVideoFileSelection(event, index)" accept=".mp4" required/>
              <small v-if="video.file && video.file.name" class="file-name-display">Selecionado: {{ video.file.name }}</small>
            </div>
            <div class="form-group" v-if="!video.isNew && video.url">
              <p>Vídeo atual: <a :href="getVideoFullUrl(video.url)" target="_blank" rel="noopener noreferrer">{{ video.url.substring(video.url.lastIndexOf('/') + 1) || video.url }}</a></p>
            </div>

            <div class="video-actions">
              <button type="button" @click="handleDeleteVideo(video, index)" class="btn-danger delete-video-btn" :disabled="isSubmittingVideo[video.internalId]">
                {{ video.isNew ? 'Cancelar Novo' : 'Eliminar Vídeo' }}
              </button>
              <button type="submit" class="btn-primary save-video-btn" :disabled="isSubmittingVideo[video.internalId] || (video.isNew && !video.file)">
                {{ isSubmittingVideo[video.internalId] ? 'A guardar...' : (video.isNew ? 'Guardar Novo Vídeo' : 'Guardar Alterações') }}
              </button>
            </div>
          </form>
        </li>
        <p v-if="editableVideos.length === 0 && !isLoadingCourseData && !courseLoadError">Nenhum vídeo registado para este curso.</p>
      </ul>
    </div>
    <div v-if="generalMessage" :class="['message', generalMessageType]" @click="clearGeneralMessage">{{ generalMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router"; // useRouter não está a ser usado, pode remover se não for redirecionar
import { useCourseStore } from "@/stores/course_store";

const route = useRoute();
// const router = useRouter(); // Declarado mas não usado
const courseStore = useCourseStore();

const course = ref(null);
const editableVideos = ref([]);
const isLoadingCourseData = ref(true);
const courseLoadError = ref('');
const videosLoadError = ref('');
const isSubmittingCourse = ref(false);
const isSubmittingVideo = reactive({});
const generalMessage = ref('');
const generalMessageType = ref('');

const courseId = route.params.id;

const generateInternalId = () => `internal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getVideoFullUrl = (relativePath) => {
  if (!relativePath) return '#';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${API_BASE_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};

onMounted(async () => {
  if (courseId) {
    isLoadingCourseData.value = true;
    courseLoadError.value = '';
    try {
      const result = await courseStore.fetchCourseById(courseId);
      if (result && result.success && courseStore.currentCourse) {
        course.value = JSON.parse(JSON.stringify(courseStore.currentCourse));
        editableVideos.value = (course.value.videos || []).map(v => ({
          ...v,
          file: null,
          isNew: false,
          internalId: v.id || generateInternalId()
        }));
      } else {
        courseLoadError.value = result?.message || "Curso não encontrado ou falha ao carregar.";
        course.value = null;
      }
    } catch (error) {
      console.error("Erro ao buscar curso no onMounted:", error);
      courseLoadError.value = `Erro ao carregar curso: ${error.message || 'Erro desconhecido.'}`;
      course.value = null;
    } finally {
      isLoadingCourseData.value = false;
    }
  } else {
    courseLoadError.value = "ID do curso não foi fornecido na rota.";
  }
});

const handleUpdateCourseDetails = async () => {
  if (!course.value) return;
  isSubmittingCourse.value = true;
  clearGeneralMessage();

  const payload = {
    title: course.value.title,
    description: course.value.description,
    durationHours: (course.value.durationHours !== null && course.value.durationHours !== '' && !isNaN(parseFloat(course.value.durationHours)))
        ? Number(course.value.durationHours)
        : undefined,
  };

  try {
    const result = await courseStore.updateCourse(courseId, payload); // Token gerido no store
    if (result && result.success) {
      showGeneralMessage("Detalhes do curso atualizados com sucesso!", 'success');
      if (result.data && course.value) {
        const currentEditableVideos = editableVideos.value;
        course.value = { ...course.value, ...result.data };
        if (!result.data.videos) {
          editableVideos.value = currentEditableVideos;
        } else {
          editableVideos.value = (result.data.videos || []).map(v => ({
            ...v, file: null, isNew: false, internalId: v.id || generateInternalId()
          }));
        }
      }
    } else {
      showGeneralMessage(`Erro ao atualizar curso: ${result?.message || 'Erro desconhecido.'}`, 'error');
    }
  } catch (error) {
    console.error("Erro ao atualizar detalhes do curso:", error);
    showGeneralMessage(`Erro na requisição: ${error.message || 'Falha desconhecida.'}`, 'error');
  } finally {
    isSubmittingCourse.value = false;
  }
};

const addNewVideoField = () => {
  editableVideos.value.push({
    internalId: generateInternalId(),
    name: "",
    description: "",
    url: "",
    file: null,
    isNew: true,
  });
};

const handleVideoFileSelection = (event, index) => {
  const file = event.target.files[0];
  const videoItem = editableVideos.value[index];
  if (file && file.type === "video/mp4") {
    videoItem.file = file;
    clearGeneralMessage();
  } else if (file) {
    videoItem.file = null;
    showGeneralMessage("Por favor, selecione um ficheiro .mp4.", 'error');
    event.target.value = null;
  } else {
    videoItem.file = null;
  }
};

const handleSaveVideo = async (videoData, index) => {
  if (!videoData.name.trim()) {
    showGeneralMessage("O nome do vídeo é obrigatório.", 'error');
    return;
  }

  if (videoData.isNew && !videoData.file) {
    showGeneralMessage("Por favor, selecione um ficheiro de vídeo .mp4 para um novo vídeo.", 'error');
    return;
  }

  isSubmittingVideo[videoData.internalId] = true;
  clearGeneralMessage();

  try {
    let result;
    if (videoData.isNew) {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('name', videoData.name);
      formData.append('description', videoData.description || '');
      formData.append('video', videoData.file);

      result = await courseStore.addVideoWithUpload(courseId, formData); // Token gerido no store
      if (result && result.success && result.data) {
        editableVideos.value[index] = {
          ...result.data,
          file: null,
          isNew: false,
          internalId: result.data.id
        };
        showGeneralMessage("Novo vídeo adicionado com sucesso!", 'success');
      } else {
        showGeneralMessage(`Erro ao adicionar novo vídeo: ${result?.message || 'Falha na operação.'}`, 'error');
      }
    } else {
      // Atualizar Metadados de Vídeo Existente
      const metadataPayload = {
        name: videoData.name,
        description: videoData.description || '',
      };
      result = await courseStore.updateVideoMetadata(videoData.id, metadataPayload); // Token gerido no store
      if (result && result.success) {
        if(result.data) {
          editableVideos.value[index] = { ...editableVideos.value[index], ...result.data, file: null, isNew: false };
        }
        showGeneralMessage("Alterações nos dados do vídeo guardadas com sucesso!", 'success');
      } else {
        showGeneralMessage(`Erro ao atualizar dados do vídeo: ${result?.message || 'Falha na operação.'}`, 'error');
      }
    }
  } catch (error) {
    console.error("Erro ao guardar vídeo:", error);
    showGeneralMessage(`Erro na requisição ao guardar vídeo: ${error.message || 'Falha desconhecida.'}`, 'error');
  } finally {
    isSubmittingVideo[videoData.internalId] = false;
  }
};

const handleDeleteVideo = async (videoData, index) => {
  if (videoData.isNew) {
    editableVideos.value.splice(index, 1);
    showGeneralMessage("Adição de novo vídeo cancelada.", 'success');
    return;
  }

  if (!videoData.id) {
    console.warn("Tentativa de eliminar vídeo sem ID.", videoData);
    showGeneralMessage("Não é possível eliminar: ID do vídeo ausente.", 'error');
    return;
  }

  if (confirm(`Tem certeza que deseja eliminar o vídeo "${videoData.name}"? Esta ação não pode ser desfeita.`)) {
    isSubmittingVideo[videoData.internalId] = true;
    clearGeneralMessage();
    try {
      // A action no store agora espera apenas videoId (token é gerido no store)
      const result = await courseStore.deleteCourseVideo(videoData.id);
      if (result && result.success) {
        editableVideos.value.splice(index, 1);
        showGeneralMessage("Vídeo eliminado com sucesso!", 'success');
      } else {
        showGeneralMessage(`Erro ao eliminar vídeo: ${result?.message || 'Falha na operação.'}`, 'error');
      }
    } catch (error) {
      console.error("Erro ao eliminar vídeo:", error);
      showGeneralMessage(`Erro na requisição ao eliminar vídeo: ${error.message || 'Falha desconhecida.'}`, 'error');
    } finally {
      isSubmittingVideo[videoData.internalId] = false;
    }
  }
};

const showGeneralMessage = (msg, type) => {
  generalMessage.value = msg;
  generalMessageType.value = type;
};

const clearGeneralMessage = () => {
  generalMessage.value = '';
  generalMessageType.value = '';
};

watch(generalMessage, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      clearGeneralMessage();
    }, 7000);
  }
});

</script>

<style scoped>
/* Estilos da versão anterior foram mantidos e levemente ajustados. Adapte conforme seu tema. */
.container {
  padding: 2rem;
  max-width: 800px;
  margin: 1rem auto;
  font-family: sans-serif;
}

h2, h3, h4 {
  color: #333;
  margin-bottom: 1rem;
}
h2 { text-align: center; margin-bottom: 2rem; font-size: 1.8em; }
h3 { margin-top: 2.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.75rem; font-size: 1.4em;}
h4 { font-size: 1.1em; color: #444; margin-top: 0; margin-bottom: 1.5rem; background-color:#f0f0f0; padding: 0.5rem; border-radius: 4px;}

fieldset {
  border: 1px solid #ddd;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 5px;
}
legend {
  padding: 0 0.5em;
  font-weight: bold;
  color: #555;
  font-size: 1.1em;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.95em;
  color: #555;
}
.form-group label .required {
  color: #d9534f;
  font-weight: bold;
}


.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="file"],
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out;
}
.form-group input:focus, .form-group textarea:focus {
  border-color: #007bff; /* Cor de destaque ao focar */
  outline: none;
}


.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input[type="file"] {
  padding: 0.5rem;
}

.file-name-display {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #555;
  background-color: #e9ecef; /* Fundo leve para o nome do ficheiro */
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  display: inline-block;
}

.form-group p {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}
.form-group p a {
  color: #007bff; /* Cor primária para links */
  text-decoration: none;
}
.form-group p a:hover {
  text-decoration: underline;
}


.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.3rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  margin-right: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.btn-primary:disabled, .btn-secondary:disabled, .btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary { background-color: #007bff; color: white; } /* Azul primário */
.btn-primary:hover:not(:disabled) { background-color: #0056b3; }

.btn-secondary { background-color: #6c757d; color: white; } /* Cinza secundário */
.btn-secondary:hover:not(:disabled) { background-color: #545b62; }

.btn-danger { background-color: #dc3545; color: white; } /* Vermelho perigo */
.btn-danger:hover:not(:disabled) { background-color: #b02a37; }

.controls-centered {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.add-video-btn {
  margin-right: 0;
}

.videos-section {
  margin-top: 2.5rem;
}

.video-list {
  list-style: none;
  padding: 0;
}

.video-item {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.video-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #eee;
}
.video-actions .btn-primary, .video-actions .btn-danger {
  min-width: 120px;
  text-align: center;
}


.loading-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2em;
  color: #555;
}
.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  cursor: pointer;
}

.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  font-size: 0.95rem;
  line-height: 1.4;
  cursor: pointer;
}
.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>
