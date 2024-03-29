import raf from 'raf'
import PropTypes from 'ant-design-vue/es/_util/vue-types'
import Menu from '../vc-menu'
import { getSelectKeys, preventDefaultEvent } from './util'
import { cloneElement } from 'ant-design-vue/es/_util/vnode'
import BaseMixin from 'ant-design-vue/es/_util/BaseMixin'
import { getSlotOptions, getComponentFromProp, getListeners } from 'ant-design-vue/es/_util/props-util'
import KeyCode from 'ant-design-vue/es/_util/KeyCode'

// 展示的item数量
let displayItemsCount = 9

export default {
  name: 'DropdownMenu',
  mixins: [BaseMixin],
  props: {
    ariaId: PropTypes.string,
    defaultActiveFirstOption: PropTypes.bool,
    value: PropTypes.any,
    dropdownMenuStyle: PropTypes.object,
    multiple: PropTypes.bool,
    // onPopupFocus: PropTypes.func,
    // onPopupScroll: PropTypes.func,
    // onMenuDeSelect: PropTypes.func,
    // onMenuSelect: PropTypes.func,
    prefixCls: PropTypes.string,
    menuItems: PropTypes.any,
    inputValue: PropTypes.string,
    visible: PropTypes.bool,
    backfillValue: PropTypes.any,
    firstActiveValue: PropTypes.string,
    menuItemSelectedIcon: PropTypes.any,
  },
  data: () => ({
    menuItemStart: 0,
    displayItemsCount: displayItemsCount,
    itemSize: 32,
    menuContainerHeight: 250,
  }),
  computed: {
    virtualMaxHeight() {
      return this.menuItems.length * this.itemSize
    },
  },
  watch: {
    visible(val) {
      if (!val) {
        this.lastVisible = val
      } else {
        this.$nextTick(() => {
          this.scrollActiveItemToView()
        })
      }
    },
    inputValue(val, oldValue) {
      if (val || oldValue) {
        const menuContainer = this.$refs.menuContainer
        if (menuContainer) menuContainer.scrollTop = 0
      }
    },
  },

  created() {
    this.rafInstance = null
    this.lastInputValue = this.$props.inputValue
    this.lastVisible = false
  },

  mounted() {
    this.$nextTick(() => {
      this.scrollActiveItemToView()
       //计算展示的item的数量,高度和面板高度
      const menuRef = this.$refs.menuRef
      const menuEle = menuRef && menuRef.$el
      if (menuEle) {
        const option = menuEle.querySelector("li[role='option']")
        const isEmpty = !!menuEle.querySelector('.ant-empty')
        if (option && !isEmpty) this.itemSize = option.clientHeight
      }

      const { maxHeight } = this.dropdownMenuStyle
      this.menuContainerHeight = parseInt(maxHeight) || 250
      this.displayItemsCount = displayItemsCount = Math.ceil(this.menuContainerHeight / this.itemSize) + 1
    })

    this.lastVisible = this.$props.visible
  },
  updated() {
    const props = this.$props
    // if (!this.prevVisible && props.visible) {
    //   this.$nextTick(() => {
    //     this.scrollActiveItemToView();
    //   });
    // }
    this.lastVisible = props.visible
    this.lastInputValue = props.inputValue
    this.prevVisible = this.visible
  },
  beforeDestroy() {
    if (this.rafInstance) {
      raf.cancel(this.rafInstance)
    }
  },
  methods: {
    //设置菜单项的位置
    setMenuItemsPosition(start) {
      // 设置menuContainer的scrollTop会触发onVirtualScroll, onVirtualScroll内部会重新计算menuItemStart和position
      const menuContainer = this.$refs.menuContainer
      if (menuContainer) menuContainer.scrollTop = start * this.itemSize
    },

    scrollActiveItemToView() {
      //滚动高度小于容器高度时，不需要手动滚动
      if (this.virtualMaxHeight <= this.menuContainerHeight) {
        return
      }
      const { value, visible, firstActiveValue, menuItems } = this.$props
      const firstActiveItemValue = value && (value[0] || firstActiveValue)
      let menuItemStart
      if (!visible || !firstActiveItemValue) {
        menuItemStart = 0
      } else {
        const firstActiveItemIndex = menuItems.findIndex(item => item.key === firstActiveItemValue)
        menuItemStart = firstActiveItemIndex > 0 ? firstActiveItemIndex - 1 : firstActiveItemIndex
      }
      this.setMenuItemsPosition(menuItemStart)
    },

    renderMenu() {
      const props = this.$props
      const {
        menuItems,
        defaultActiveFirstOption,
        value,
        prefixCls,
        multiple,
        inputValue,
        firstActiveValue,
        dropdownMenuStyle,
        backfillValue,
        visible,
      } = props
      const menuItemSelectedIcon = getComponentFromProp(this, 'menuItemSelectedIcon')
      const { menuDeselect, menuSelect, popupScroll } = getListeners(this)
      if (menuItems && menuItems.length) {
        const selectedKeys = getSelectKeys(menuItems, value)
        const menuProps = {
          props: {
            multiple,
            itemIcon: multiple ? menuItemSelectedIcon : null,
            selectedKeys,
            prefixCls: `${prefixCls}-menu`,
          },
          on: {},
          style: {
            ...dropdownMenuStyle,
          },
          ref: 'menuRef',
          attrs: {
            role: 'listbox',
          },
        }
        if (popupScroll) {
          menuProps.on.scroll = popupScroll
        }
        if (multiple) {
          menuProps.on.deselect = menuDeselect
          menuProps.on.select = menuSelect
        } else {
          menuProps.on.click = menuSelect
        }
        const activeKeyProps = {}

        let defaultActiveFirst = defaultActiveFirstOption
        let clonedMenuItems = menuItems
        if (selectedKeys.length || firstActiveValue) {
          if (props.visible && !this.lastVisible) {
            activeKeyProps.activeKey = selectedKeys[0] || firstActiveValue
          } else if (!visible) {
            // Do not trigger auto active since we already have selectedKeys
            if (selectedKeys[0]) {
              defaultActiveFirst = false
            }
            activeKeyProps.activeKey = undefined
          }
          let foundFirst = false
          // set firstActiveItem via cloning menus
          // for scroll into view
          const clone = item => {
            if (
              (!foundFirst && selectedKeys.indexOf(item.key) !== -1) ||
              (!foundFirst && !selectedKeys.length && firstActiveValue.indexOf(item.key) !== -1)
            ) {
              foundFirst = true
              return cloneElement(item, {
                directives: [
                  {
                    name: 'ant-ref',
                    value: ref => {
                      // this.firstActiveItem = ref
                    },
                  },
                ],
              })
            }
            return item
          }

          clonedMenuItems = menuItems.map(item => {
            if (getSlotOptions(item).isMenuItemGroup) {
              // 分组模式下不使用虚拟滚动
              this.isMenuItemGroup = true
              const children = item.componentOptions.children.map(clone)
              return cloneElement(item, { children })
            }
            return clone(item)
          })
        } else {
          // Clear firstActiveItem when dropdown menu items was empty
          // Avoid `Unable to find node on an unmounted component`
          // https://github.com/ant-design/ant-design/issues/10774
          // this.firstActiveItem = null
          // 判断是否有处于分组模式的
          this.isMenuItemGroup = menuItems.some(item => getSlotOptions(item).isMenuItemGroup)
        }

        // Control the displayed data
        if (!this.isMenuItemGroup) {
          clonedMenuItems = clonedMenuItems.slice(this.menuItemStart, this.menuItemStart + this.displayItemsCount)
          menuProps.style['maxHeight'] = this.displayItemsCount * this.itemSize + 'px'
          menuProps.style['overflowY'] = 'hidden'
        }

        // clear activeKey when inputValue change
        const lastValue = value && value[value.length - 1]
        if (inputValue !== this.lastInputValue && (!lastValue || lastValue !== backfillValue)) {
          activeKeyProps.activeKey = ''
        }
        menuProps.props = {
          ...activeKeyProps,
          ...menuProps.props,
          defaultActiveFirst,
        }
        return <Menu {...menuProps}>{clonedMenuItems}</Menu>
      }
      return null
    },
    onVirtualScroll(event) {
      const { popupScroll } = getListeners(this)
      popupScroll(event)
      if (this.isMenuItemGroup) return
      // 现在的位置
      const newPositionY = event.target.scrollTop
      // 根据滚轴的距离来计算截取数据的起点
      let start = Math.floor(newPositionY / this.itemSize)
      // 控制 wrapper 的偏移，防止出现空白
      // 由于 wrapper 向上偏移了 1 个身位，相应的将起始位置也偏移
      let offsetSize = 0
      if (start >= 1) {
        this.displayItemsCount = displayItemsCount + 1
        start -= 1
        offsetSize = -8
      } else {
        this.displayItemsCount = displayItemsCount
      }
      this.menuItemStart = start

      this.$refs.menuRef.$el.style.transform = `translateY(${this.menuItemStart * this.itemSize + offsetSize}px)`
    },
    onKeyDown(event, item) {
      const { keyCode } = event
      const menuContainer = this.$refs.menuContainer

      let scrollTop = menuContainer.scrollTop
      let itemOffsetTop = item.$el.offsetTop

      if (keyCode === KeyCode.DOWN) {
        // When the starting value is greater than 0, I need to remove the offset value at the top
        if (this.menuItemStart > 0) itemOffsetTop -= this.itemSize
        // Move down one position
        if (itemOffsetTop > this.menuContainerHeight) scrollTop += this.itemSize
        // When it reaches the bottom
        if (itemOffsetTop <= 0 && scrollTop + this.itemSize >= this.virtualMaxHeight - this.menuContainerHeight)
          scrollTop = 0
      }

      if (keyCode === KeyCode.UP) {
        // Move up one position
        if (itemOffsetTop < this.itemSize) scrollTop -= this.itemSize
        // At the top
        if (itemOffsetTop >= this.menuContainerHeight && scrollTop <= this.itemSize) {
          scrollTop = this.virtualMaxHeight
        }
      }

      // This is to standardize the position of the offset
      menuContainer.scrollTop = scrollTop - (scrollTop % this.itemSize)
    },
  },
  render() {
    const renderMenu = this.renderMenu()
    const { popupFocus } = getListeners(this)

    const menuContainerStyle = {
      overflow: 'auto',
      transform: 'translateZ(0)',
    }
    if (!this.isMenuItemGroup) menuContainerStyle['maxHeight'] = this.menuContainerHeight + 'px'

    return renderMenu ? (
      <div
        style={menuContainerStyle}
        id={this.$props.ariaId}
        tabIndex="-1"
        onFocus={popupFocus}
        onMousedown={preventDefaultEvent}
        onScroll={this.onVirtualScroll}
        ref="menuContainer"
      >
        {!this.isMenuItemGroup ? (
          <div
            ref="virtualWrap"
            style={{
              minHeight: this.virtualMaxHeight + 'px',
            }}
          >
            {renderMenu}
          </div>
        ) : (
          renderMenu
        )}
      </div>
    ) : null
  },
}
