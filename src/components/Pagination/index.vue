<template>
  <el-row type="flex" justify="end">
    <div :class="{ hidden: hidden }" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :layout="layout"
        :page-sizes="pageSizes"
        :total="total"
        v-bind="$attrs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { scrollTo } from '@/utils/scroll-to';

// Define props
const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array<number>,
    default: () => [10, 20, 50]
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
});

// Define emits
const emit = defineEmits(['update:page', 'update:limit', 'pagination']);

// Define reactive state
const currentPage = computed({
  get: () => props.page,
  set: val => emit('update:page', val)
});

const pageSize = computed({
  get: () => props.limit,
  set: val => emit('update:limit', val)
});

// Handle size change
const handleSizeChange = (val: number) => {
  emit('pagination', { page: currentPage.value, limit: val });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
};

// Handle page change
const handleCurrentChange = (val: number) => {
  emit('pagination', { page: val, limit: pageSize.value });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
};
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding-top: 16px;
}
.pagination-container.hidden {
  display: none;
}
</style>
