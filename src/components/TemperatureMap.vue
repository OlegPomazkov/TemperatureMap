<template>
  <div class="map">
    <div class="map__title">
      КАРТА РАСПРЕДЕЛЕНИЯ ТЕМПЕРАТУР
    </div>

    <div class="map__controls">
      <div class="map__controls__control">
        <div class="map__controls__control__label">
          Уровень интерполяции:
        </div>  
        <input  
          class="map__controls__control__input"
          v-model="splitLevel"
          @change="getMapData"
        />
      </div>

      <div class="map__controls__control">
        <div class="map__controls__control__label">
          Градаций цвета:
        </div>  
        <input  
          class="map__controls__control__input"
          v-model="colorLevels"
          @change="getMapData"
          @input="getMapData"
        />
      </div>
    </div>
    
    <l-map 
      class="map__container" 
      ref="temperatureMap" 
      :zoom="zoom" 
      :center="center" 
      :options="{zoomControl: true}"
      @zoomend="getMapData"
      @moveend="getMapData"
    >
 
      <l-tile-layer :url="url" />

      <l-geo-json 
        ref="geoJson" 
        :geojson="geojson"
        :options="{style: tileStyles}"
        :zIndex="1000"
      />

      <l-control v-if="legendVisible"> 
        <legend-component
          v-if="minTemp && maxTemp" 
          :minVal="minTemp"
          :maxVal="maxTemp"
          :levels="+colorLevels"
        />
      </l-control>
    </l-map>

    <div 
      :class="`map__button ${getDataDisabled? 'disabled': ''}`"
      @click="handleButtonClick"
    >
      Показать температуру
    </div> 

    <loader-component v-if="isLoading" />
  </div>
</template>

<script>
import { LMap, LTileLayer, LGeoJson, LControl } from 'vue2-leaflet';
import LegendComponent from '@/components/LegendComponent'
import LoaderComponent from '@/components/LoaderComponent'

import { interpolate } from '@/utils/interpolate'
import { setFillColor } from '@/utils/setColor'

const ZERO = 273.15
const API_KEY = '60acc8160072c82960b8bb8ef3f1b49c'

export default {
  components: {
    LMap,
    LTileLayer,
    LGeoJson,
    LControl,
    LegendComponent,
    LoaderComponent
  },
  data() {
    return {
      xPointsData: 9,
      yPointsData: 6,
      splitLevel: 20,
      colorLevels: 6,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      zoom: 5,
      centerLat: 55.7422,  
      centerLng: 37.57,
      mapBounds: null,
      geojson: {
        type: 'FeatureCollection',
        features: []
      },
      tileStyles: function(feature) {
        if (!feature.properties) feature.properties = {}
        if (!feature.properties.style) feature.properties.style = {}

        return feature.properties.style
      },
      minTemp: null,
      maxTemp: null,
      legendVisible: false,
      getDataDisabled: false,
      dataCoordsArray: [],
      dataAreasArray: [],
      viewCoordsArray: [],
      isLoading: false
    };
  },
  computed: {
    center() {
      return [this.centerLat, this.centerLng]
    }
  },
  mounted () {
    this.getMapData()
  },
  methods: {
    enableDataGetting() {
      this.getDataDisabled = false
    },
    async handleButtonClick() {
      if( this.getDataDisabled ) return

      this.getDataDisabled = true
      setTimeout(this.enableDataGetting, 60000)
      const resp = await this.getNewTemperatureData()
      
      this.geojson = {
        type: 'FeatureCollection',
        features: resp
      }
    },
    getMapData() {
      this.$nextTick(() => {
        this.legendVisible = false
        this.geojson = {
          type: 'FeatureCollection',
          features: []
        }
        this.mapBounds = this.$refs.temperatureMap.mapObject.getBounds()
        const center =  this.$refs.temperatureMap.mapObject.getCenter()

        this.centerLat = center.lat
        this.centerLng = center.lng
        this.setCoordsArrays()
      })      
    },
    setCoordsArrays() {
      const stepX = +(this.mapBounds._northEast.lng - this.mapBounds._southWest.lng) / (this.xPointsData - 1)
      const stepY = +(this.mapBounds._northEast.lat - this.mapBounds._southWest.lat) / (this.yPointsData - 1)
      const stepXsmall = stepX / +this.splitLevel
      const stepYsmall = stepY / +this.splitLevel

      this.dataCoordsArray = []
      this.dataAreasArray = []
      this.viewCoordsArray = []

      for( let i = 0; i < this.yPointsData; i++) {
        for( let j = 0; j < this.xPointsData; j++) {
          this.dataCoordsArray.push([(this.mapBounds._southWest.lng + j*stepX), (this.mapBounds._northEast.lat - i*stepY)])
        }
      }
      let squareNum = 0

      this.dataCoordsArray.forEach((point, num) => {
        if((num+1)%this.xPointsData === 0) return
        if(num > (this.dataCoordsArray.length - this.xPointsData - 1)) return

        this.dataAreasArray.push([num, num+1, num+this.xPointsData, num+this.xPointsData+1])
        for( let i = 0; i < +this.splitLevel; i++) {
          for( let j = 0; j < +this.splitLevel; j++) {
            const baseCorner = [(point[0] + j*stepXsmall), (point[1] - i*stepYsmall)]

            this.viewCoordsArray.push(
              { 
                type: "Feature",
                properties: {
                  square: squareNum,
                  style: {
                    stroke: false,
                    fillOpacity: 0.5
                  }
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [        
                    [
                      baseCorner,
                      [baseCorner[0]+stepXsmall, baseCorner[1]],
                      [baseCorner[0]+stepXsmall, baseCorner[1]+stepYsmall],
                      [baseCorner[0], baseCorner[1]+stepYsmall],
                      baseCorner
                    ]
                  ]
                }
              }
            )
          }
        }
        squareNum += 1
      })
    },
    async getNewTemperatureData() {
      this.isLoading = true

      let tempArray = []

      this.minTemp = null
      this.maxTemp = null
      for( let i = 0; i < this.dataCoordsArray.length; i++) {
        let resp = await this.$axios.get(`?lat=${this.dataCoordsArray[i][1]}&lon=${this.dataCoordsArray[i][0]}&APPID=${API_KEY}`)
        let temp = resp.data.main.temp - ZERO
        
        this.minTemp = this.minTemp && this.minTemp < temp? this.minTemp: temp
        this.maxTemp = this.maxTemp && this.maxTemp > temp? this.maxTemp: temp 
        tempArray.push(temp)
      }

      this.viewCoordsArray.forEach(point => {
        const areaCoords = point.properties.square
        const corners = this.dataAreasArray[point.properties.square].map(i => this.dataCoordsArray[i])
        const temps = this.dataAreasArray[point.properties.square].map(i => tempArray[i])
        const coords = point.geometry.coordinates[0][0]

        const localTemp = interpolate(corners, temps, coords)
        const fillColor = setFillColor(this.minTemp, this.maxTemp, localTemp, this.colorLevels)

        point.properties.style.fillColor = fillColor
      })
      this.legendVisible = true
      this.isLoading = false

      return JSON.parse(JSON.stringify(this.viewCoordsArray))
    }
  }
}
</script>

<style scoped lang="scss">
.map {
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  &__title {
    margin-bottom: 10px;
    font-size: 17px;
    font-weight: 500;
    color: #555;
  }

  &__controls {
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: normal;
    color: #555; 

    &__control {
      margin-left: 5px;
      margin-right: 5px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      &__label {
        margin-right: 5px;
      }
      &__input {
        text-align: center;
        width: 40px;
      }
    }
  }

  &__container {
    width: 600px;
    height: 400px;
  }

  &__button {
    box-sizing: border-box;
    margin-top: 10px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    font-weight: 400;
    background: #99f;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    &.disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }
  }
}

</style>
