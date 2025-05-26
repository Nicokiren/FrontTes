// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth_store"; //

import CourseList from "@/components/CourseList.vue";
import CourseCreate from "@/components/CourseCreate.vue";
import CourseEdit from "@/components/CourseEdit.vue";
import CourseDetail from "@/components/CourseDetail.vue";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/courses",
    name: "courses",
    component: CourseList,
    meta: { requiresAuth: true },
  },
  {
    path: "/courses/create",
    name: "create-course",
    component: CourseCreate,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/courses/edit/:id",
    name: "edit-course",
    component: CourseEdit,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/courses/:id",
    name: "course-detail",
    component: CourseDetail,
    props: true,
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initAuth(); // Initialize auth state

  const requiresAuth = to.meta.requiresAuth;
  const requiresAdmin = to.meta.requiresAdmin;

  if (requiresAuth && !authStore.isLoggedIn) {
    next("/login");
  } else if (requiresAdmin && !authStore.isAdmin) {
    alert("Você não tem permissão para acessar esta página.");
    next("/courses");
  } else {
    next();
  }
});

export default router;