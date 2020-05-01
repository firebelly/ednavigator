// Shared var storage for state

const appState = {
  isAnimating: false,
  navOpen: false,
  navStuck: false,
  breakpoints: {},

  init() {
    // Bind updateBreakpoints to domready and resize
    document.addEventListener('DOMContentLoaded', appState.updateBreakpoints);
    window.addEventListener('resize', appState.updateBreakpoints);
  },

  updateBreakpoints() {
    // Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
    let breakpointIndicatorString = window.getComputedStyle( document.querySelector('#breakpoint-indicator'), ':after' ).getPropertyValue('content').replace(/['"]+/g, '');
    appState.breakpoints['xl'] = breakpointIndicatorString === 'xl';
    appState.breakpoints['nav'] = breakpointIndicatorString === 'nav' || appState.breakpoints['xl'];
    appState.breakpoints['lg'] = breakpointIndicatorString === 'lg' || appState.breakpoints['nav'];
    appState.breakpoints['md'] = breakpointIndicatorString === 'md' || appState.breakpoints['lg'];
    appState.breakpoints['sm'] = breakpointIndicatorString === 'sm' || appState.breakpoints['md'];
    appState.breakpoints['xs'] = breakpointIndicatorString === 'xs' || appState.breakpoints['sm'];
  },
};

export default appState
