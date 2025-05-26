<template>
  <div class="container home-page">
    <h1>Bem-vindo ao Learn FDD!</h1>
    <p>Aprenda Feature Driven Development e transforme sua equipe de desenvolvimento.</p>
    <router-link to="/courses" class="btn-primary">Ver Cursos</router-link>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-page {
  text-align: center;
  padding-top: 5rem;
}

.home-page h1 {
  font-size: 3.5rem;
  color: var(--dark);
  margin-bottom: 1.5rem;
}

.home-page p {
  font-size: 1.3rem;
  color: var(--dark);
  margin-bottom: 2.5rem;
}
</style>