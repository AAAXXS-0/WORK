<template>
<<<<<<< HEAD
    <div class="publish-page">
      <el-card>
        <h3>发布帖子</h3>
        <el-form :model="postForm" label-width="80px">
          <el-form-item label="内容">
            <el-input
              v-model="postForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入帖子内容"
            ></el-input>
          </el-form-item>
          <el-form-item label="图片">
            <upload-img v-model:images="postForm.images" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publish">发布</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import request from '../../utils/request'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import UploadImg from '@/components/UploadImg.vue'
  
  const router = useRouter()
  const postForm = ref({
    content: '',
    images: []
  })
  
  // 监听images变化
  watch(() => postForm.value.images, (newVal) => {
    console.log('postForm.images 变化:', newVal)
  }, { deep: true })
  
  const publish = async () => {
    if (!postForm.value.content) {
      ElMessage.warning('内容不能为空')
      return
    }
    console.log('准备发布帖子，数据:', postForm.value)
    try {
      await request.post('/post/publish', postForm.value)
      ElMessage.success('发帖成功，审核中')
      router.push('/home')
    } catch (err) {
      ElMessage.error('发帖失败：' + err.msg)
    }
  }
  
  const reset = () => {
    postForm.value.content = ''
    postForm.value.images = []
  }
  </script>
  
  <style scoped>
  .publish-page {
    padding: 20px;
  }
  </style>
=======
  <div class="publish-page">
    <el-card class="publish-card">
      <h2 class="publish-title">发布帖子</h2>
      <el-form :model="postForm" label-width="80px">
        <el-form-item label="内容">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="10"
            placeholder="分享你的想法..."
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <upload-img v-model:images="postForm.images" />
        </el-form-item>
        <el-form-item class="btn-group">
          <el-button type="primary" @click="publish" round>
            <i class="el-icon-send"></i> 发布帖子
          </el-button>
          <el-button @click="reset" round> 重置清空 </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import request from "../../utils/request";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import UploadImg from "@/components/UploadImg.vue";

const router = useRouter();
const postForm = ref({
  content: "",
  images: [],
});

watch(
  () => postForm.value.images,
  (newVal) => {
    console.log("postForm.images 变化:", newVal);
  },
  { deep: true },
);

const publish = async () => {
  if (!postForm.value.content) {
    ElMessage.warning("内容不能为空");
    return;
  }
  console.log("准备发布帖子，数据:", postForm.value);
  try {
    await request.post("/post/publish", postForm.value);
    ElMessage.success("发帖成功，审核中");
    router.push("/home");
  } catch (err) {
    ElMessage.error("发帖失败：" + err.msg);
  }
};

const reset = () => {
  postForm.value.content = "";
  postForm.value.images = [];
};
</script>

<style scoped>
/* 页面容器 + 统一背景图 */
.publish-page {
  padding: 30px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;

  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.publish-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  z-index: 0;
}

/* 发布卡片：高级统一样式 */
.publish-card {
  width: 100%;
  max-width: 800px;
  padding: 30px 35px;
  position: relative;
  z-index: 10;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: none;
  background: rgba(255, 255, 255, 0.95);
}

/* 标题 */
.publish-title {
  text-align: center;
  margin-bottom: 28px;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

/* 按钮组 */
.btn-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

/* 输入框美化 */
:deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 12px 15px;
  font-size: 15px;
  line-height: 1.6;
  border-color: #e5e6eb;
  transition: all 0.2s;
}

:deep(.el-textarea__inner:focus) {
  border-color: #4f8fcf;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 标签美化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}
</style>
>>>>>>> zhe-chen
