<template>
  <div class="hello">
    <li v-for="(item,index) in imgDataList"
        :key="index">
      <img :src="item.url"
           style="width:300px;height:auto;cursor: zoom-in"
           @click="showViewer(index)"></li>
    <ImgPreview :viewerVisible.sync="viewerVisible"
                :imgDataList.sync="imgDataList"
                :imgIndex.sync="imgIndex"
                ref="ImgPreview"></ImgPreview>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ImgPreview from './ImgPreview/ImgPreview.vue';

@Component({
  components: {
    ImgPreview,
  },
})
export default class HelloWorld extends Vue {
  public viewerVisible: boolean = false; // 子组件中viewer的可见性
  public imgIndex: number = 100; // 图片的索引
  public imgDataList: any[] = [
    { title: 'secend', url: require('./testImg/261652.jpg'), id: 2 },
    { title: 'third', url: require('./testImg/164F25161-2.jpg'), id: 3 },
    { title: 'four', url: './testImg/596296.jpg', id: 4 },
    { title: 'five', url: require('./testImg/timg.jpg'), id: 5 },
    { title: 'six', url: require('./testImg/245484.jpg'), id: 6 },
  ]; // 得到的img的blob数据
  public showViewer(index: number) {
    this.imgIndex = index;
    setTimeout(() => {
      this.viewerVisible = true;
      (this.$refs.ImgPreview as any).init(this.imgIndex);
    }, 0)
  }
}
</script>

