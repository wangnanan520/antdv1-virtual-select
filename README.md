# antdv1-virtual-select
```
ant-design-vue1.x版本实现虚拟下拉框
```
## API
api同 [antdv select](https://1x.antdv.com/components/select-cn/#API)

## Repository
[github](https://github.com/wangnanan520/antdv1-virtual-select)

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

## Using npm or yarn

```
yarn add avirtualselect
```

```
npm install avirtualselect --save
```

### main.js

```
import avirtualselect from 'avirtualselect'

Vue.use(avirtualselect)
```

### Use

```
 <virtualSelect
    style="width: 300px"
    v-model="value"
    allowClear
    showArrow
    :options="options"
/>
```
