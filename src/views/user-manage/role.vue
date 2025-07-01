<script setup lang="ts">
import { Search, Refresh, CirclePlus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { roleApi } from '@/api/user';
import { ref, reactive, onMounted } from 'vue';
import type { RoleModel, RoleListParams, PermissionModel, RoleAddParams, RoleUpdateParams } from '@/api/types/user';

const list = ref<RoleModel[]>([]);
const allPermission = ref<Array<PermissionModel>>([]);
const listLoading = ref(false);

const dialogFormVisible = ref(false);
enum DialogStatus {
  create = 'create',
  update = 'update'
}
let dialogStatus = DialogStatus.create;
const textMap = {
  update: '编辑',
  create: '新建角色'
};

const listQuery = reactive<RoleListParams>({
  roleName: '',
  username: ''
});
const tempRole = reactive<{
  roleId: number;
  roleName: string;
  permissions: Array<number>;
}>({
  roleId: 0,
  roleName: '',
  permissions: []
});
const loading = ref(false);

const getAllPermission = async () => {
  const data = await roleApi.getListAllPermission();
  allPermission.value = data;
};

const getList = async () => {
  listLoading.value = true;
  const res = await roleApi.getListRole(listQuery);
  listLoading.value = false;
  list.value = res.data;
};

const getIndex = ($index: number) => $index + 1;

const showCreate = () => {
  tempRole.roleId = 0;
  tempRole.roleName = '';
  tempRole.permissions = [];
  dialogStatus = DialogStatus.create;
  dialogFormVisible.value = true;
};

const showUpdate = ($index: number) => {
  const role = list.value[$index];
  tempRole.roleName = role.roleName;
  tempRole.roleId = role.roleId;
  tempRole.permissions = [];
  for (let i = 0; i < role.menus.length; i++) {
    const perm = role.menus[i].permissions;
    for (let j = 0; j < perm.length; j++) {
      tempRole.permissions.push(perm[j].permissionId);
    }
  }
  dialogStatus = DialogStatus.update;
  dialogFormVisible.value = true;
};

const createRole = async () => {
  if (!checkRoleNameUnique()) return;
  if (!checkPermissionNum()) return;
  loading.value = true;
  try {
    const params: RoleAddParams = {
      roleName: tempRole.roleName,
      permissions: tempRole.permissions
    };
    await roleApi.postAddRole(params);
    getList();
    dialogFormVisible.value = false;
  } catch {
    // handle error
  } finally {
    loading.value = false;
  }
};

const updateRole = async () => {
  if (!checkRoleNameUnique(tempRole.roleId)) return;
  if (!checkPermissionNum()) return;
  loading.value = true;
  try {
    const params: RoleUpdateParams = {
      id: tempRole.roleId,
      roleName: tempRole.roleName,
      permissions: tempRole.permissions
    };
    await roleApi.postUpdateRole(params);
    getList();
    dialogFormVisible.value = false;
  } catch {
    // handle error
  } finally {
    loading.value = false;
  }
};

const checkPermissionNum = () => {
  if (tempRole.permissions.length === 0) {
    ElMessage.error('请至少选择一种权限');
    return false;
  }
  return true;
};

const checkRoleNameUnique = (roleId?: number) => {
  const roleName = tempRole.roleName;
  if (!roleName) {
    ElMessage.error('请填写角色名称');
    return false;
  }
  const roles = list.value;
  let result = true;
  for (let j = 0; j < roles.length; j++) {
    if (roles[j].roleName === roleName && (!roleId || roles[j].roleId !== roleId)) {
      ElMessage.error('角色名称已存在');
      result = false;
      break;
    }
  }
  return result;
};

const removeRole = async ($index: number) => {
  ElMessageBox.confirm('确定删除此角色?', '提示', {
    confirmButtonText: '确定',
    showCancelButton: false,
    type: 'warning'
  }).then(() => {
    const role = list.value[$index];
    if (role.roleId) {
      roleApi.postDeleteRole({ id: role.roleId }).then(() => {
        getList();
      });
    }
  });
};

const isMenuNone = (_index: number) => {
  const menu = allPermission.value[_index].permissions;
  return menu.every(perm => tempRole.permissions.indexOf(perm.id) === -1);
};

const isMenuAll = (_index: number) => {
  const menu = allPermission.value[_index].permissions;
  return menu.every(perm => tempRole.permissions.indexOf(perm.id) > -1);
};

const checkAll = (_index: number) => {
  if (isMenuAll(_index)) {
    noPerm(_index);
  } else {
    allPerm(_index);
  }
};

const allPerm = (_index: number) => {
  const menu = allPermission.value[_index].permissions;
  menu.forEach(perm => addUnique(perm.id, tempRole.permissions));
};

const noPerm = (_index: number) => {
  const menu = allPermission.value[_index].permissions;
  menu.forEach(perm => {
    const idIndex = tempRole.permissions.indexOf(perm.id);
    if (idIndex > -1) {
      tempRole.permissions.splice(idIndex, 1);
    }
  });
};

const addUnique = (val: number, arr: number[]) => {
  if (!arr.includes(val)) {
    arr.push(val);
  }
};

const checkRequired = (_perm: { id: number; requiredPerm: number; permissionName: string }, _index: number) => {
  const permId = _perm.id;
  if (tempRole.permissions.includes(permId)) {
    permissionChecked(_index);
  } else {
    if (_perm.requiredPerm === 1) {
      // 假设type为1表示必选权限
      noPerm(_index);
    }
  }
};

const permissionChecked = (_index: number) => {
  const menu = allPermission.value[_index].permissions;
  menu.forEach(perm => {
    if (perm.requiredPerm === 1) {
      // 假设type为1表示必选权限
      addUnique(perm.id, tempRole.permissions);
    }
  });
};

const handleReset = () => {
  listQuery.roleName = '';
  listQuery.username = '';
  getList();
};

onMounted(() => {
  getList();
  getAllPermission();
});
</script>

<template>
  <div class="role-view">
    <div class="filter-container">
      <el-button type="primary" plain :icon="CirclePlus" @click="showCreate">添加角色 </el-button>
      <el-form ref="queryForm" :inline="true">
        <div class="search">
          <el-form-item prop="username" label="昵称：">
            <el-input class="search-item" v-model="listQuery.username" placeholder="请输入用户昵称搜索" />
          </el-form-item>
          <el-form-item prop="roleName" label="角色：">
            <el-input class="search-item" v-model="listQuery.roleName" placeholder="请输入角色搜索" />
          </el-form-item>

          <el-form-item>
            <el-button plain type="primary" :icon="Search" @click="getList"> 查询 </el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <el-table :data="list" v-loading="listLoading" fit highlight-current-row>
      <el-table-column align="" label="序号" width="100">
        <template #default="{ $index }">
          <span>{{ getIndex($index) }} </span>
        </template>
      </el-table-column>
      <el-table-column align="" label="角色" prop="roleName" width="180" />
      <el-table-column align="" label="用户">
        <template #default="{ row }">
          <span v-for="(user, index) in row.users" :key="index" style="margin-right: 8px">
            <span>{{ user.nickname }} </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="" label="操作" width="160">
        <template #default="{ row, $index }">
          <div v-if="row.roleName !== '管理员'">
            <el-button plain size="small" type="primary" @click="showUpdate($index)"> 编 辑 </el-button>
            <el-button plain size="small" type="danger" @click="removeRole($index)"> 删 除 </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" v-model="dialogFormVisible" width="900px">
      <el-form :model="tempRole" label-position="left" label-width="100px" style="width: 90%; margin-left: 30px">
        <el-form-item label="角色名称" required>
          <el-input type="text" v-model="tempRole.roleName" style="width: 280px" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="菜单&权限" required>
          <div v-for="(menu, _index) in allPermission" :key="menu.menuName" style="width: 100%; margin-bottom: 8px">
            <span style="width: 100px; display: inline-block">
              <el-button
                :type="isMenuNone(_index) ? '' : isMenuAll(_index) ? 'success' : 'primary'"
                style="width: 80px"
                @click="checkAll(_index)"
                >{{ menu.menuName }}</el-button
              >
            </span>
            <div style="display: inline-block">
              <el-checkbox-group v-model="tempRole.permissions">
                <el-checkbox
                  v-for="perm in menu.permissions"
                  :value="perm.id"
                  @change="checkRequired(perm, _index)"
                  :key="perm.id"
                >
                  <span :class="{ requiredPerm: perm.requiredPerm === 1 }">{{ perm.permissionName }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <p style="color: #848484">说明:红色权限为对应菜单内的必选权限，不选则看不到该菜单</p>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button v-if="dialogStatus === DialogStatus.create" type="primary" :loading="loading" @click="createRole">
            创 建
          </el-button>
          <el-button type="primary" v-else :loading="loading" @click="updateRole">修 改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.filter-container {
  display: flex;
  justify-content: space-between;
}

.search {
  margin: 5px 0;
}

.search-item {
  width: 180px;
  margin-right: 8px;
}

.requiredPerm {
  color: #ff0e13;
}

.dialog-footer {
  text-align: center;
}
</style>
