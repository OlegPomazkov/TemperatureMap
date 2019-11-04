<template>
  <div id="app">
    <temperature-map/>
  </div>
</template>

<script>
import TemperatureMap from './components/TemperatureMap'

export default {
  name: 'app',
  components: {
    TemperatureMap
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>
