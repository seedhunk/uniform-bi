<script setup>
import { ref, onMounted } from 'vue'
import { getRule } from '@/api/rule.js'

//获取img列表
const data = ref()
const allData = ref()
const total = ref()
const getList = async (page, count) => {
  const res = await getRule(page, count)
  data.value = res.data
  allData.value = res.data
  total.value = res.len
}

//响应式逻辑
const tabelHeight = ref()
const changeDate = () => {
  if (document.body.clientWidth <= 1480) {
    num.value = 8
    tabelHeight.value = '62vh'
  } else {
    num.value = 12
    tabelHeight.value = '68vh'
  }
}

onMounted(() => {
  changeDate()
  getList(1, num.value)
})

window.addEventListener('resize', () => {
  changeDate()
  getList(1, num.value)
})

// 分页后再次调接口(后端分页)
var page = 1
const num = ref()
const onPageChange = (index) => {
  page = index
  getList(page, num.value)
}

//name筛选
const searchName = ref()
const search = () => {
  data.value = allData.value.filter((item) =>
    item.name.includes(searchName.value)
  )
}
const cancelSearch = () => {
  data.value = allData.value
  searchName.value = ''
}

//action
const isModalActive = ref(false)
const selectTitle = ref()
const subData = ref()
const subKeys = ref([])
const mode = ref()
const showProfile = (parm, title, index) => {
  selectTitle.value = title
  subData.value = parm
  mode.value = index
  if (index === 1) {
    for (const key in parm) {
      subKeys.value.push(key)
    }
  }
  isModalActive.value = true
}
</script>

<template>
  <div class="rcMain">
    <input
      class="rcMain-input"
      placeholder="Name Search"
      id="input"
      v-model="searchName"
      @keyup.enter="search()"
      autocomplete="off"
    />
    <b-icon icon="close-circle" @click="cancelSearch()" id="icon"></b-icon>
    <b-field class="rcMain-table">
      <b-table
        :data="data"
        :mobile-cards="false"
        :paginated="true"
        :per-page="num"
        @page-change="onPageChange"
        :total="total"
        backend-pagination
        :sticky-header="true"
        pagination-position="bottom"
        :height="tabelHeight"
      >
        <b-table-column field="name" label="Rule name" width="200" centered>
          <template v-slot="props">
            {{ props.row.name }}
          </template>
        </b-table-column>

        <b-table-column label="AbsFitValue2FitValue" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="
                showProfile(
                  JSON.parse(props.row.screen_rule).absFitValue2FitValue,
                  'AbsFitValue2FitValue / ' + props.row.name,
                  0
                )
              "
            >
              View absFitValue2FitValue
            </span>
          </template>
        </b-table-column>

        <b-table-column label="IdealEase" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="
                showProfile(
                  JSON.parse(props.row.screen_rule).idealEase,
                  'IdealEase / ' + props.row.name,
                  1
                )
              "
            >
              View idealEase
            </span>
          </template>
        </b-table-column>

        <b-table-column label="AllWeighting" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="
                showProfile(
                  JSON.parse(props.row.screen_rule).allWeighting,
                  'AllWeighting / ' + props.row.name,
                  1
                )
              "
            >
              View allWeighting
            </span>
          </template>
        </b-table-column>

        <b-table-column label="EaseThreshold" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="
                showProfile(
                  JSON.parse(props.row.screen_rule).easeThreshold,
                  'EaseThreshold / ' + props.row.name,
                  1
                )
              "
            >
              View easeThreshold
            </span>
          </template>
        </b-table-column>

        <b-table-column label="Size code to name" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="
                showProfile(
                  JSON.parse(props.row.size_code_to_name),
                  'Size code to name / ' + props.row.name,
                  1
                )
              "
            >
              View size code to name
            </span>
          </template>
        </b-table-column>

        <b-modal v-model="isModalActive" has-modal-card :canCancel="['button']">
          <b-field class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title">
                {{ selectTitle }}
              </p>
              <button
                type="button"
                class="delete"
                @click="isModalActive = false"
              />
            </header>
            <section class="modal-card-body">
              <b-field v-if="mode === 0">
                <b-table
                  :data="subData"
                  :mobile-cards="false"
                  :paginated="true"
                  :per-page="6"
                  :sticky-header="true"
                  pagination-position="bottom"
                  height="50vh"
                >
                  <b-table-column label="absFitValueName" width="150" centered>
                    <template v-slot="props">
                      {{ props.row.absFitValueName }}
                    </template>
                  </b-table-column>

                  <b-table-column label="fitValueName" width="150" centered>
                    <template v-slot="props">
                      {{ props.row.fitValueName }}
                    </template>
                  </b-table-column>

                  <b-table-column label="easeValueName" width="150" centered>
                    <template v-slot="props">
                      {{ props.row.easeValueName }}
                    </template>
                  </b-table-column>

                  <b-table-column label="fitValueName" width="150" centered>
                    <template v-slot="props">
                      {{ props.row.fitValueName }}
                    </template>
                  </b-table-column>

                  <b-table-column label="rangeNode" width="200" centered>
                    <template v-slot="props">
                      {{ props.row.rangeNode }}
                    </template>
                  </b-table-column>

                  <b-table-column label="rangeWeight" width="200" centered>
                    <template v-slot="props">
                      {{ props.row.rangeWeight }}
                    </template>
                  </b-table-column>

                  <template #empty>
                    <div class="has-text-centered">No records</div>
                  </template>
                </b-table>
              </b-field>

              <b-field v-else>
                <div
                  class="modal-card-body-line"
                  v-for="(item, index) in subData"
                  :key="index"
                >
                  <p>{{ index }}</p>
                  <p>:</p>
                  <p>{{ item }}</p>
                </div>
              </b-field>
            </section>
          </b-field>
        </b-modal>

        <template #empty>
          <div class="has-text-centered">No records</div>
        </template>
      </b-table>
    </b-field>
  </div>
</template>

<style lang="scss" scoped>
@import '@/utils/commonCss/scheme.scss';

::v-deep .table thead > tr {
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

::v-deep .table tbody > tr {
  font-size: 16px;

  & > td {
    vertical-align: middle;
  }
}

.rcMain {
  height: 100%;
  width: 100%;
  padding: 16px 60px 0;
  position: relative;

  &-input {
    position: absolute;
    width: 300px;
    height: 40px;
    border: 1px solid $primary;
    border-radius: 5px;
    text-indent: 10px;
    color: $black;

    &:focus {
      outline: 1px solid $primary;
    }
  }

  .icon {
    position: absolute;
    opacity: 0.25;
    left: 330px;
    top: 25px;
    cursor: pointer;
  }

  &-table {
    position: absolute;
    top: 72px;
    width: 90%;

    &-total {
      position: absolute;
      bottom: 0;
      font-size: 20px;
    }

    .sed {
      color: $light;
      background-color: $secondary;
      height: 30px;
      font-size: 14px;
      margin-left: 10px;
      cursor: pointer;
    }

    ::v-deep .has-addons {
      flex-direction: column;
    }
  }
}

.modal-card {
  border-radius: 5px;

  &-head {
    background-color: #7957d5;
  }

  &-title {
    font-size: 24px;
    color: $light;
    font-weight: 600;
    margin-right: 100px;
  }

  ::v-deep .pagination {
    flex-wrap: nowrap;
  }

  &-body {
    &-line {
      display: flex;
      justify-content: space-between;
    }
    p {
      font-size: 20px;
    }

    p:nth-child(1) {
      flex: 1;
    }

    p:nth-child(3) {
      display: flex;
      justify-content: end;
      flex: 1;
    }
  }
}
</style>
