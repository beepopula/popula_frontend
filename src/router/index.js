import {
  createRouter,
  createWebHistory,
} from "vue-router";
// import * as init from "@/utils/init.js"
import store from "@/store/index.js"

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/',
    component: () => import("../layout/index.vue"),
    children: [
      {
        path: "/",
        name: "home",
        component: () => import("../views/index.vue"),
      },
      {
        path: "/communities",
        name: "communities",
        component: () => import("../views/communities.vue"),
      },
      {
        path: "/community-detail/:id",
        name: "communityDetail",
        component: () => import("../views/community-detail.vue"),
      },
      {
        path: "/explore",
        name: "explore",
        component: () => import("../views/explore.vue"),
      },
      {
        path: "/detail/:id",
        name: "detail",
        component: () => import("../views/post-detail.vue"),
      },
      {
        path: "/search",
        name: "search",
        component: () => import("../views/search.vue"),
      },
      {
        path: "/mine",
        name: "profile",
        component: () => import("../views/user-profile.vue"),
        meta:{
          requireAuth:true,
          redirectPage:'home',
        }
      },
      {
        path: "/user-profile/:id",
        name: "UserProfile",
        component: () => import("../views/user-profile.vue"),
      },
      // {
      //   path: "/notice",
      //   name: "notice",
      //   component: () => import("../views/notice.vue"),
      //   meta:{
      //     requireAuth:true,
      //     redirectPage:'home',
      //   }
      // },
      // {
      //   path: "/user-profile-edit",
      //   name: "UserProfileEdit",
      //   component: () => import("../views/user-profile-edit.vue"),
      //   meta:{
      //     requireAuth:true,
      //     redirectPage:'home',
      //   }
      // },
    ],
  },
];

const  scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition && to.meta.keepAlive) {
    return savedPosition;
  }
  return { left: 0, top:0 };
}
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior
});

export default router;

router.beforeEach((to, from, next) => {
  document.getElementsByTagName('body')[0].classList.remove("fixed");
  if (to.meta.requireAuth) { 
    if(store.getters.isLogin){ 
      next();
    }else {
      if(to.name == 'UserProfile' && to.query.id){
        next();
      }else{
        next({ name: 'home'})
      }
    }
  }else {
    next();
  }
});
