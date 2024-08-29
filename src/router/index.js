import { createRouter, createWebHistory } from 'vue-router'
import { isExpired } from '@/api/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/introduction/IntroductionPage.vue'),
      redirect: '/solutions',
      children: [
        {
          path: '/solutions',
          component: () =>
            import('@/views/introduction/components/SolutionsPage.vue')
        },
        {
          path: '/aboutus',
          component: () =>
            import('@/views/introduction/components/AboutUsPage.vue')
        },
        {
          path: '/competitor',
          component: () =>
            import('@/views/introduction/components/CompetitorPage.vue')
        },
        {
          path: '/benefits',
          component: () =>
            import('@/views/introduction/components/BenefitsPage.vue')
        }
      ]
    },
    {
      path: '/loginPage',
      component: () => import('@/views/login/loginPage.vue'),
      redirect: '/login',
      children: [
        {
          path: '/login',
          component: () => import('@/views/login/components/loginDetail.vue')
        },
        {
          path: '/forget',
          component: () => import('@/views/login/components/forgetPage.vue')
        },
        {
          path: '/reset',
          component: () => import('@/views/login/components/resetPwd.vue')
        }
      ]
    },
    {
      path: '/system',
      component: () => import('@/views/system/systemPage.vue'),
      meta: { isAuth: true },
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/dashboard/dashboardPage.vue')
        },
        {
          path: '/project',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/project/projectPage.vue')
        },
        {
          path: '/allproduct',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/allproduct/allproductPage.vue')
        },
        {
          path: '/inventory',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/inventory/inventoryPage.vue')
        },
        {
          path: '/order',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/order/orderPage.vue')
        },
        {
          path: '/rule',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/chart/chartPage.vue')
        },
        {
          path: '/report',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/report/reportPage.vue')
        },
        {
          path: '/account',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/account/accountPage.vue')
        },
        {
          path: '/customer',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/customer/customerPage.vue')
        },
        {
          path: '/media',
          meta: { isAuth: true },
          component: () =>
            import('@/views/system/components/media/mediaPage.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  //如果路由需要跳转
  if (to.meta.isAuth) {
    //判断 如果school本地存储是qinghuadaxue的时候，可以进去
    if (!localStorage.getItem('login')) {
      next({ path: '/login' })
    } else {
      try {
        await isExpired()
      } catch (err) {
        localStorage.removeItem('login')
        next({ path: '/login' })
      }
    }
  }
  // 否则，放行
  next()
})
export default router
