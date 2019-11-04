<template>
  <div class="loader">
    <div class="loader__inner">
      Данные загружаются ...      
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style scoped lang="scss">
.loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(100, 100, 100, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;

  &__inner {
    box-sizing: border-box;
    width: 200px;
    height: 50px;
    color: #555;
    font-size: 12px;
    font-weight: normal;
    background: #ddd;
    border: 1px solid #555;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
