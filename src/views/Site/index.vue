<template>
  <div class="wa-site-view">
    <el-tabs v-model="activeName" @tab-click="tabClick">
      <el-tab-pane label="站点列表" name="sitelist">
        <el-form>
          <el-row :gutter="5">
            <el-col :span="6">
              <el-form-item>
                <el-input
                  clearable
                  placeholder="请输入站点名称、编号、设备名称"
                  size="small"
                  v-model="searchForm.name"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="站点状态">
                <el-select clearable size="small" v-model="searchForm.status">
                  <el-option label="正常" value="1"></el-option>
                  <el-option label="停用" value="0"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <el-form-item>
                <el-button type="primary" size="small" @click="submitClick()">查询</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
          <el-table-column type="index" label="#" width="50" align="center"></el-table-column>
          <el-table-column prop="siteNo" label="站点编号" align="center"></el-table-column>
          <el-table-column prop="siteName" label="站点名称" align="center"></el-table-column>
          <el-table-column label="站点状态" align="center">
            <template slot-scope="scope">{{ scope.row.siteStatus == 0?'停用':'正常' }}</template>
          </el-table-column>
          <el-table-column prop="contactNick" label="联系人" align="center"></el-table-column>
          <el-table-column prop="contactDetail" label="联系电话" align="center"></el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <el-button @click="QueryClick(scope.row)" type="text" size="small">修改</el-button>
              <el-button
                type="text"
                v-if="scope.row.siteStatus == 1"
                @click="UpdateTheSite(scope.row)"
                size="small"
              >暂停</el-button>
              <el-button type="text" v-else @click="UpdateTheSite(scope.row)" size="small">激活</el-button>
              <el-button type="text" @click="deviceDig(scope.row)" size="small">设备管理</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchForm.pageNo"
          :page-sizes="[10, 20, 50,100]"
          :page-size="searchForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchForm.total"
        ></el-pagination>
      </el-tab-pane>
      <el-tab-pane label="站点添加" name="siteadd">
        <site-add ref="child"></site-add>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      :visible.sync="deviceListDig"
      width="50%"
      @close="clearDeviceList()"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <span slot="title">
        设备列表【
        <span style="color:red">{{deviceRow.siteName}}</span>
        】
      </span>
      <el-select v-model="bindFrom.equipment" multiple collapse-tags size="mini">
        <el-option
          v-for="(item,index) in sensorList"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button style="margin-left: 20px;" size="mini" @click="bindBtn()" type="primary">绑定设备</el-button>
      <el-table v-loading="loading1" :data="deviceData" style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center"></el-table-column>
        <el-table-column prop="name" label="设备名称" align="center"></el-table-column>
        <el-table-column label="类型" align="center">
          <template
            slot-scope="scope"
          >{{scope.row.type == '1'?'高度':scope.row.type == '2'?'流速':'未知'}}</template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deviceListDig = false">取 消</el-button>
        <el-button type="primary" @click="deviceListDig = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="设备绑定" :visible.sync="deviceAddDig" width="50%">
      <span>当前站点：{{deviceRow.siteName}}</span>

      <span slot="footer" class="dialog-footer">
        <el-button @click="deviceListDig = false">取 消</el-button>
        <el-button type="primary" @click="deviceListDig = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="editDialog" width="50%">
      <span slot="title">修改</span>
      <el-form label-width="80px" class="site-add-form" ref="siteForm">
        <el-row>
          <el-col :span="12">
            <el-form-item label="站点名称">
              <el-input disabled v-model="rowForm.siteName" size="small"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点编号">
              <el-input disabled v-model="rowForm.siteNo" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="rowForm.contactNick" size="small"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式">
              <el-input v-model="rowForm.contactDetail" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备厂商">
              <el-input disabled v-model="rowForm.manufacturer" size="small"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经纬度">
              <el-input v-model="MapPlace" size="small" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="站点地区">
              <el-input disabled v-model="rowForm.address" size="small"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行业">
              <el-input disabled v-model="rowForm.siteTagName" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="站点地址">
          <el-col :span="24">
            <el-input
              size="small"
              disabled
              placeholder="详细地址"
              type="textarea"
              v-model="rowForm.siteAddress"
            ></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SiteAdd from "@/views/Site/add.vue";
export default {
  data() {
    return {
      sensorList: [], //可用设备列表
      deviceType: [
        { label: "高度", value: "1" },
        { label: "流速", value: "2" },
        { label: "未知", value: "0" }
      ], //设备类型
      editDialog: false,
      deviceListDig: false, //设备列表的弹框
      deviceAddDig: false, //添加设备
      deviceRow: "", //弹框的站点
      deviceData: [], //设备列表弹框数据
      bindFrom: {
        equipment: []
      },
      activeName: "sitelist",
      loading: false,
      loading1: false,
      rowForm: [],
      searchForm: {
        name: "",
        status: "",
        pageNo: 0,
        pageSize: 10,
        total: 0,
        pages: ""
      },
      tableData: []
    };
  },
  computed: {
    //经纬度
    MapPlace() {
      return `${this.rowForm.longitude},${this.rowForm.latitude}`;
    }
  },
  components: {
    SiteAdd
  },
  mounted() {
    this.initSiteData();
  },
  methods: {
    clearDeviceList() {
      //清空设备列表弹框
      this.bindFrom.equipment = [];
    },
    bindBtn() {
      if (this.bindFrom.equipment.length == 0) {
        this.$message.warning("请先选择设备");
      } else {
        this.$request
          .post(this.api.sys.site.bindEquipment, {
            siteId: this.deviceRow.id,
            siteName: this.deviceRow.siteName,
            id: this.bindFrom.equipment
          })
          .then(res => {
            if (res.code == 1) {
              this.bindFrom.equipment = [];
              this.initEquipment();
              this.initDeviceList();
            } else {
              this.$message.error(res.msg);
            }
          });
      }
    },
    deviceDig(row) {
      //设备列表弹框
      this.loading1 = true;
      this.deviceRow = JSON.parse(JSON.stringify(row));
      this.initEquipment();
      this.initDeviceList(); //初始化站点下的设备列表
      this.deviceListDig = true;
    },
    initDeviceList() {
      this.$request
        .post(this.api.sys.site.getDeviceList, { siteId: this.deviceRow.id })
        .then(res => {
          if (res.code == 1) {
            this.deviceData = res.data;
          }
          this.loading1 = false;
        })
        .catch(err => {
          this.loading1 = false;
        });
    },
    handleSizeChange(val) {
      this.searchForm.pageSize = val;
      this.initSiteData();
    },
    handleCurrentChange(val) {
      this.searchForm.pageNo = val;
      this.initSiteData();
    },
    tabClick(tab, event) {
      if (tab.name == "siteadd") {
        this.$refs.child.resetForm();
        this.$refs.child.initMap();
      } else {
        this.initSiteData();
      }
    },
    UpdateTheSite(row) {
      const siteStatus =
        row.siteStatus == 0
          ? this.api.sys.site.openSite
          : this.api.sys.site.closeSite;
      this.$request.post(siteStatus, { id: row.id }).then(res => {
        if (res.code == 1) {
          this.$message.success(
            row.status == 0 ? "站点激活成功" : "站点暂停成功"
          );
        } else {
          this.$message.error("操作失败");
        }
        this.initSiteData();
      });
    },
    updateInfo() {
      this.$request
        .post(this.api.sys.site.update, {
          contactDetail: this.rowForm.contactDetail,
          contactNick: this.rowForm.contactNick,
          id: this.rowForm.id
        })
        .then(res => {
          if (res.code == 1) {
            this.$message.success("修改成功");
          } else {
            this.$message.error("操作失败");
          }
          this.editDialog = false;
          this.initSiteData();
        });
    },
    QueryClick(row) {
      this.rowForm = JSON.parse(JSON.stringify(row));
      this.editDialog = true;
    },
    submitClick() {
      this.initSiteData();
    },
    initSiteData() {
      this.loading = true;
      this.$request.post(this.api.sys.site.get, this.searchForm).then(res => {
        if (res.code == "1") {
          this.searchForm.pageNo = res.data.pageNum;
          this.searchForm.pageSize = res.data.pageSize;
          this.searchForm.total = res.data.total;
          this.tableData = res.data.list;
          this.loading = false;
        }
      });
    },
    initEquipment() {
      //设备编号
      this.$request.post(this.api.sys.site.equipment).then(res => {
        if (res.code == 1) {
          this.sensorList = [];
          res.data.forEach(element => {
            this.sensorList.push({ label: element.name, value: element.id });
          });
        } else {
          this.$message.error("查询失败");
        }
      });
    }
  }
};
</script>

<style lang="scss">
.wa-site-view {
  padding: 10px 20px;
}
</style>