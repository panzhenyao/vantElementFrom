/**
 * Vant UI 组件库配置文件
 * 移动端组件按需引入配置
 */
import Vue from 'vue'
import {
  // 基础组件
  Button,
  Cell,
  CellGroup,
  Icon,
  Image as VanImage,
  Row,
  Col,
  Popup,
  Toast,
  Dialog,
  Loading,
  
  // 表单组件
  Calendar,
  Checkbox,
  CheckboxGroup,
  DatetimePicker,
  Field,
  Form,
  NumberKeyboard,
  PasswordInput,
  Picker,
  Radio,
  RadioGroup,
  Rate,
  Search,
  Slider,
  Stepper,
  Switch,
  Uploader,
  
  // 展示组件
  Badge,
  Card,
  Circle,
  Collapse,
  CollapseItem,
  CountDown,
  Divider,
  Empty,
  ImagePreview,
  Lazyload,
  List,
  NoticeBar,
  Popover,
  Progress,
  Skeleton,
  Step,
  Steps,
  Sticky,
  Swipe,
  SwipeItem,
  Tag,
  
  // 导航组件
  Grid,
  GridItem,
  IndexBar,
  IndexAnchor,
  NavBar,
  Pagination,
  Sidebar,
  SidebarItem,
  Tab,
  Tabs,
  Tabbar,
  TabbarItem,
  
  // 业务组件
  ActionSheet,
  AddressEdit,
  AddressList,
  Area,
  ContactCard,
  ContactEdit,
  ContactList,
  Coupon,
  CouponCell,
  CouponList,
  DropdownMenu,
  DropdownItem,
  GoodsAction,
  GoodsActionButton,
  GoodsActionIcon,
  SubmitBar,
  
  // 反馈组件
  ActionBar,
  ActionBarIcon,
  ActionBarButton,
  ShareSheet,
  SwipeCell,
  PullRefresh,
  Notify,
  Overlay
} from 'vant'

// 注册基础组件
Vue.use(Button)
Vue.use(Cell)
Vue.use(CellGroup)
Vue.use(Icon)
Vue.use(VanImage)
Vue.use(Row)
Vue.use(Col)
Vue.use(Popup)
Vue.use(Loading)

// 注册表单组件
Vue.use(Calendar)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(DatetimePicker)
Vue.use(Field)
Vue.use(Form)
Vue.use(NumberKeyboard)
Vue.use(PasswordInput)
Vue.use(Picker)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Rate)
Vue.use(Search)
Vue.use(Slider)
Vue.use(Stepper)
Vue.use(Switch)
Vue.use(Uploader)

// 注册展示组件
Vue.use(Badge)
Vue.use(Card)
Vue.use(Circle)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(CountDown)
Vue.use(Divider)
Vue.use(Empty)
Vue.use(Lazyload)
Vue.use(List)
Vue.use(NoticeBar)
Vue.use(Popover)
Vue.use(Progress)
Vue.use(Skeleton)
Vue.use(Step)
Vue.use(Steps)
Vue.use(Sticky)
Vue.use(Swipe)
Vue.use(SwipeItem)
Vue.use(Tag)

// 注册导航组件
Vue.use(Grid)
Vue.use(GridItem)
Vue.use(IndexBar)
Vue.use(IndexAnchor)
Vue.use(NavBar)
Vue.use(Pagination)
Vue.use(Sidebar)
Vue.use(SidebarItem)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Tabbar)
Vue.use(TabbarItem)

// 注册业务组件
Vue.use(ActionSheet)
Vue.use(AddressEdit)
Vue.use(AddressList)
Vue.use(Area)
Vue.use(ContactCard)
Vue.use(ContactEdit)
Vue.use(ContactList)
Vue.use(Coupon)
Vue.use(CouponCell)
Vue.use(CouponList)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(GoodsAction)
Vue.use(GoodsActionButton)
Vue.use(GoodsActionIcon)
Vue.use(SubmitBar)

Vue.use(ShareSheet)
Vue.use(SwipeCell)
Vue.use(PullRefresh)
Vue.use(Overlay)

// 注册全局方法
Vue.prototype.$toast = Toast
Vue.prototype.$dialog = Dialog
Vue.prototype.$notify = Notify
Vue.prototype.$imagePreview = ImagePreview 

// 注册自定义区域选择组件
import AreaWidget from '@/components/AreaWidget'
Vue.component('AreaWidget', AreaWidget)