<template>
  <div class="container">
    <h2>Cadastrar Novo Curso</h2>
    <form @submit.prevent="handleSubmit">
      <fieldset>
        <legend>Detalhes do Curso</legend>
        <div class="form-group">
          <label for="courseTitle">Título do Curso: <span class="required">*</span></label>
          <input type="text" id="courseTitle" v-model="courseTitle" required />
        </div>

        <div class="form-group">
          <label for="courseDescription">Descrição do Curso: <span class="required">*</span></label>
          <textarea id="courseDescription" v-model="courseDescription" required></textarea>
        </div>

        <div class="form-group">
          <label for="courseDurationHours">Duração do Curso (em horas):</label>
          <input type="number" id="courseDurationHours" v-model.number="courseDurationHours" placeholder="Ex: 40" min="0" />
        </div>
      </fieldset>

      <fieldset class="video-fieldset">
        <legend>Vídeo de Apresentação (Opcional)</legend>
        <div class="form-group">
          <label for="videoFile">Arquivo de Vídeo (.mp4):</label>
          <input type="file" id="videoFile" @change="handleFileUpload" accept=".mp4" />
          <small v-if="videoFile && videoFile.name" class="file-name-display">Arquivo selecionado: {{ videoFile.name }}</small>
        </div>

        <template v-if="videoFile">
          <div class="form-group">
            <label for="videoName">Nome do Vídeo: <span class="required">*</span></label>
            <input type="text" id="videoName" v-model="videoName" required />
          </div>

          <div class="form-group">
            <label for="videoDescription">Descrição do Vídeo:</label>
            <textarea id="videoDescription" v-model="videoDescription"></textarea>
          </div>
        </template>
      </fieldset>

      <button type="submit" class="btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Salvando...' : 'Salvar Curso e Vídeo (se selecionado)' }}
      </button>

      <p v-if="message" :class="['message', messageType]">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// import { useRouter } from 'vue-router'; // Descomente se precisar de redirecionamento

// --- Refs para os detalhes do Curso ---
const courseTitle = ref('');
const courseDescription = ref('');
const courseDurationHours = ref(null);

// --- Refs para os detalhes do Vídeo ---
const videoFile = ref(null);
const videoName = ref('');
const videoDescription = ref('');

// --- Estado do Componente ---
const isLoading = ref(false);
const message = ref('');
const messageType = ref(''); // 'success' ou 'error'

// const router = useRouter(); // Descomente se precisar de redirecionamento

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.type === 'video/mp4') {
      videoFile.value = file;
      message.value = ''; // Limpa mensagens de erro de arquivo inválido
      messageType.value = '';
    } else {
      videoFile.value = null;
      event.target.value = null; // Limpa o input de arquivo
      message.value = 'Formato de arquivo inválido. Por favor, selecione um arquivo .mp4.';
      messageType.value = 'error';
    }
  } else {
    videoFile.value = null;
  }
};

const handleSubmit = async () => {
  // Validação básica dos dados do curso
  if (!courseTitle.value.trim() || !courseDescription.value.trim()) {
    message.value = 'Título do Curso e Descrição do Curso são obrigatórios.';
    messageType.value = 'error';
    return;
  }

  // Validação dos dados do vídeo (se um arquivo de vídeo foi selecionado)
  if (videoFile.value && !videoName.value.trim()) {
    message.value = 'O Nome do Vídeo é obrigatório se um arquivo de vídeo for selecionado.';
    messageType.value = 'error';
    return;
  }

  isLoading.value = true;
  message.value = '';
  messageType.value = '';

  const token = sessionStorage.getItem('authToken'); // Ou de onde você armazena o token

  if (!token) {
    message.value = 'Erro de autenticação: Token não encontrado.';
    messageType.value = 'error';
    isLoading.value = false;
    return;
  }

  // --- ETAPA 1: Criar o Curso ---
  const coursePayload = {
    title: courseTitle.value,
    description: courseDescription.value,
  };
  if (courseDurationHours.value !== null && courseDurationHours.value !== '' && !isNaN(parseFloat(courseDurationHours.value)) && isFinite(courseDurationHours.value)) {
    coursePayload.durationHours = Number(courseDurationHours.value);
  }

  let createdCourseId = null;

  try {
    const courseResponse = await fetch('http://localhost:3000/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(coursePayload),
    });

    const courseResponseData = await courseResponse.json();

    if (!courseResponse.ok) {
      // Tratar erro na criação do curso
      message.value = `Erro ao criar curso (${courseResponse.status}): ${courseResponseData.message || 'Falha ao processar a requisição.'}`;
      messageType.value = 'error';
      isLoading.value = false;
      return;
    }

    // Sucesso na criação do curso, obter o ID.
    // Ajuste isso conforme a estrutura da sua resposta. Ex: responseData.data.id, responseData.course.id etc.
    createdCourseId = courseResponseData.id || (courseResponseData.data && courseResponseData.data.id);

    if (!createdCourseId) {
      console.error("ID do curso não encontrado na resposta:", courseResponseData);
      message.value = 'Curso criado, mas ID não retornado. Não é possível enviar o vídeo.';
      messageType.value = 'error'; // Ou 'warning'
      isLoading.value = false;
      // Limpar campos do curso aqui, pois ele foi criado
      resetCourseFormFields();
      return;
    }

    message.value = `Curso "${courseTitle.value}" criado com sucesso (ID: ${createdCourseId}).`;
    messageType.value = 'success';

    // --- ETAPA 2: Upload do Vídeo (se houver vídeo e ID do curso) ---
    if (videoFile.value && createdCourseId) {
      message.value += ' Enviando vídeo...'; // Atualiza mensagem para o usuário

      const videoFormData = new FormData();
      videoFormData.append('courseId', createdCourseId);
      videoFormData.append('name', videoName.value);
      if (videoDescription.value.trim()) {
        videoFormData.append('description', videoDescription.value);
      }
      videoFormData.append('video', videoFile.value); // 'video' é o nome do campo esperado pelo backend

      const videoResponse = await fetch('http://localhost:3000/courseVideos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type' não é definido manualmente para FormData, o browser faz isso.
        },
        body: videoFormData,
      });

      const videoResponseData = await videoResponse.json();

      if (!videoResponse.ok) {
        message.value = `Curso criado (ID: ${createdCourseId}), mas falha ao enviar vídeo (${videoResponse.status}): ${videoResponseData.message || 'Erro desconhecido.'}`;
        messageType.value = 'error'; // Mantém o erro, mas informa que o curso foi criado
      } else {
        message.value = `Curso (ID: ${createdCourseId}) e vídeo enviados com sucesso! ${videoResponseData.message || ''}`;
        messageType.value = 'success';
        resetVideoFormFields(); // Limpa campos do vídeo
      }
    } else if (videoFile.value && !createdCourseId) {
      // Este caso já foi tratado acima, mas é bom ter clareza
      message.value = `Curso criado, mas houve um problema ao obter o ID para enviar o vídeo.`;
      messageType.value = 'error';
    }


    // Limpar formulário do curso após sucesso total ou parcial (curso criado)
    resetCourseFormFields();


  } catch (error) {
    console.error('Erro no processo de submissão:', error);
    message.value = `Erro inesperado: ${error.message}`;
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const resetCourseFormFields = () => {
  courseTitle.value = '';
  courseDescription.value = '';
  courseDurationHours.value = null;
};

const resetVideoFormFields = () => {
  const fileInput = document.getElementById('videoFile');
  if (fileInput) fileInput.value = null; // Reseta o input de arquivo
  videoFile.value = null;
  videoName.value = '';
  videoDescription.value = '';
};

</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 700px;
  margin: 2rem auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

fieldset {
  border: 1px solid #ddd;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 5px;
}

fieldset.video-fieldset {
  border-color: #cce5ff; /* Uma cor diferente para destacar */
}

legend {
  padding: 0 0.5em;
  font-weight: bold;
  color: #555;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="file"],
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input[type="file"] {
  padding: 0.5rem;
}

.file-name-display {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}


.required {
  color: #d9534f; /* Vermelho para campos obrigatórios */
}

.btn-primary {
  display: block;
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  background-color: #007bff; /* Azul primário */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background-color: #0056b3;
}

.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  font-size: 0.95rem;
  line-height: 1.4;
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
</style>