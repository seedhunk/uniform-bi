import { getCode } from '@/api/product'
import { getImgName } from '@/api/media'
import { getRuleName } from '@/api/rule'

const check = async (param) => {
  var wrong_Dialog = []
  var codeList = []
  var imgNameList = []
  var variationList = ['material', 'size', 'color', 'Sku']
  var chartList = [
    'Neck',
    'Bust/Chest',
    'Waist',
    'Arm',
    'Shoulder to Waist',
    'Shoulder to Hip',
    'Knee',
    'Outseam',
    'Ankle',
    'Shoulder',
    'Upper Waist',
    'Sleeve Length',
    'Hip',
    'Thigh',
    'Calf',
    'Inseam'
  ]
  var sizeList = []
  var ruleList = []
  var addCodeList = []
  codeList = await getCode()
  imgNameList = await getImgName()
  ruleList = await getRuleName()

  const codeCheck = (key, code, index) => {
    var is_duplicate = false
    for (const item of codeList) {
      if (code === item) {
        is_duplicate = true
        wrong_Dialog.push(
          index !== undefined
            ? 'The Sku of variation(index=' +
                index +
                ') in the ' +
                key +
                ' row of the Excel sheet is a duplicate of an existing sku, please change it'
            : 'The Sku in the ' +
                key +
                ' row of the Excel sheet is a duplicate of an existing sku, please change it'
        )
      }
    }
    if (!is_duplicate) addCodeList.push(code)
  }

  const typeCheck = (key, type) => {
    if (type !== 'Ready to wear') {
      wrong_Dialog.push(
        'The Type in the ' +
          key +
          " row of the Excel sheet can only be 'Ready to wear'."
      )
    }
  }

  const imagesCheck = (key, images) => {
    var imgs
    try {
      imgs = JSON.parse(images.replace(/\s/g, ''))
      if (imgs.length === 0) {
        wrong_Dialog.push(
          'Please enter at least one image in the Images column of the ' +
            key +
            ' row in the Excel sheet'
        )
      } else {
        for (const name of imgs) {
          if (!imgNameList.includes(name)) {
            wrong_Dialog.push(
              "The file '" +
                name +
                "' in the Images column of the " +
                key +
                ' row in the Excel sheet does not exist. Please upload this image in the media management first'
            )
          }
        }
      }
    } catch {
      wrong_Dialog.push(
        'The format of the Images column in the ' +
          key +
          ' row of the Excel sheet is incorrect. Please fill it in according to the standard provided in the example'
      )
    }
  }

  const standardPriceCheck = (key, standardPrice) => {
    if (isNaN(parseFloat(standardPrice))) {
      wrong_Dialog.push(
        'The StandardPrice value in the ' +
          key +
          ' row of the Excel sheet must be a number'
      )
    }
  }

  const salePriceCheck = (key, salePrice) => {
    if (isNaN(parseFloat(salePrice))) {
      wrong_Dialog.push(
        'The SalePrice value in the ' +
          key +
          ' row of the Excel sheet must be a number'
      )
    }
  }

  const variationCheck = (key, variation, sizeChart) => {
    var variation_List
    try {
      variation_List = JSON.parse(variation.replace(/\s/g, ''))
      if (variation_List.length === 0) {
        wrong_Dialog.push(
          'Please enter at least one variation in the Variation column of the ' +
            key +
            ' row in the Excel sheet'
        )
      } else {
        variation_List.forEach((item, index) => {
          const allKeys = [...Object.keys(item)]
          const differentKeys = allKeys
            .filter((key) => !variationList.includes(key))
            .concat(variationList.filter((key) => !allKeys.includes(key)))
          differentKeys.forEach((item1) => {
            if (variationList.includes(item1)) {
              wrong_Dialog.push(
                "The '" +
                  item1 +
                  "' field(index=" +
                  index +
                  ') in the Variation column of the ' +
                  key +
                  ' row in the Excel sheet is missing. Please check'
              )
            } else {
              wrong_Dialog.push(
                "The '" +
                  item1 +
                  "' field(index=" +
                  index +
                  ') in the Variation column of the ' +
                  key +
                  ' row in the Excel sheet is valid. Please check'
              )
            }
          })

          if (differentKeys.length === 0) {
            codeCheck(key, item.Sku, index)
          }
          if (hasOwnProperty.call(item, 'size')) {
            if (!sizeList.includes(item['size'])) {
              sizeList.push(item['size'])
            }
          }
        })
        sizeChartCheck(key, sizeChart)
      }
    } catch {
      wrong_Dialog.push(
        'The format of the Variation column in the ' +
          key +
          ' row of the Excel sheet is incorrect. Please fill it in according to the standard provided in the example'
      )
    }
  }

  const sizeChartCheck = (key, sizeChart) => {
    var sizeChart_List
    try {
      sizeChart_List = JSON.parse(sizeChart.replace(/\s/g, ''))
      if (Object.keys(sizeChart_List).length === 0) {
        wrong_Dialog.push(
          'Please enter at least one sizeChart in the SizeChart column of the ' +
            key +
            ' row in the Excel sheet'
        )
      } else {
        if (sizeList.length !== 0) {
          const allKeys = [...Object.keys(sizeChart_List)]
          const differentKeys = allKeys
            .filter((key) => !sizeList.includes(key))
            .concat(sizeList.filter((key) => !allKeys.includes(key)))
          differentKeys.forEach((item) => {
            if (sizeList.includes(item)) {
              wrong_Dialog.push(
                "The size '" +
                  item +
                  "' in the SizeChart column of the " +
                  key +
                  ' row in the Excel sheet is missing. Please check'
              )
            } else {
              wrong_Dialog.push(
                "The size '" +
                  item +
                  "' in the SizeChart column of the " +
                  key +
                  " row in the Excel sheet dosen't exist in Variation. Please check"
              )
            }
          })
          if (differentKeys.length === 0) {
            for (const size in sizeChart_List) {
              const obj1 = sizeChart_List[size]
              for (const chart in obj1) {
                const obj2 = obj1[chart]
                if (!chartList.includes(chart)) {
                  wrong_Dialog.push(
                    "The attribute '" +
                      chart +
                      '(size=' +
                      size +
                      ') in the SizeChart column of the ' +
                      key +
                      " row in the Excel sheet dosen't exist in attribute_example. Please check"
                  )
                } else {
                  if (isNaN(parseFloat(obj2))) {
                    wrong_Dialog.push(
                      "The attribute '" +
                        chart +
                        '(size=' +
                        size +
                        ') in the SizeChart column of the ' +
                        key +
                        ' row of the Excel sheet must be a number'
                    )
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      wrong_Dialog.push(
        'The format of the SizeChart column in the ' +
          key +
          ' row of the Excel sheet is incorrect. Please fill it in according to the standard provided in the example'
      )
    }
  }

  const ruleCheck = (key, rule) => {
    if (!ruleList.includes(rule)) {
      wrong_Dialog.push(
        "'" +
          rule +
          "' in the ruleName column of the " +
          key +
          ' row in the Excel sheet does not exist. Please choose an existing rule'
      )
    }
  }

  const allCodeCheck = () => {
    const seen = new Set()
    const duplicates = new Set()

    for (const item of addCodeList) {
      if (seen.has(item)) {
        duplicates.add(item)
      } else {
        seen.add(item)
      }
    }
    const dupList = Array.from(duplicates)
    dupList.forEach((item) => {
      wrong_Dialog.push(
        "There are duplicate Skus:'" +
          item +
          "' in the Excel sheet, please check"
      )
    })
  }

  //init
  for (const key in param) {
    codeCheck(Number(key) + 1, param[key].Sku)
    typeCheck(Number(key) + 1, param[key].Type)
    imagesCheck(Number(key) + 1, param[key].Images)
    standardPriceCheck(Number(key) + 1, param[key].StandardPrice)
    salePriceCheck(Number(key) + 1, param[key].SalePrice)
    variationCheck(Number(key) + 1, param[key].Variation, param[key].SizeChart)
    ruleCheck(Number(key) + 1, param[key].ruleName)
    sizeList = []
  }
  allCodeCheck()
  return wrong_Dialog
}

export default check
