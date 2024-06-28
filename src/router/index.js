import Vue from "vue";
import VueRouter from "vue-router";
import { store } from "@/store";

Vue.use(VueRouter);

const routes = [
  {
    // =============================================================================
    // MAIN LAYOUT ROUTES
    // =============================================================================
    path: "",
    component: () => import("@/layouts/main/Main.vue"),
    children: [
      {
        path: "/",
        redirect: "/venue",
      },
      {
        path: "/venue",
        name: "venue",
        component: () =>
          import(/* webpackChunkName: "venue" */ "../views/VenueSettings.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/venue-builder",
        name: "venue-builder",
        component: () =>
          import(/* webpackChunkName: "venue" */ "../views/VenueBuilder.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/edit-venue-builder/:id",
        name: "edit-venue",
        component: () =>
          import(/* webpackChunkName: "venue" */ "../views/EditVenue.vue"),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    // =============================================================================
    // FULL PAGE LAYOUT ROUTES
    // =============================================================================
    path: "",
    component: () => import("@/layouts/full-page/FullPage.vue"),

    children: [
      {
        path: "/login",
        name: "login",
        component: () =>
          import(/* webpackChunkName: "login" */ "../views/Login.vue"),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: "/not-found",
        name: "not-found",
        component: () =>
          import(/* webpackChunkName: "not-found" */ "../views/Error404.vue"),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: "*",
        name: "not-found",
        component: () =>
          import(/* webpackChunkName: "not-found" */ "../views/Error404.vue"),
        meta: {
          requiresAuth: false,
        },
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  setTimeout(() => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const hasAdmin = localStorage.getItem('admin');
    if (requiresAuth && !hasAdmin) {
      return next("/login");
    }
    return next();
  }, 200)
});

export default router;
