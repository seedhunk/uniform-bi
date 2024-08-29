<script setup>
import { ref, onMounted } from 'vue'
import { getCus, getPro, getHis } from '@/api/customer.js'

//获取img列表
const data = ref()
const allData = ref()
const total = ref()
const getList = async (page, count) => {
  const res = await getCus(page, count)
  data.value = res[0]
  allData.value = res[0]
  total.value = res[1]
  console.log(res)
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
  data.value = allData.value.filter((item) => {
    if (item.nickname) {
      return item.nickname.includes(searchName.value)
    } else {
      return false
    }
  })
}
const cancelSearch = () => {
  data.value = allData.value
  searchName.value = ''
}

//action
const isModalActive = ref(false)
const mode = ref()
const selectName = ref()
const subData = ref()
const showProfile = async (id, name) => {
  const res = await getPro(id)
  subData.value = res
  //   console.log(res)
  mode.value = 1
  selectName.value = name
  isModalActive.value = true
}
const showHistory = async (id, name) => {
  const res = await getHis(id)
  subData.value = res
  console.log(res)
  mode.value = 2
  selectName.value = name
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
        <b-table-column
          field="nickname"
          label="Customer account"
          width="200"
          centered
        >
          <template v-slot="props">
            {{ props.row.account }}
          </template>
        </b-table-column>

        <b-table-column field="email" label="Email" width="250" centered>
          <template v-slot="props">
            {{ props.row.email ? props.row.email : 'N/A' }}
          </template>
        </b-table-column>

        <b-table-column field="action" label="Profile" width="150" centered>
          <template v-slot="props">
            <span
              class="tag sed"
              @click="showProfile(props.row.id, props.row.account)"
            >
              View profile
            </span>
          </template>
        </b-table-column>

        <b-table-column
          field="action"
          label="Purchase history"
          width="150"
          centered
        >
          <template v-slot="props">
            <span
              class="tag sed"
              @click="showHistory(props.row.id, props.row.account)"
            >
              View history
            </span>
          </template>
        </b-table-column>

        <b-modal v-model="isModalActive" has-modal-card :canCancel="['button']">
          <b-field class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title">
                {{ selectName }} /
                {{ mode === 1 ? 'All profiles' : 'Purchase history' }}
              </p>
              <button
                type="button"
                class="delete"
                @click="isModalActive = false"
              />
            </header>
            <section class="modal-card-body">
              <b-field>
                <b-table
                  :data="subData"
                  :mobile-cards="false"
                  :paginated="true"
                  :per-page="6"
                  :sticky-header="true"
                  pagination-position="bottom"
                  height="50vh"
                >
                  <b-table-column
                    :field="mode === 1 ? 'id' : 'code'"
                    :label="mode === 1 ? 'Profile ID' : 'Order number'"
                    width="150"
                    centered
                  >
                    <template v-slot="props">
                      {{ mode === 1 ? props.row.id : props.row.code }}
                    </template>
                  </b-table-column>

                  <b-table-column
                    :field="mode === 1 ? 'ENGname' : 'created_time'"
                    :label="mode === 1 ? 'English Name' : 'Order time'"
                    width="200"
                    centered
                    sortable
                  >
                    <template v-slot="props">
                      {{
                        mode === 1 ? props.row.ENGname : props.row.created_time
                      }}
                    </template>
                  </b-table-column>

                  <b-table-column
                    :field="mode === 1 ? 'CHIname' : 'origin'"
                    :label="mode === 1 ? 'Chinese Name' : 'Order channel'"
                    width="150"
                    centered
                  >
                    <template v-slot="props">
                      {{
                        mode === 1
                          ? props.row.CHIname
                            ? props.row.CHIname
                            : 'N/A'
                          : props.row.origin
                      }}
                    </template>
                  </b-table-column>

                  <b-table-column
                    :field="mode === 1 ? 'gender' : 'payment_method'"
                    :label="mode === 1 ? 'Gender' : 'payment method'"
                    width="250"
                    centered
                  >
                    <template v-slot="props">
                      {{
                        mode === 1 ? props.row.gender : props.row.payment_method
                      }}
                    </template>
                  </b-table-column>

                  <b-table-column
                    field="kind"
                    :label="mode === 1 ? 'Company of uniform' : 'Total'"
                    width="250"
                    centered
                  >
                    <template v-slot="props">
                      {{
                        mode === 1
                          ? props.row.company[0].partner
                          : '$ ' + props.row.total_price
                      }}
                    </template>
                  </b-table-column>

                  <template #empty>
                    <div class="has-text-centered">No records</div>
                  </template>
                </b-table>
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
  }

  ::v-deep .pagination {
    flex-wrap: nowrap;
  }
}
</style>
