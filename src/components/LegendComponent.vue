<template>
  <div class="legend">
    <div class="legend__title">
      Темпераура &deg;C  
    </div>
    
    <div 
      class="legend__item"
      v-for="item in legendData"
      :key="item.label"
    >
      <div 
        class="legend__item__color" 
        :style="{background: item.color}"
      ></div>

      <div class="legend__item__label">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    minVal: {
      type: Number,
      required: true
    },
    maxVal: {
      type: Number,
      required: true
    },
    levels: {
      type: Number,
      required: true
    }
  },
  computed: {
    legendData() {      
      const arr = []
      const step = (this.maxVal - this.minVal) / this.levels
      
      for (let i = 0; i < this.levels; i++) {
        let lowerLevel = Math.round((this.minVal + step * i)*100)/100
        let highLevel = Math.round((this.minVal + step * (i+1))*100)/100

        arr.push({
          color: `rgb(0, ${256 * i/this.levels}, 0)`,
          label: `${lowerLevel}-${highLevel}` 
        })
      }
      
      return arr
    }
  }
}
</script>

<style scoped lang="scss">
.legend {
  box-sizing: border-box;
  padding: 5px;
  border: 1px solid #000;
  background: #fff;

  &__item {
    box-sizing: border-box;
    padding-top: 3px;
    padding-bottom: 3px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    &__color {
      box-sizing: border-box;
      width: 10px;
      height: 10px;
      border: 1px solid #777;
      opacity: 0.5;
    }

    &__label {
      box-sizing: border-box;
      padding-left: 10px;
      font-size: 11px;
    }
  }
}
</style>
