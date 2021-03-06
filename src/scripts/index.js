import TabsToAccordion from './TabsToAccordion'

const container = document.getElementById("Tabs")

const opts = {
    accordionCanCollapseAll: container.dataset.collapsible === 'true' || false,
    scrollAccordion: container.dataset.scrollOnChange === 'true' || false
}

new TabsToAccordion(container, opts)

/*

// default options for TabsToAccordion

opts = {
    defaultTab: 0,
    tabContentClass: 'TabsAccordion-content',
    tabTitleClass: 'TabsAccordion-title',
    tabNavClass: 'TabsNavigation',
    tabAccordionClass: 'TabsAccordion',
    breakpoint: 768, // >= this number of pixels we use tab mode, less = accordion mode
    scrollAccordion: false,
    scrollOffset: 10,
    accordionCanCollapseAll: false
}

*/
