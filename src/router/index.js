import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import PoseView from "../views/PoseView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/pose",
      name: "pose",
      component: PoseView,
    },
  ],
});

export default router;
