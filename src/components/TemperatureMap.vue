<template>
  <div class="map">
    <h3>TEST</h3>

    <l-map 
      class="map__container" 
      ref="temperatureMap" 
      :zoom="zoom" 
      :center="center" 
      :options="{zoomControl: false}"
    >
      <l-tile-layer :url="url" />
      <l-geo-json 
        ref="geoJson" 
        :geojson="geojson" 
        :optionsStyle="tileStyles"
        :zIdex="1000"
      />      
    </l-map>

    <div 
      class="map__button"
      @click="handleButtonClick"
    >
      SHOW TEMPERATURE
    </div> 
  </div>
</template>

<script>
import { LMap, LTileLayer, LGeoJson } from 'vue2-leaflet';

export default {
  components: {
    LMap,
    LTileLayer,
    LGeoJson
  },
  data() {
    return {
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      zoom: 11,
      centerLat: 55.7422, 
      centerLng: 37.5719,
      mapBounds: null,
      geojson: null
    };
  },
  computed: {
    center() {
      return [this.centerLat, this.centerLng]
    }
  },
  mounted () {
    this.$nextTick(() => {
       this.mapBounds = this.$refs.temperatureMap.mapObject.getBounds()
    })
  },
  methods: {
    handleButtonClick() {
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {  
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  this.center,
                  [this.mapBounds._southWest.lat, this.center[1]],
                  [this.mapBounds._southWest.lat, this.mapBounds._southWest.lng],
                  [this.center[0], this.mapBounds._southWest.lng]
                ]
              ]
            },
            properties: {
              style: {
                fillColor: "red",
                fillOpacity: 0.5
              }
            }
          },
          {
           "type": "Feature",
           "geometry": {
               "type": "Polygon",
               "coordinates": [
                   [
                      this.center,
                      [this.mapBounds._northEast.lat, this.center[1]],
                      [this.mapBounds._northEast.lat, this.mapBounds._northEast.lng],
                      [this.center[0], this.mapBounds._northEast.lng],
                      this.center
                   ]
               ]
           },
            properties: {
              style: {
                fillColor: "#BD0026",
                fillOpacity: 0.5
              }
            }
          }
        ]
      }

      this.geojson = geojson
    },
    tileStyles(feature) {

      debugger

      if (!feature.properties) feature.properties = {}
      if (!feature.properties.style) feature.properties.style = {}

      return feature.properties.style
    }
  }
}
</script>

<style scoped lang="scss">
.map__container {
  width: 600px;
  height: 400px;
}
</style>
