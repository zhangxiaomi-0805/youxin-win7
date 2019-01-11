<template>
<transition name="fade">
  <div class="d-contain" v-show="showPicker">
    <vuejs-datepicker 
      :value="date" 
      :inline="true" 
      :language="zh"
      @selected="modifyDate"
    />
  </div>
</transition>
</template>

<script>
  import vuejsDatepicker from 'vuejs-datepicker'
  import { zh } from 'vuejs-datepicker/dist/locale'
  export default {
    name: 'date-picker',
    components: { vuejsDatepicker },
    props: {
      callback: Function
    },
    data () {
      return {
        zh,
        date: new Date(),
        showPicker: false
      }
    },
    methods: {
      initStatus () {
        this.showPicker = !this.showPicker
      },
      modifyDate (date) {
        this.date = date
        this.showPicker = false
        let year = new Date(date).getFullYear()
        let month = new Date(date).getMonth() + 1
        let day = new Date(date).getDate()
        this.callback([year, month, day])
      }
    }
  }
</script>

<style>
  .d-contain {
    position: absolute;
    left: 240px;
    top: 80px;
    z-index: 100;
  }

  .d-contain .vdp-datepicker {
    width: 280px;
    background:rgba(255,255,255,1);
    box-shadow:0px 6px 14px 0px rgba(0,0,0,0.12);
    border-radius:4px 0px 0px 0px;
    border:1px solid rgba(0,0,0,0.2);
    font-size: 13px;
  }

  .d-contain .vdp-datepicker__calendar {
    width: 280px;
    border: none;
  }

  .d-contain .vdp-datepicker .vdp-datepicker__calendar .cell.day {
    border-radius: 50%;
    height: 39px;
    line-height: 38px;
  }

  .d-contain .vdp-datepicker .vdp-datepicker__calendar .cell.selected:hover {
    background: #FFC200;
  }

  .vdp-datepicker__calendar .cell.selected {
    background: #FFC200;
    color: #fff;
  }

  .vdp-datepicker__calendar .cell,
  .vdp-datepicker__calendar header .month__year_btn,
  .vdp-datepicker__calendar header .day__month_btn,
  .vdp-datepicker__calendar header .prev,
  .vdp-datepicker__calendar header .next {
    transition: all .2s linear;
  }

  .vdp-datepicker__calendar header .prev::after {
    border-right: 8px solid #666;
    
  }
  .vdp-datepicker__calendar header .next::after {
    border-left: 8px solid #666;
  }
</style>
