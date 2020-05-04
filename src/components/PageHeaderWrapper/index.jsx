import './index.less'

import PropTypes from 'ant-design-vue/es/_util/vue-types'
import GridContent from '../GridContent'
import { PageHeader, Tabs } from 'ant-design-vue'
import { getComponentFromProp } from 'ant-design-vue/lib/_util/props-util'

const { PageHeaderProps } = PageHeader

const prefixedClassName = 'ant-pro-page-header-wrap'

const PageHeaderTabConfig = {
  tabList: PropTypes.array,
  tabActiveKey: PropTypes.string,
  tabProps: PropTypes.object,
  tabChange: PropTypes.func
}

const PageHeaderWrapperProps = {
  ...PageHeaderTabConfig,
  ...PageHeaderProps,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  content: PropTypes.any,
  extraContent: PropTypes.any,
  pageHeaderRender: PropTypes.func,
  breadcrumb: PropTypes.oneOf([PropTypes.object, PropTypes.bool]).def(true),
  back: PropTypes.func,

  // 包装 pro-layout 才能使用
  i18nRender: PropTypes.any
}

const defaultI18nRender = (t) => t

const useContext = (route) => {
  return route && {
    ...route.meta
  } || null
}

const noop = () => {}

// TODO :: tabList tab 支持图标 优化
const renderFooter = (h, tabConfigProps, i18nRender) => {
  const {
    tabList,
    tabActiveKey,
    tabChange: onTabChange,
    tabBarExtraContent,
    tabProps,
  } = tabConfigProps
  return tabList && tabList.length > 0 && (
    <Tabs
      class={`${prefixedClassName}-tabs`}
      activeKey={tabActiveKey}
      onChange={key => {
        if (onTabChange) {
          onTabChange(key)
        }
      }}
      tabBarExtraContent={tabBarExtraContent}
      {...tabProps}
    >
      {tabList.map(item => (
        <Tabs.TabPane {...item} tab={i18nRender(item.tab)} key={item.key} />
      ))}
    </Tabs>
  )
}

const renderPageHeader = (h, content, extraContent) => {
  if (!content && !extraContent) {
    return null
  }
  return (
    <div class={`${prefixedClassName}-detail`}>
      <div class={`${prefixedClassName}-main`}>
        <div class={`${prefixedClassName}-row`}>
          { content && (
            <div class={`${prefixedClassName}-content`}>{content}</div>
          )}
          { extraContent && (
            <div class={`${prefixedClassName}-extraContent`}>
              {extraContent}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const defaultPageHeaderRender = (h, props, pageMeta, i18nRender) => {
  const {
    title,
    content,
    pageHeaderRender,
    extra,
    extraContent,
    breadcrumb,
    back: handleBack,
    ...restProps
  } = props
  if (pageHeaderRender) {
    return pageHeaderRender({ ...props })
  }
  let pageHeaderTitle = title
  if (!title && title !== false) {
    pageHeaderTitle = pageMeta.title
  }
  let tabProps = {
    breadcrumb,
    extra,
    title: i18nRender(pageHeaderTitle),
    onBack: handleBack || noop,
    footer: renderFooter(h, restProps, i18nRender)
  }
  if (!handleBack) {
    tabProps.backIcon = false
  }

  return (
    <PageHeader { ...{ props: tabProps } }>
      {renderPageHeader(h, content, extraContent)}
    </PageHeader>
  )
  // return
}

const PageHeaderWrapper = {
  name: 'PageHeaderWrapper',
  props: PageHeaderWrapperProps,
  inject: ['locale'],
  render (h) {
    const children = this.$slots.default
    const content = getComponentFromProp(this, 'content')
    const extra = getComponentFromProp(this, 'extra')
    const extraContent = getComponentFromProp(this, 'extraContent')

    const pageMeta = useContext(this.$props.route || this.$route)
    const i18n = this.$props.i18nRender || this.locale || defaultI18nRender
    // 当未设置 back props 或未监听 @back，不显示 back
    const onBack = this.$props.back
    const back = onBack && (() => {
      this.$emit('back')
      // call props back func
      onBack && onBack()
    }) || undefined

    const onTabChange = this.$props.tabChange
    const tabChange = (key) => {
      this.$emit('tabChange', key)
      onTabChange && onTabChange(key)
    }

    const propsBreadcrumb = this.$props.breadcrumb
    let breadcrumb = {}
    if (propsBreadcrumb === undefined) {
      const routes = this.$route.matched.concat().map(route => {
        return {
          path: route.path,
          breadcrumbName: i18n(route.meta.title)
        }
      })
      breadcrumb = { props: { routes }}
    }

    const props = {
      ...this.$props,
      content,
      extra,
      extraContent,
      breadcrumb,
      tabChange,
      back
    }

    return (
      <div class="ant-pro-page-header-wrap">
        <div class={`${prefixedClassName}-page-header-warp`}>
          <GridContent>{defaultPageHeaderRender(h, props, pageMeta, i18n)}</GridContent>
        </div>
        { children ? (
          <GridContent>
            <div class={`${prefixedClassName}-children-content`}>
              {children}
            </div>
          </GridContent>
        ) : null }
      </div>
    )
  }
}

export default PageHeaderWrapper
