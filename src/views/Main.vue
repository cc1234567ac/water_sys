<template>
  <div class="home">
    <app-header></app-header>
    <div class="app-content">
      <div class="app-nav">
        <app-nav></app-nav>
      </div>
      <div class="app-wrap">
        <!-- 此处放置el-tabs代码 -->
        <div class="template-tabs">
          <el-tabs
            v-model="activeIndex"
            type="border-card"
            closable
            @tab-click="tabClick"
            v-if="options.length"
            @tab-remove="tabRemove"
          >
            <el-tab-pane
              :key="index+item.name"
              v-for="(item, index) in options"
              :label="item.name"
              :name="item.route"
            ></el-tab-pane>
          </el-tabs>
        </div>
        <div class="content-wrap">
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
          </keep-alive>
          <router-view v-if="!$route.meta.keepAlive"></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppNav from "@/components/common/AppNav";
import AppHeader from "@/components/common/Header";
import { menus } from "@/utils/sideJson.js";
export default {
  name: "app",
  data() {
    return {};
  },
  components: {
    AppNav,
    AppHeader
  },
  methods: {
    // tab切换时，动态的切换路由
    tabClick() {
      let path = this.activeIndex;
      this.$router.push({ path: path });
    },
    tabRemove(targetName) {
      // 首页不可删除
      if (targetName == "/home") {
        return;
      }
      this.$store.commit("delete_tabs", targetName);
      if (this.activeIndex === targetName) {
        // 设置当前激活的路由
        if (this.options && this.options.length >= 1) {
          this.$store.commit(
            "set_active_index",
            this.options[this.options.length - 1].route
          );
          this.$router.push({ path: this.activeIndex });
        } else {
          this.$router.push({ path: "/" });
        }
      }
    },
    userAuth() {
      let userMenus = JSON.parse(localStorage.getItem("userInfo"));
      if (userMenus.userType == 0) {
        let menusArr = [];
        JSON.parse(userMenus.userPower).forEach(item => {
          menusArr.push(item);
        });

        let routeTo = menus.filter(element => {
          if (element.route) {
            return this.$route.path == element.route;
          }
        });
        if (
          menusArr.indexOf(routeTo[0].id) == -1 &&
          this.$route.path != "/login"
        ) {
          this.$router.push({ path: "/" });
          this.$store.commit("set_active_index", "/home");
          return;
        }
      }
    }
  },
  mounted() {
    this.userAuth();
  },
  computed: {
    options() {
      return this.$store.state.options;
    },
    activeIndex: {
      get() {
        return this.$store.state.activeIndex;
      },
      set(val) {
        this.$store.commit("set_active_index", val);
      }
    }
  },
  watch: {
    $route(to) {
      this.userAuth();
      let flag = false;
      for (let option of this.options) {
        if (option.name === to.name) {
          flag = true;
          this.$store.commit("set_active_index", "/" + to.path.split("/")[1]);
          break;
        }
      }
      if (!flag) {
        this.$store.commit("add_tabs", {
          route: "/" + to.path.split("/")[1],
          name: to.name
        });
        this.$store.commit("set_active_index", "/" + to.path.split("/")[1]);
      }
    }
  }
};
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}
html,
body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;

  .app-content {
    flex: 1;
    display: flex;
    flex-flow: row;
    .app-nav {
      // flex: 0 0 200px;
      height: calc(100vh - 60px);
      background: #b2dfe6;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 0 !important;
      }
      .el-menu {
        background-color: transparent;
      }
    }
    .app-wrap {
      // min-width: 1200px;
      & > .template-tabs {
        & .el-tabs__content {
          padding: 0 !important;
        }
      }
      flex: 1;
      padding: 8px;
      overflow: hidden;
      .content-wrap {
        width: 100%;
        height: calc(100vh - 120px);
        overflow: auto;
        border: 1px solid #d1dbe5;
        border-top: none;
        & > .el-scrollbar > .el-scrollbar__wrap {
          overflow-x: auto;
        }
      }
    }
  }
}
</style>
