<template>
  <a-input class="j-popup-placeholder" :value="displayValue" readonly @focus="handleFocus">
    <template #suffix>
      <SearchOutlined />
    </template>
  </a-input>
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { SearchOutlined } from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'JPopup',
    components: { SearchOutlined },
    props: {
      value: [String, Number, Array, Object],
      code: String,
      fieldConfig: Array,
      orgFields: String,
      destFields: String,
      multi: Boolean,
      setFieldsValue: Function,
      formElRef: Object,
    },
    emits: ['focus', 'update:value', 'callback'],
    setup(props, { emit }) {
      const displayValue = computed(() => {
        if (Array.isArray(props.value)) {
          return props.value.join(',');
        }
        return props.value ?? '';
      });

      function handleFocus() {
        emit('focus');
      }

      return {
        displayValue,
        handleFocus,
      };
    },
  });
</script>

<style lang="less" scoped>
  .j-popup-placeholder {
    cursor: not-allowed;
  }
</style>
