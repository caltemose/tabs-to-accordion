/**
 * @author Chad L. Altemose (twitter @caltemose)
 *
 * Class to create a Tabs-to-Accordion component that behaves as tabs+content on
 * larger screens and as an accordion component on smaller screens.
 */
class TabsToAccordion {

    constructor (element, options = {}) {
        // define default options for this component instance
        this.defaults = {
            defaultTab: 0,
            tabContentClass: 'TabsAccordion-content',
            tabTitleClass: 'TabsAccordion-title',
            tabNavClass: 'TabsNavigation',
            tabAccordionClass: 'TabsAccordion',
            scrollAccordion: true,
            scrollOffset: 10
        }
        // merge defaults with any options passed through the constructor
        this.options = Object.assign(this.defaults, options)

        // store the main DOM element and add the init class used to
        // handle styling of accordion states
        this.element = element
        this.element.classList.add('Tabs--init')

        // which tab is currently open/active
        this.currentTab = null

        // store all the tab content containers so they can be referenced later
        // for state changes
        this.tabContentElements = [].slice.call(
            this.element.querySelectorAll(`.${this.options.tabContentClass}`)
        )

        this.fetchTabData()

        // store the accordion container (smaller screens)
        // and apply appropriate ARIA attribute
        this.accordion = this.element.querySelector(`.${this.options.tabAccordionClass}`)
        this.accordion.setAttribute('role', 'tablist')

        // handle events for accordion/smaller screens
        this.bindAccordionEvents()

        // get the tab container (larger screens)
        this.tabNavElement = this.element.querySelector(`.${this.options.tabNavClass}`)
        // get the tab buttons in the container
        this.tabNavItems = [].slice.call(this.tabNavElement.querySelectorAll('a'))

        // apply the class to handle styling of tab states to the main container
        this.element.classList.add('Tabs--nav-init')

        // handle events for tabs/larger screens
        this.bindNavEvents()

        // select the initial tab
        const startingTab = this.tabContentElements[this.options.defaultTab]
        this.openTab(startingTab)
    }

    fetchTabData () {
        // stores data for all tabs in this component
        this.tabData = []

        let tabElement, tabTitle, tabData

        for(let i=0; i<this.tabContentElements.length; i++) {
            tabElement = this.tabContentElements[i]
            tabTitle = tabElement.previousElementSibling
            tabData = {
                tabId: tabElement.id,
                tabTitle: tabTitle.innerText
            }

            this.tabData.push(tabData)

            // set ARIA attributes for this tab content element
            tabElement.setAttribute('role', 'tabpanel')
            tabElement.setAttribute('aria-hidden', 'true')

            // set ARIA attributes for this tab title element
            tabTitle.setAttribute('role', 'tab')
            tabTitle.setAttribute('aria-controls', tabData.tabId)
            this.setAriaSelected(tabTitle, false)
        }
    }

    //
    // Accordion-specific functions
    //

    bindAccordionEvents () {
        const tabTitles = this.accordion.querySelectorAll(`.${this.options.tabTitleClass}`)
        for (let i=0; i<tabTitles.length; i++) {
            tabTitles[i].addEventListener('click', this.onTitleClick.bind(this))
            tabTitles[i].addEventListener('keydown', this.onTitleKeydown.bind(this))
        }
    }

    onTitleClick (event) {
        event.preventDefault()
        // get the content item associated with this title
        const tabContent = event.currentTarget.nextElementSibling
        this.handleAccordion(tabContent)
    }

    onTitleKeydown (event) {
        const currentIndex = this.handleKeyPress(event)
        if (currentIndex !== null) {
            this.handleAccordion(this.tabContentElements[currentIndex])
        }
    }

    handleKeyPress (event) {
        let currentIndex = this.currentTab.position || null
        const keyCodes = {
            SPACE: 32,
            ENTER: 13,
            // DOWN: 40,
            // ESCAPE: 27,
            // HOME: 36,
            // LEFT: 37,
            // PAGE_DOWN: 34,
            // PAGE_UP: 33,
            // RIGHT: 39,
            // TAB: 9,
            // UP: 38
        }

        switch (event.keyCode) {
            // case keyCodes.LEFT:
            // case keyCodes.UP:
            //     currentIndex--
            //     if (currentIndex < 0) {
            //         currentIndex = this.tabData.length - 1
            //     }
            //     break

            case keyCodes.SPACE:
            case keyCodes.ENTER:
                currentIndex = this.handleEnter(currentIndex)
                break

            default:
                currentIndex = null
        }

        return currentIndex
    }

    handleEnter (currentIndex) {
        const tab = document.getElementById(document.activeElement.getAttribute('aria-controls'))
        if (tab !== this.currentTab.contentElement) {
            currentIndex = this.tabContentElements.indexOf(tab)
        }
        return currentIndex
    }

    handleAccordion (tabContentElement) {
        if (!this.isCurrentTab(tabContentElement)) {
            this.openAccordion(tabContentElement)
        } else {
            this.closeTab()
        }
    }

    openAccordion (tabContentElement) {
        this.closeTab()
        this.openTab(tabContentElement)
        this.currentTab.titleElement.focus()

        if (this.options.scrollAccordion) {
            window.scroll(0, this.currentTab.titleElement.offsetTop - this.options.scrollOffset)
        }
    }

    //
    // Tab-specific functions
    //

    /**
     * bindNavEvents - add the click event listeners to the tab nav buttons.
     */
    bindNavEvents () {
        for(let i=0; i<this.tabNavItems.length; i++) {
            this.tabNavItems[i].addEventListener('click', this.onTabClick.bind(this))
        }
    }

    /**
     * onTabClick - handle clicks of the tab button. If the button clicked is
     * not associated with the currently-expanded tab, close the current tab
     * and open the newly-selected tab and content.
     *
     * @param {MouseEvent} event - the tab button click event.
     */
    onTabClick (event) {
        event.preventDefault()
        const target = this.element.querySelector(event.currentTarget.hash)
        if (!this.isCurrentTab(target)) {
            this.closeTab()
            this.openTab(target)
        }
    }

    /**
     * updateTabNav - set the aria attributes of the button for the newly
     * opened tab content.
     */
    updateTabNav () {
        const tab = this.tabNavItems[this.currentTab.position]
        this.setAriaSelected(tab)
    }

    /**
     * closeTab - if there is an open tab, hide it and set its aria attributes appropriately.
     */
    closeTab () {
        if (this.currentTab) {
            this.currentTab.contentElement.setAttribute('aria-hidden', 'true')
            this.setAriaSelected(this.currentTab.titleElement, false)
            this.setAriaSelected(this.tabNavItems[this.currentTab.position], false)
            this.currentTab = null
        }
    }

    /**
     * openTab - set the stored currentTab object properties based on the given
     * tabContentElement (DOM element), update the aria attributes of this element
     * and the associated title element and trigger the function to update the
     * tab button aria attirbutes.
     *
     * @param {DOM element} tabContentElement - the DOM element representing the tab content to display/expand.
     */
    openTab (tabContentElement) {
        this.currentTab = {
            contentElement: tabContentElement,
            titleElement: tabContentElement.previousElementSibling,
            position: this.tabContentElements.indexOf(tabContentElement)
        }
        tabContentElement.setAttribute('aria-hidden', 'false')
        this.setAriaSelected(this.currentTab.titleElement)
        this.updateTabNav()
    }

    //
    // Helper functions
    //

    /**
     * isCurrentTab - determine if the given element is the currently
     * selected tab element return boolean.
     *
     * @param {DOM element} tabContentElement - a DOM element to compare to the currently-selected tab content DOM element
     * @return {Boolean} True if the given tabContentElement is the current tabContentElement
     */
    isCurrentTab (tabContentElement) {
        return !this.currentTab ? false : this.currentTab.contentElement === tabContentElement
    }

    /**
     * setAriaSelected - Helper function to set the aria-selected and aria-expanded attributes
     * of a given element.
     *
     * @param {DOM element} element - The DOM element that will have aria attributes updated
     * @param {Boolean} selected - aria attribute values will be set to this Boolean
     */
    setAriaSelected (element, selected = true) {
        element.setAttribute('aria-selected', selected)
        element.setAttribute('aria-expanded', selected)
    }
}

window.TabsToAccordion = TabsToAccordion
