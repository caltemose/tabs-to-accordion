/**
 * @author Chad L. Altemose (twitter || github ->  @caltemose)
 *
 * Class to create a Tabs-to-Accordion component that behaves as tabs+content on
 * larger screens and as an accordion component on smaller screens.
 */
class TabsToAccordion {

    /**
     * constructor - this function updates the default options as necessary and 
     * handles the initialization behavior of this component.
     * 
     * @param {DOM Element} element - main DOM element containing this component
     * @param {Object} options - optional overrides of default options for this component
     */
    constructor (element, options = {}) {
        // define default options for this component instance
        this.defaults = {
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

        // get data from tab DOM element attributes and store it for use
        // throughout the lifecycle of this component
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

        // need a window resize listener if the accordion can be fully collapsed
        if (this.defaults.accordionCanCollapseAll) {
            this.attachResizeListener()
        }
    }

    /**
     * fetchTabData - parse the tab markup to retrieve each tab elements Id
     * and Title and set some appropriate aria attributes on the content DOM elements
     * and the title DOM elements.
     */
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

    /**
     * bindAccordionEvents - get the accordion title elements and attach
     * click and keydown listener events.
     */
    bindAccordionEvents () {
        const tabTitles = this.accordion.querySelectorAll(`.${this.options.tabTitleClass}`)
        for (let i=0; i<tabTitles.length; i++) {
            tabTitles[i].addEventListener('click', this.onTitleClick.bind(this))
            tabTitles[i].addEventListener('keydown', this.onTitleKeydown.bind(this))
        }
    }

    /**
     * onTitleClick - handle clicks on accordion titles and toggle the
     * visibility of the selected accordion item.
     * 
     * @param {MouseEvent} event 
     */
    onTitleClick (event) {
        event.preventDefault()
        // get the content item associated with this title
        const tabContent = event.currentTarget.nextElementSibling
        this.handleAccordion(tabContent)
    }

    /**
     * onTitleKeydown - handle key presses on accordion titles and update
     * the accordion visibility state.
     * 
     * @param {KeyboardEvent} event 
     */
    onTitleKeydown (event) {
        const currentIndex = this.handleKeyPress(event)
        if (currentIndex !== null) {
            this.handleAccordion(this.tabContentElements[currentIndex])
        }
    }

    /**
     * handleKeyPress - Given a keyboard event associated with an accordion title button, 
     * determine the index of the accordion content to take action on. Currently supports
     * showing the active element, going to the previous element and going to the next element.
     * 
     * @param {KeyboardEvent} event 
     * @return {int} currentIndex - index of tab content element to act on
     */
    handleKeyPress (event) {
        let currentIndex = this.currentTab.position || null
        const keyCodes = {
            SPACE: 32,
            ENTER: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        }

        switch (event.keyCode) {
            // show selected tab
            case keyCodes.SPACE:
            case keyCodes.ENTER:
                currentIndex = this.handleEnter(currentIndex)
                break

            // show previous tab
            case keyCodes.LEFT:
            case keyCodes.UP:
                currentIndex--
                if (currentIndex < 0) {
                    currentIndex = this.tabData.length - 1
                }
                break
            
            // show next tab
            case keyCodes.RIGHT:
            case keyCodes.DOWN:
                currentIndex++
                if (currentIndex >= this.tabData.length) {
                    currentIndex = 0
                }
                break

            default:
                currentIndex = null
        }

        return currentIndex
    }

    /**
     * handleEnter - return the index of the active tab content element. Return the
     * given index if the accordion title being acted on is the one associated with
     * already open content.
     * 
     * @param {int} currentIndex 
     */
    handleEnter (currentIndex) {
        const tab = document.getElementById(document.activeElement.getAttribute('aria-controls'))
        if (tab !== this.currentTab.contentElement) {
            currentIndex = this.tabContentElements.indexOf(tab)
        }
        return currentIndex
    }

    /**
     * handleAccordion - takes a given accordion content element and shows it if it's
     * hidden. If the content is visible and collapsing all accordion content is enabled, 
     * hide the given accordion content.
     * 
     * @param {DOM Element} tabContentElement - tab content element to show or hide
     */
    handleAccordion (tabContentElement) {
        if (!this.isCurrentTab(tabContentElement)) {
            this.openAccordion(tabContentElement)
        } else {
            // this is conditional because using this feature means listening for
            // window resize events to show the last opened tab if none are open
            // and the user changes window width to change the style from accordion
            // to tab mode -- we need to avoid having no content visible if we show
            // the tab mode.
            if (this.defaults.accordionCanCollapseAll)
                this.closeTab()
        }
    }

    /**
     * openAccordion - switch to new tab content by hiding the open tab and
     * showing the activated tab. Scroll the accordion if the behavior is enabled.
     * 
     * @param {DOM Element} tabContentElement - tab content element to show
     */
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
            this.previousTab = this.currentTab
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
        this.previousTab = this.currentTab
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
    //  
    //

    /**
     * attachResizeListener - attaches a custom (throttled) window resize listener
     * to open the most recently-opened tab when the user has collapsed all content
     * when this component is in Accordion mode and the screen is resized to switch
     * into Tab mode because we don't ever want to have all tabs hidden when this
     * component is in Tab mode.
     */
    attachResizeListener () {
        const throttle = (type, name) => {
            let running = false
            const func = () => {
                if (running) {
                    return
                }
                running = true
                requestAnimationFrame(() => {
                    window.dispatchEvent(new CustomEvent(name))
                    running = false
                })
            }
            window.addEventListener(type, func)
        }

        throttle('resize', 'optimizedResize')

        window.addEventListener('optimizedResize', () => {
            // if we're in tab mode and no tab content is visible, open the previously open tab
            if (window.innerWidth >= this.defaults.breakpoint && !this.currentTab && this.previousTab) {
                this.openTab(this.previousTab.contentElement)
            }
        })
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
