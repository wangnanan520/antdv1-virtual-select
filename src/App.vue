<template>
  <div id="app">
    <virtualSelect
      style="width: 300px"
      v-model="value"
      allowClear
      showArrow
      :options="options"
    />
  </div>
</template>

<script>
import virtualSelect from "./components/VartualSelect/select";

export default {
  name: "App",
  components: {
    virtualSelect,
  },
  data() {
    const options = Array.from({ length: 20000 }, (_, index) => ({
      value: index,
      label: `Option ${index}`,
    }));
    return {
      options,
      value: '',
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
