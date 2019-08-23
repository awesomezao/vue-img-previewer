<template>
  <div>
    <transition name="main">
      <div id="ImgPreview"
           ref="ImgPreview"
           v-show="viewerVisibleShow"
           @mousewheel="stopEvent">
        <!-- 预览窗的title-->
        <div class="titleBar"
             ref="titleBar">
          <div class="imgName">{{imgName}}</div>
          <div><img src="./img/close.png"
                 class="closeBtn"
                 @click="visible()"></div>
        </div>
        <!--左右按钮-->
        <div class="pre"
             ref="preCover"><img src="./img/pre.png"
               @click="prevImg"
               ref="preBtn"></div>
        <div class="next"
             ref="nextCover"><img src="./img/next.png"
               @click="nextImg"
               ref="nextBtn"></div>
        <!-- 预览的图片区域-->
        <div id="imgPreview">
          <!--加载动画-->
          <div class="loading"
               v-if="loading">
            <svg version="1.1"
                 id="loader-1"
                 x="0px"
                 y="0px"
                 width="40px"
                 height="40px"
                 viewBox="0 0 50 50"
                 style="enable-background:new 0 0 50 50;"
                 xml:space="preserve">
              <path fill="#000"
                    d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
                    fill:grey>
                <animateTransform attributeType="xml"
                                  attributeName="transform"
                                  type="rotate"
                                  from="0 25 25"
                                  to="360 25 25"
                                  dur="1s"
                                  repeatCount="indefinite" />
              </path>
            </svg>
          </div>
          <div class="imgContainer"
               ref="imgContainer">
            <img @mousedown.capture.self="mousedown"
                 @mouseup="mouseup"
                 @mousewheel="mousewheel"
                 class="img"
                 ref="img"
                 :src="imgSrc"
                 :style="{width:imgWidth+'px',height:imgHeight+'px'}" />
          </div>
        </div>
        <!--预览窗的功能区-->
        <div class="toolBar"
             ref="toolBar">
          <div class="btnGroup">

            <div><img src="./img/rotate.png"
                   @click="rotateImg"></div>
            <div><img src="./img/reset.png"
                   @click="reset"></div>
            <div><img src="./img/download.png"
                   @click="download"></div>
          </div>
        </div>
        <!--end-->
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import './index.scss';
import { Component, Prop, Vue, Watch, Provide } from 'vue-property-decorator';

@Component({})
export default class ImgPreview extends Vue {
  @Prop() public viewerVisible!: boolean;
  @Prop() public imgDataList!: any[];
  @Prop() public imgIndex!: number;

  public locationData: any = { // 鼠标在img内的位置
    isMove: '', //是否移动
    startX: '', //鼠标按下时距离窗口的X轴距离
    startY: '', //鼠标按下时距离窗口的Y轴距离
    endX: '', //move停下时距离窗口的X轴距离
    endY: '', //move停下时距离窗口的Y轴距离
    imgLeft: '', //鼠标点距离窗口的left
    imgTop: '', //鼠标点距离窗口的top
    distanceX: 0, //鼠标点距离窗口的X距离
    distanceY: 0, //鼠标点距离窗口的Y距离
  };
  public rotateDeg: number = 0; // 旋转角度
  public preImgData!: any;//预加载后图片的数组
  public imgSrc: string = ''; // 预览图片的src
  public scaleSize: number = 0;//缩放系数
  public imgName: string = 'loading error';//图片名
  public imgWidth: number = 0;//图片的宽度
  public imgHeight: number = 0;//图片的高度
  public imgw: number = 0;//图片的clientWidth
  public imgh: number = 0;//图片的clientHeight
  public imgContainerWidth: number = 0;//图片容器的clientHeight
  public imgContainerHeight: number = 0;//图片容器的clientHeight
  public imgDataListLength!: number; // 数组的长度
  public loading: boolean = false; // 加载动画
  public error: boolean = false; // 错误图片的加载状态
  public snapImgIndex!: number; // 在调用Retry的临时数据
  public preloadImgData: any[] = [];//预加载后图片的数据

  // 组件的可见性
  get viewerVisibleShow(): boolean {
    return this.viewerVisible;
  }

  set viewerVisibleShow(value) {
    this.$emit('update:viewerVisible', value);
  }

  //imgContainer节点
  get imgContainer(): any {
    return this.$refs.imgContainer
  }

  //imgElement的节点
  get imgElement(): any {
    return this.$refs.img;
  }
  //imgElement的样式
  get imgStyle(): any {
    return this.imgElement.style;
  }

  // img的索引
  get imgI(): number {
    return this.imgIndex;
  }

  set imgI(value) {
    this.$emit('update:imgIndex', value);
  }

  // img的url数据
  get imgData(): any[] {
    return this.imgDataList;
  }

  set imgData(value) {
    this.$emit('update:imgDataList', value);
  }



  // 预览窗viewer的显示
  public visible() {
    this.cleanData();
    setTimeout(() => { this.viewerVisibleShow = false; }, 0)
  }

  // 清除数据
  public cleanData() {
    const arr = this.$data;
    for (const key in arr) {
      if (arr.hasOwnProperty(key)) {
        if (typeof (arr[key]) !== 'object') {
          if (typeof (arr[key]) === 'string' && key !== 'imgName') {
            this.changeData(key, 'string', this)
          };
          if (key === 'imgName') {
            this.changeData(key, 'imgName', this)
          };
          if (typeof (arr[key]) === 'number') {
            this.changeData(key, 'number', this)
          };
          if (typeof (arr[key]) === 'boolean') {
            this.changeData(key, 'boolean', this)
          };
        }
      }
    }
  }

  //修改值
  public changeData(key: any, type: any, that: any) {
    if (type === 'string') {
      that[key] = '';
    }
    if (type === 'number') {
      that[key] = 0;
    }
    if (type === 'boolean') {
      that[key] = false;
    }
    if (type === 'imgName') {
      that[key] = 'loading error';
    }
  }

  //得到元素的offsetTop/offsetLeft
  public getOffset(e: any) {
    var left = 0,
      top = 0
    while (e != null && e != document.body) {
      top += e.offsetTop
      left += e.offsetLeft
      e = e.offsetParent
    }
    return {
      left: left,
      top: top
    }
  }

  //节流
  public throttle(func: any, wait: any) {
    let timeout: any;
    let that: any = this;
    return function () {
      let context = that;
      let args = arguments;
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func.apply(context, args)
        }, wait)
      }

    }
  }

  //处理鼠标移出异常
  public moveupError() {
    this.visible();
  }

  //鼠标按下事件
  public mousedown(e: any) {
    if (e.which === 1 && e.target && e.target === this.imgElement) {
      this.locationData.isMove = true;
      // console.log('down')
      this.imgStyle.cursor = 'move';
      this.locationData.startX = e.clientX;
      this.locationData.startY = e.clientY;
      e.preventDefault();
      (this.$refs.titleBar as any).addEventListener('mouseup', this.moveupError);
      (this.$refs.toolBar as any).addEventListener('mouseup', this.moveupError);

      window.addEventListener('mousemove', this.throttle(this.mousemove, 10));
      window.addEventListener('mouseup', this.mouseup);

    }
  }

  //移出事件
  public removeEvent() {
    (this.$refs.titleBar as any).removeEventListener('mouseup', this.moveupError);
    (this.$refs.toolBar as any).removeEventListener('mouseup', this.moveupError);
  }

  //鼠标松开事件
  public mouseup(e: any) {
    if (e.which !== 1) {
      return
    };
    this.imgStyle.cursor = 'default'
    this.locationData.isMove = false
    if (typeof this.locationData.imgLeft !== 'undefined') {
      this.locationData.distanceX = this.locationData.imgLeft
      this.locationData.distanceY = this.locationData.imgTop
    };
    this.removeEvent();
    e.preventDefault();
  }

  //鼠标移动事件
  public mousemove(e: any) {
    if (e.which !== 1) {
      return
    }
    if (this.locationData.isMove && !this.error) {
      // console.log('d');
      e.preventDefault()
      this.imgStyle.cursor = 'move';
      this.locationData.endX = e.clientX;
      this.locationData.endY = e.clientY;
      this.locationData.imgLeft = this.locationData.distanceX + this.locationData.endX - this.locationData.startX;
      this.locationData.imgTop = this.locationData.distanceY + this.locationData.endY - this.locationData.startY;
      this.imgStyle.left = this.locationData.imgLeft + 'px';
      this.imgStyle.top = this.locationData.imgTop + 'px';
    }
  }

  //鼠标滚动事件
  public mousewheel(e: any) {
    // console.log('滚动')
    //以鼠标为中心缩放，同时进行位置调整
    var deltaY = 0
    var x = e.clientX
    var y = e.clientY
    e.preventDefault();

    if (e.target && !this.error && e.target === this.imgElement) {
      var l = this.getOffset(this.imgContainer)
      x = x - l.left
      y = y - l.top

      var scaleNum = e.wheelDelta / 1200
      var snapScaleSize = this.scaleSize //暂存缩放系数
      snapScaleSize += scaleNum
      snapScaleSize =
        snapScaleSize < 0.2 ?
          0.2 :
          snapScaleSize > 5 ?
            5 :
            snapScaleSize //可以缩小到0.2,放大到5倍
      //计算位置，以鼠标所在位置为中心
      //以每个点的x、y位置，计算其相对于图片的位置，再计算其相对放大后的图片的位置
      this.locationData.distanceX =
        this.locationData.distanceX -
        ((x - this.locationData.distanceX) * (snapScaleSize - this.scaleSize)) / this.scaleSize
      this.locationData.distanceY =
        this.locationData.distanceY -
        ((y - this.locationData.distanceY) * (snapScaleSize - this.scaleSize)) / this.scaleSize
      this.scaleSize = snapScaleSize //更新倍率
      //改变位置和大小
      // this.imgStyle.transition='all 0.2s ease'
      this.imgStyle.width = this.imgw * snapScaleSize + 'px'
      this.imgStyle.height = this.imgh * snapScaleSize + 'px'
      this.imgStyle.top = this.locationData.distanceY + 'px'
      this.imgStyle.left = this.locationData.distanceX + 'px'
    }
  }

  //处理滚动阴影区时，背景一起滚动
  public stopEvent(e: any) {
    //等会处理节流
    e.preventDefault();
  }

  // 旋转图片
  public rotateImg() {
    console.log('旋转');
    if (this.error === false) {
      this.rotateDeg = this.rotateDeg >= 360 ? 90 : this.rotateDeg + 90;
      this.imgStyle.transform = 'rotate(' + this.rotateDeg + 'deg)';
      // this.imgStyle.transition='all 0.5s ease'
    } else {
      return false;
    }

  }

  // 重置图片位置
  public reset() {
    var pW, pH;//imgContainer的宽高暂存值
    // 以完全显示图片为基准,如果改为>，则为以铺满屏幕为基准
    // 我设置的默认为<即img宽度填充imgContainer
    if (this.imgContainerWidth / this.imgContainerHeight < this.imgw / this.imgh) {
      pW = this.imgContainerWidth
      pH = (this.imgh * this.imgContainerWidth) / this.imgw
      this.locationData.distanceX = 0
      this.locationData.distanceY = -(pH - this.imgContainerHeight) / 2
      this.scaleSize = this.imgContainerWidth / this.imgw //初始比率
    } else {
      pW = (this.imgw * this.imgContainerHeight) / this.imgh
      pH = this.imgContainerHeight
      this.locationData.distanceX = -(pW - this.imgContainerWidth) / 2
      this.locationData.distanceY = 0
      this.scaleSize = this.imgContainerHeight / this.imgh
    }
    //重置图片的大小，位置
    this.imgStyle.width = pW + 'px'
    this.imgStyle.height = pH + 'px'
    this.imgStyle.left = this.locationData.distanceX + 'px'
    this.imgStyle.top = this.locationData.distanceY + 'px'
    // 重置角度
    if (this.rotateDeg === 0) {
      this.rotateDeg = 0;
    } else if (this.rotateDeg === 90) {
      this.rotateDeg = 360;
    } else if (this.rotateDeg === 180) {
      this.rotateDeg = 360;
    } else if (this.rotateDeg === 270) {
      this.rotateDeg = 360;
    } else {
      this.rotateDeg = 0;
    }
    this.imgStyle.transform = 'rotate(' + this.rotateDeg + 'deg)';
  }

  //  上一张图
  public prevImg() {
    if (this.imgI === 0) {
      return;
    } else {
      this.cleanData();
      this.changeLoading(true);

      this.imgDataListLength = this.imgData.length;
      this.imgI -= 1;
      const imgDataNext: any[] = this.preloadImgData;
      const indexNext: number = this.imgI;
      this.init(indexNext - 1);
    }
  }

  // 下一张图
  public nextImg() {
    let imgDataLength: number = this.imgData.length;
    if (this.imgI === imgDataLength - 1) {
      return;
    } else {
      this.cleanData();
      this.changeLoading(true);

      this.imgDataListLength = this.imgData.length;
      this.imgI += 1;
      const imgDataNext: any[] = this.preloadImgData;
      const indexNext: number = this.imgI;
      this.init(indexNext + 1);
    }

  }


  //改变左右切换按钮的样式
  public changeBtn(index: number) {
    (this.$refs.preBtn as any).style.filter = 'contrast(100%)';
    (this.$refs.nextBtn as any).style.filter = 'contrast(100%)';
    (this.$refs.preBtn as any).style.cursor = 'pointer';
    (this.$refs.nextBtn as any).style.cursor = 'pointer';
    let imgDataLength: number = this.imgData.length;
    if (index === 0) {
      (this.$refs.preBtn as any).style.filter = 'contrast(1%)';
      (this.$refs.preBtn as any).style.cursor = 'default';
    }
    if (index === imgDataLength - 1) {
      (this.$refs.nextBtn as any).style.filter = 'contrast(1%)';
      (this.$refs.nextBtn as any).style.cursor = 'default';
    }
  }

  //初始化
  public init(index: number) {
    this.changeBtn(index);
    this.changeLoading(true);
    this.setPreviewImg(index);
  }

  //初始化img和imgContainer的信息
  public initImgMsg(index: number) {
    if (this.preloadImgData[index].error === true) {
      this.error = true;
      //处理图片加载错误，点击重试
      this.retry();
    } else {
      this.error = false;
      //清除图片重试点击事件
      this.cleanRetry();
    };
    //初始化装载容器的宽高,为了测试，我默认设置的图片的1/4,可以自己改
    this.imgContainerWidth = this.preloadImgData[index].width / 4;
    this.imgContainerHeight = this.preloadImgData[index].height / 4;
    let ctop: number = this.imgContainerHeight / 2;
    let cleft: number = this.imgContainerWidth / 2;
    this.imgContainer.style.cssText = 'top:calc(50% - ' + ctop + 'px);left:calc(50% - ' + cleft + 'px)';
    //初始化图片的宽高
    this.imgWidth = this.preloadImgData[index].width / 4;
    this.imgHeight = this.preloadImgData[index].height / 4;
    //初始化图片的src和name
    this.imgSrc = this.preloadImgData[index].url;
    this.imgName = this.preloadImgData[index].title;
    //初始化imgw和imgh，方便后面计算
    this.imgw = this.imgWidth;
    this.imgh = this.imgHeight;
    //初始化图片加载的错误状态
    this.snapImgIndex = index;

  }


  // 下载图片
  public download() {
    this.getBase64(this.imgI).then((s:any)=>{
      let aLink=document.createElement('a');
      aLink.download=s.name;
      aLink.href=s.base64;
      aLink.click();
    }).catch((f:any)=>{
       console.log(`下载失败`)
    })
  }

  // 改变loading状态
  public changeLoading(status: boolean) {
    this.loading = status;
  }


  // 设置预览图片
  public setPreviewImg(index: number) {
    this.preloadImg(index).then((s) => {
      this.initImgMsg(index);
      this.reset();
      this.changeLoading(false)
    }).catch((f) => {
      this.initImgMsg(index);
      this.reset();
      this.changeLoading(false)
    });
  }

  //预加载
  public preloadImg(index: number) {
    let imgData: any[] = this.imgData;
    let canvas: any = document.createElement('canvas');
    const ctx: any = canvas.getContext('2d');
    let snapData !: any;
    let img = new Image();
    img.src = imgData[index].url;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        snapData = { title: imgData[index].title, url: imgData[index].url, id: imgData[index].id, width: img.width, height: img.height, error: false };
        this.preloadImgData[index] = snapData;

        resolve(true);
      };

      img.onerror = () => {
        snapData = { title: 'loading error', url: require('./img/error.png'), id: imgData[index].id, width: 128, height: 128, error: true };
        this.preloadImgData[index] = snapData;

        reject(false);
      };

    })
  }

  //改变图片加载状态
  public changeImgStatus(index: any) {
    let imgData: any[] = this.imgData;
    let snapData !: any;
    snapData = { title: 'loading error', url: '/img/error.png', id: imgData[index].id, width: 128, height: 128, error: false };
    this.preloadImgData[index] = snapData;
    this.cleanData();
    this.initImgMsg(index);
  }

  //调用retry
  public handleRetry() {
    this.init(this.snapImgIndex);
  }

  //清除图片重试点击事件
  public cleanRetry() {
    this.imgStyle.cursor = 'default';
    this.imgElement.removeEventListener('click', this.handleRetry)
  }

  //加载重试
  public retry() {
    this.cleanData();
    this.imgStyle.cursor = 'pointer';
    this.imgElement.addEventListener('click', this.handleRetry)
  }



  //imgUrl转canvas，生成base64
  public getBase64(index: number) {
    let img: any = new Image();
    let base64!: string;
    let name!:string;
    let base64Arry:any={};
    let canvas: any = document.createElement('canvas');
    const ctx: any = canvas.getContext('2d');
    img.src = this.preloadImgData[index].url;

    return new Promise((resolve, reject) => {
      if (this.preloadImgData[index].error !== true) {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          base64 = canvas.toDataURL('image/jpeg');
          name=this.preloadImgData[index].title;
          base64Arry={
            base64:base64,
            name:name,
          }
          resolve(base64Arry)
        };
        img.onerror = () => {
          reject(false)
        };

      } else { reject(false) }
    })

  }

  //得到图片blob
  public getBlob(index: number) {
    let base64!: string;
     this.getBase64(this.imgI).then((s:any)=>{
      base64=s.base64;
      this.dataURLtoBlob(base64);
    }).catch((f:any)=>{
      base64=f
    });
  }

  // base64转blob
  public dataURLtoBlob(dataurl: string) {
      const arr: any = dataurl.split(',');
      const mime: any = arr[0].match(/:(.*?);/)[1];
      const bstr: any = atob(arr[1]);
      let n: number = bstr.length;
      const u8arr: any = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {
        type: mime,
      });
  }

}
</script>

<style lang="scss" scoped>
.main-enter,
.main-leave-to {
  opacity: 0;
}

.main-enter-active,
.main-leave-active {
  transition: all 0.4s ease;
}
</style>