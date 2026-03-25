<template>
  <div class="system-config">
<<<<<<< HEAD
    <el-tabs v-model="activeTab">
      <!-- 敏感词配置 -->
      <el-tab-pane label="敏感词配置" name="sensitive">
        <div class="config-section">
          <!-- 添加敏感词 -->
          <div class="add-section">
            <el-input
              v-model="newSensitiveWord"
              placeholder="输入敏感词"
              style="width: 300px; margin-right: 10px"
              @keyup.enter="addSensitiveWord"
            />
            <el-button type="primary" @click="addSensitiveWord">添加</el-button>
            <el-button @click="showBatchAddDialog = true">批量添加</el-button>
          </div>

          <!-- 敏感词列表 -->
          <el-table
            :data="sensitiveWordList"
            style="width: 100%; margin-top: 20px"
            v-loading="loading"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="word" label="敏感词" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="updateSensitiveWordStatus(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.create_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  link
                  @click="deleteSensitiveWord(row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="pagination.pageNum"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="getSensitiveWordList"
              @current-change="getSensitiveWordList"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- AI审核规则配置 -->
      <el-tab-pane label="AI审核规则" name="ai">
        <div class="config-section">
          <el-form
            ref="aiFormRef"
            :model="aiForm"
            :rules="aiRules"
            label-width="150px"
            style="max-width: 600px"
          >
            <el-form-item label="审核严格度" prop="level">
              <el-select v-model="aiForm.level" style="width: 200px">
                <el-option label="宽松" value="low" />
                <el-option label="中等" value="medium" />
                <el-option label="严格" value="high" />
              </el-select>
              <div class="form-tip">
                宽松：仅拦截明显违规内容<br/>
                中等：拦截违规和存疑内容<br/>
                严格：拦截所有可能违规的内容
              </div>
            </el-form-item>

            <el-form-item label="图片审核" prop="checkImage">
              <el-switch v-model="aiForm.checkImage" />
              <div class="form-tip">开启后会对上传的图片进行AI审核</div>
            </el-form-item>

            <el-form-item label="超时自动转人工" prop="timeoutToManual">
              <el-switch v-model="aiForm.timeoutToManual" />
              <div class="form-tip">AI审核超时后自动转为人工审核</div>
            </el-form-item>

            <el-form-item label="超时时间（毫秒）" prop="timeout">
              <el-input-number
                v-model="aiForm.timeout"
                :min="1000"
                :max="10000"
                :step="500"
                style="width: 200px"
              />
              <div class="form-tip">AI审核请求的超时时间</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveAiConfig" :loading="saving">
                保存配置
              </el-button>
              <el-button @click="getAiConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
=======
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>⚙️ 系统配置中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="config-tabs">
        <!-- 敏感词配置 -->
        <el-tab-pane label="敏感词配置" name="sensitive">
          <div class="config-section">
            <!-- 添加敏感词 -->
            <div class="add-section">
              <el-input
                v-model="newSensitiveWord"
                placeholder="输入敏感词"
                style="width: 300px; margin-right: 10px"
                @keyup.enter="addSensitiveWord"
                clearable
              />
              <el-button
                type="primary"
                @click="addSensitiveWord"
                round
                :loading="saving"
                >添加</el-button
              >
              <el-button @click="showBatchAddDialog = true" round
                >批量添加</el-button
              >
            </div>

            <!-- 敏感词列表 -->
            <el-table
              :data="sensitiveWordList"
              style="width: 100%; margin-top: 20px"
              v-loading="loading"
              class="data-table"
              stripe
            >
              <el-table-column prop="id" label="ID" width="80" align="center" />
              <el-table-column prop="word" label="敏感词" min-width="180" />
              <el-table-column
                prop="status"
                label="状态"
                width="110"
                align="center"
              >
                <template #default="{ row }">
                  <el-switch
                    v-model="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="updateSensitiveWordStatus(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="create_time"
                label="创建时间"
                width="180"
                align="center"
              />
              <el-table-column
                label="操作"
                width="120"
                fixed="right"
                align="center"
              >
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    link
                    @click="deleteSensitiveWord(row.id)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="pagination.pageNum"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="getSensitiveWordList"
                @current-change="getSensitiveWordList"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- AI审核规则配置 -->
        <el-tab-pane label="AI审核规则" name="ai">
          <div class="config-section">
            <el-form
              ref="aiFormRef"
              :model="aiForm"
              :rules="aiRules"
              label-width="160px"
              style="max-width: 700px"
              class="config-form"
            >
              <el-form-item label="审核严格度" prop="level">
                <el-select v-model="aiForm.level" style="width: 220px">
                  <el-option label="宽松" value="low" />
                  <el-option label="中等" value="medium" />
                  <el-option label="严格" value="high" />
                </el-select>
                <div class="form-tip">
                  宽松：仅拦截明显违规内容<br />
                  中等：拦截违规和存疑内容<br />
                  严格：拦截所有可能违规的内容
                </div>
              </el-form-item>

              <el-form-item label="图片审核" prop="checkImage">
                <el-switch v-model="aiForm.checkImage" />
                <div class="form-tip">开启后会对上传的图片进行AI审核</div>
              </el-form-item>

              <el-form-item label="超时自动转人工" prop="timeoutToManual">
                <el-switch v-model="aiForm.timeoutToManual" />
                <div class="form-tip">AI审核超时后自动转为人工审核</div>
              </el-form-item>

              <el-form-item label="超时时间（毫秒）" prop="timeout">
                <el-input-number
                  v-model="aiForm.timeout"
                  :min="1000"
                  :max="10000"
                  :step="500"
                  style="width: 220px"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  @click="saveAiConfig"
                  :loading="saving"
                  round
                  size="default"
                >
                  保存配置
                </el-button>
                <el-button @click="getAiConfig" round size="default"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
>>>>>>> zhe-chen

    <!-- 批量添加敏感词对话框 -->
    <el-dialog
      v-model="showBatchAddDialog"
      title="批量添加敏感词"
<<<<<<< HEAD
      width="500px"
=======
      width="520px"
      class="config-dialog"
>>>>>>> zhe-chen
    >
      <el-input
        v-model="batchWords"
        type="textarea"
        :rows="10"
        placeholder="输入敏感词，每行一个"
      />
      <template #footer>
        <el-button @click="showBatchAddDialog = false">取消</el-button>
<<<<<<< HEAD
        <el-button type="primary" @click="batchAddSensitiveWords" :loading="saving">
=======
        <el-button
          type="primary"
          @click="batchAddSensitiveWords"
          :loading="saving"
        >
>>>>>>> zhe-chen
          确定添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import adminApi from '@/api/admin'
import dayjs from 'dayjs'

const activeTab = ref('sensitive')
const loading = ref(false)
const saving = ref(false)
const newSensitiveWord = ref('')
const batchWords = ref('')
const showBatchAddDialog = ref(false)

// 敏感词列表
const sensitiveWordList = ref([])
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// AI审核配置
const aiFormRef = ref(null)
const aiForm = reactive({
  level: 'medium',
  checkImage: true,
  timeoutToManual: true,
  timeout: 3000
})

const aiRules = {
  level: [{ required: true, message: '请选择审核严格度', trigger: 'change' }],
  timeout: [
    { required: true, message: '请输入超时时间', trigger: 'blur' },
    { type: 'number', min: 1000, max: 10000, message: '超时时间范围：1000-10000', trigger: 'blur' }
  ]
}
=======
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import adminApi from "@/api/admin";
import dayjs from "dayjs";

const activeTab = ref("sensitive");
const loading = ref(false);
const saving = ref(false);
const newSensitiveWord = ref("");
const batchWords = ref("");
const showBatchAddDialog = ref(false);

// 敏感词列表
const sensitiveWordList = ref([]);
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// AI审核配置
const aiFormRef = ref(null);
const aiForm = reactive({
  level: "medium",
  checkImage: true,
  timeoutToManual: true,
  timeout: 3000,
});

const aiRules = {
  level: [{ required: true, message: "请选择审核严格度", trigger: "change" }],
  timeout: [
    { required: true, message: "请输入超时时间", trigger: "blur" },
    {
      type: "number",
      min: 1000,
      max: 10000,
      message: "超时时间范围：1000-10000",
      trigger: "blur",
    },
  ],
};
>>>>>>> zhe-chen

// 获取敏感词列表
const getSensitiveWordList = async () => {
  try {
<<<<<<< HEAD
    loading.value = true
    const res = await adminApi.getSensitiveWordList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    sensitiveWordList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取敏感词列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}
=======
    loading.value = true;
    const res = await adminApi.getSensitiveWordList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    });
    sensitiveWordList.value = res.data.list || [];
    pagination.total = res.data.total || 0;
  } catch (error) {
    ElMessage.error("获取敏感词列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};
>>>>>>> zhe-chen

// 添加敏感词
const addSensitiveWord = async () => {
  if (!newSensitiveWord.value.trim()) {
<<<<<<< HEAD
    ElMessage.warning('请输入敏感词')
    return
  }

  try {
    saving.value = true
    await adminApi.addSensitiveWord({ word: newSensitiveWord.value.trim() })
    ElMessage.success('添加成功')
    newSensitiveWord.value = ''
    getSensitiveWordList()
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '添加失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}
=======
    ElMessage.warning("请输入敏感词");
    return;
  }

  try {
    saving.value = true;
    await adminApi.addSensitiveWord({ word: newSensitiveWord.value.trim() });
    ElMessage.success("添加成功");
    newSensitiveWord.value = "";
    getSensitiveWordList();
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || "添加失败");
    console.error(error);
  } finally {
    saving.value = false;
  }
};
>>>>>>> zhe-chen

// 批量添加敏感词
const batchAddSensitiveWords = async () => {
  const words = batchWords.value
<<<<<<< HEAD
    .split('\n')
    .map(w => w.trim())
    .filter(w => w)

  if (words.length === 0) {
    ElMessage.warning('请输入敏感词')
    return
  }

  try {
    saving.value = true
    await adminApi.batchAddSensitiveWords({ words })
    ElMessage.success(`成功添加 ${words.length} 个敏感词`)
    batchWords.value = ''
    showBatchAddDialog.value = false
    getSensitiveWordList()
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '批量添加失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}
=======
    .split("\n")
    .map((w) => w.trim())
    .filter((w) => w);

  if (words.length === 0) {
    ElMessage.warning("请输入敏感词");
    return;
  }

  try {
    saving.value = true;
    await adminApi.batchAddSensitiveWords({ words });
    ElMessage.success(`成功添加 ${words.length} 个敏感词`);
    batchWords.value = "";
    showBatchAddDialog.value = false;
    getSensitiveWordList();
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || "批量添加失败");
    console.error(error);
  } finally {
    saving.value = false;
  }
};
>>>>>>> zhe-chen

// 删除敏感词
const deleteSensitiveWord = async (id) => {
  try {
<<<<<<< HEAD
    await ElMessageBox.confirm('确定要删除这个敏感词吗？', '提示', {
      type: 'warning'
    })
    await adminApi.deleteSensitiveWord(id)
    ElMessage.success('删除成功')
    getSensitiveWordList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}
=======
    await ElMessageBox.confirm("确定要删除这个敏感词吗？", "提示", {
      type: "warning",
    });
    await adminApi.deleteSensitiveWord(id);
    ElMessage.success("删除成功");
    getSensitiveWordList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
      console.error(error);
    }
  }
};
>>>>>>> zhe-chen

// 更新敏感词状态
const updateSensitiveWordStatus = async (row) => {
  try {
<<<<<<< HEAD
    await adminApi.updateSensitiveWordStatus(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    console.error(error)
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}
=======
    await adminApi.updateSensitiveWordStatus(row.id, { status: row.status });
    ElMessage.success("状态更新成功");
  } catch (error) {
    ElMessage.error("状态更新失败");
    console.error(error);
    row.status = row.status === 1 ? 0 : 1;
  }
};
>>>>>>> zhe-chen

// 获取AI审核配置
const getAiConfig = async () => {
  try {
<<<<<<< HEAD
    loading.value = true
    const res = await adminApi.getAiConfig()
    Object.assign(aiForm, res.data || {})
  } catch (error) {
    ElMessage.error('获取AI审核配置失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}
=======
    loading.value = true;
    const res = await adminApi.getAiConfig();
    Object.assign(aiForm, res.data || {});
  } catch (error) {
    ElMessage.error("获取AI审核配置失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};
>>>>>>> zhe-chen

// 保存AI审核配置
const saveAiConfig = async () => {
  try {
<<<<<<< HEAD
    await aiFormRef.value.validate()
    saving.value = true
    await adminApi.setAiConfig(aiForm)
    ElMessage.success('配置保存成功')
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.response?.data?.msg || '保存失败')
      console.error(error)
    }
  } finally {
    saving.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  getSensitiveWordList()
  getAiConfig()
})
</script>

<style scoped>
.system-config {
  padding: 20px;
  background: #fff;
}

=======
    await aiFormRef.value.validate();
    saving.value = true;
    await adminApi.setAiConfig(aiForm);
    ElMessage.success("配置保存成功");
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.response?.data?.msg || "保存失败");
      console.error(error);
    }
  } finally {
    saving.value = false;
  }
};

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

onMounted(() => {
  getSensitiveWordList();
  getAiConfig();
});
</script>

<style scoped>
/* 外层容器 + 全屏背景图 */
.system-config {
  padding: 25px;
  min-height: 100vh;
  position: relative;

  /* 你的本地背景图 */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景虚化层：不遮挡内容 */
.system-config::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(3px);
  z-index: 0;
}

/* 主卡片：高级圆角 + 阴影 */
.config-card {
  position: relative;
  z-index: 10;
  border-radius: 18px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.94);
}

/* 卡片标题 */
.card-header {
  font-size: 17px;
  font-weight: bold;
  color: #333;
}

/* 标签页美化 */
:deep(.config-tabs) {
  --el-tabs-active-tab-color: #1677ff;
  --el-tabs-card-tab-hover-color: #1677ff;
}

/* 配置区域 */
>>>>>>> zhe-chen
.config-section {
  padding: 20px 0;
}

<<<<<<< HEAD
.add-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

=======
/* 搜索/添加区域 */
.add-section {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}

/* 表格高级样式 */
.data-table {
  --el-table-row-hover-bg-color: #f8f9ff;
  border-radius: 12px;
  overflow: hidden;
  --el-table-header-bg-color: #f5f7fa;
}

/* 分页 */
>>>>>>> zhe-chen
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

<<<<<<< HEAD
:deep(.el-tabs__content) {
  padding: 20px 0;
}

:deep(.el-table) {
  border: 1px solid #ebeef5;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
=======
/* 表单样式 */
.config-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* 弹窗样式 */
:deep(.config-dialog .el-dialog__header) {
  border-bottom: 1px solid #eee;
>>>>>>> zhe-chen
}
</style>
