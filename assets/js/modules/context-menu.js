// Standalone Context Menu System
class HeatLabsContextMenu {
    constructor() {
        this.menu = null;
        this.isOpen = false;
        this.currentTarget = null;
        this.activeSubmenu = null;
        this.submenuCloseTimeout = null;
        this.whitelistSelectors = [
            'a',
            'button',
            'img',
            '.feature-card',
            '.tank-card',
            '.quick-access-item',
            '.sidebar-link',
            '.btn-accent',
            '.hero-btn',
            'nav',
            'header',
            'footer',
            'section',
            'article',
            'main',
            'aside'
        ];
        this.blacklistSelectors = [
            '.navbar',
            '.theme-toggle-switch',
            '.search-input',
            '.context-menu',
            '.heatlabs-context-menu',
            'input',
            'textarea',
            'select'
        ];
        this.init();
    }

    init() {
        this.createMenuElement();
        this.bindEvents();
        this.injectStyles();
    }

    injectStyles() {
        // Check if styles are already injected
        if (document.getElementById('heatlabs-context-menu-styles')) {
            return;
        }

        // Create style element for dynamic styles
        const style = document.createElement('style');
        style.id = 'heatlabs-context-menu-styles';
        style.textContent = `
            .heatlabs-context-menu-feedback {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--accent-color);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                z-index: 10001;
                font-family: var(--font-body);
                font-weight: 500;
                box-shadow: var(--shadow-lg);
                transition: opacity 0.3s ease;
                pointer-events: none;
            }

            .heatlabs-context-menu-social-row {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0.75rem;
                border-top: 1px solid var(--border-color);
                margin-top: 0.5rem;
            }

            .heatlabs-context-menu-social-item {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                margin-top: 0.25rem;
                background: transparent;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 1.1rem;
            }

            .heatlabs-context-menu-social-item:hover {
                background: var(--accent-color);
                color: white;
            }

            .heatlabs-context-menu-social-item.github:hover {
                background: #333;
            }

            .heatlabs-context-menu-social-item.youtube:hover {
                background: #ff0000;
            }

            .heatlabs-context-menu-social-item.discord:hover {
                background: #5865f2;
            }

            .heatlabs-context-menu-social-item.twitter:hover {
                background: #1da1f2;
            }
        `;
        document.head.appendChild(style);
    }

    createMenuElement() {
        this.menu = document.createElement('div');
        this.menu.className = 'heatlabs-context-menu';
        this.menu.innerHTML = `
            <div class="heatlabs-context-menu-items"></div>
        `;
        document.body.appendChild(this.menu);
    }

    bindEvents() {
        // Global context menu handler
        document.addEventListener('contextmenu', (e) => {
            if (this.shouldShowMenu(e.target)) {
                e.preventDefault();
                this.show(e, e.target);
            } else {
                this.hide();
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target)) {
                this.hide();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });

        // Handle window resize and scroll
        window.addEventListener('resize', () => this.hide());
        window.addEventListener('scroll', () => this.hide());

        // Prevent context menu on the menu itself
        this.menu.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    shouldShowMenu(target) {
        // Check blacklist first
        for (const selector of this.blacklistSelectors) {
            if (target.closest(selector)) {
                return false;
            }
        }

        // Check whitelist
        for (const selector of this.whitelistSelectors) {
            if (target.closest(selector)) {
                return true;
            }
        }

        // Allow on any element except body and html
        return target !== document.body && target !== document.documentElement;
    }

    show(event, target) {
        this.currentTarget = target;
        const menuConfig = this.getMenuConfig();

        if (!menuConfig || !menuConfig.items || menuConfig.items.length === 0) {
            return;
        }

        this.renderMenu(menuConfig.items);
        this.positionMenu(event);
        this.menu.classList.add('active');
        this.isOpen = true;

        document.body.classList.add('context-menu-active');
    }

    hide() {
        if (this.menu) {
            this.menu.classList.remove('active');
            this.isOpen = false;
            this.currentTarget = null;
            this.activeSubmenu = null;
            document.body.classList.remove('context-menu-active');

            // Clear any pending timeouts
            if (this.submenuCloseTimeout) {
                clearTimeout(this.submenuCloseTimeout);
                this.submenuCloseTimeout = null;
            }
        }
    }

    getMenuConfig() {
        return {
            items: [{
                    label: 'Back',
                    icon: 'fas fa-arrow-left',
                    action: () => window.history.back(),
                    disabled: () => !document.referrer
                },
                {
                    label: 'Forward',
                    icon: 'fas fa-arrow-right',
                    action: () => window.history.forward(),
                    disabled: () => !window.history.state
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Reload',
                    icon: 'fas fa-redo',
                    action: () => window.location.reload()
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Extras',
                    icon: 'fas fa-ellipsis-h',
                    submenu: [{
                            label: 'Changelog',
                            icon: 'fas fa-clipboard-list',
                            action: () => window.open('https://changelog.heatlabs.net', '_blank')
                        },
                        {
                            label: 'Statistics',
                            icon: 'fas fa-chart-column',
                            action: () => window.open('https://statistics.heatlabs.net', '_blank')
                        },
                        {
                            label: 'Status',
                            icon: 'fas fa-server',
                            action: () => window.open('https://status.heatlabs.net', '_blank')
                        },
                        {
                            label: 'Socials',
                            icon: 'fas fa-share',
                            action: () => window.open('https://social.heatlabs.net', '_blank')
                        },
                        {
                            label: 'Discord',
                            icon: 'fab fa-discord',
                            action: () => window.open('https://discord.heatlabs.net', '_blank')
                        }
                    ]
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Source',
                    icon: 'fas fa-code',
                    action: () => window.open('https://github.com/HEATlabs', '_blank')
                },
                {
                    label: 'Home',
                    icon: 'fas fa-home',
                    action: () => window.location.href = '/'
                }
            ]
        };
    }

    renderMenu(items) {
        const menuItemsContainer = this.menu.querySelector('.heatlabs-context-menu-items');
        menuItemsContainer.innerHTML = '';

        items.forEach((item) => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'heatlabs-context-menu-separator';
                menuItemsContainer.appendChild(separator);
            } else if (item.submenu) {
                // Create submenu item
                const menuItem = document.createElement('div');
                menuItem.className = 'heatlabs-context-menu-item heatlabs-context-menu-submenu';

                menuItem.innerHTML = `
                    ${item.icon ? `<span class="heatlabs-context-menu-icon"><i class="${item.icon}"></i></span>` : ''}
                    <span class="heatlabs-context-menu-label">${item.label}</span>
                `;

                // Create submenu container
                const submenu = document.createElement('div');
                submenu.className = 'heatlabs-context-submenu';

                // Add submenu items
                item.submenu.forEach((subItem) => {
                    const submenuItem = document.createElement('button');
                    submenuItem.className = 'heatlabs-context-menu-item';

                    submenuItem.innerHTML = `
                        ${subItem.icon ? `<span class="heatlabs-context-menu-icon"><i class="${subItem.icon}"></i></span>` : ''}
                        <span class="heatlabs-context-menu-label">${subItem.label}</span>
                    `;

                    if (subItem.action) {
                        submenuItem.addEventListener('click', (e) => {
                            e.stopPropagation();
                            subItem.action.call(this, this.currentTarget);
                            this.hide();
                        });
                    }

                    submenu.appendChild(submenuItem);
                });

                menuItem.appendChild(submenu);
                menuItemsContainer.appendChild(menuItem);

                // Add hover events with delay for smooth transition
                this.setupSubmenuHover(menuItem, submenu);
            } else {
                const menuItem = document.createElement('button');
                menuItem.className = 'heatlabs-context-menu-item';

                if (item.disabled && typeof item.disabled === 'function' && item.disabled()) {
                    menuItem.disabled = true;
                }

                menuItem.innerHTML = `
                    ${item.icon ? `<span class="heatlabs-context-menu-icon"><i class="${item.icon}"></i></span>` : ''}
                    <span class="heatlabs-context-menu-label">${item.label}</span>
                `;

                if (item.action && !menuItem.disabled) {
                    menuItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        item.action.call(this, this.currentTarget);
                        this.hide();
                    });
                }

                menuItemsContainer.appendChild(menuItem);
            }
        });

        // Add social media icons row at the bottom
        this.addSocialMediaRow(menuItemsContainer);
    }

    addSocialMediaRow(container) {
        const socialRow = document.createElement('div');
        socialRow.className = 'heatlabs-context-menu-social-row';

        const socialLinks = [
            {
                platform: 'github',
                icon: 'fab fa-github',
                url: 'https://github.com/HEATLabs',
                title: 'GitHub'
            },
            {
                platform: 'youtube',
                icon: 'fab fa-youtube',
                url: 'https://www.youtube.com/@HEATLabs-Official',
                title: 'YouTube'
            },
            {
                platform: 'discord',
                icon: 'fab fa-discord',
                url: 'https://discord.com/invite/caEFCA9ScF',
                title: 'Discord'
            },
            {
                platform: 'twitter',
                icon: 'fab fa-twitter',
                url: 'https://x.com/HEAT_Labs',
                title: 'Twitter'
            }
        ];

        socialLinks.forEach(link => {
            const socialButton = document.createElement('button');
            socialButton.className = `heatlabs-context-menu-social-item ${link.platform}`;
            socialButton.title = link.title;
            socialButton.innerHTML = `<i class="${link.icon}"></i>`;

            socialButton.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(link.url, '_blank');
                this.hide();
            });

            socialRow.appendChild(socialButton);
        });

        container.appendChild(socialRow);
    }

    setupSubmenuHover(menuItem, submenu) {
        let submenuTimeout;

        // Show submenu on hover with slight delay
        menuItem.addEventListener('mouseenter', () => {
            // Clear any pending close timeout
            if (this.submenuCloseTimeout) {
                clearTimeout(this.submenuCloseTimeout);
                this.submenuCloseTimeout = null;
            }

            // Position submenu
            this.positionSubmenu(menuItem, submenu);

            // Set as active submenu
            this.activeSubmenu = submenu;
        });

        // Hide submenu with delay when leaving menu item
        menuItem.addEventListener('mouseleave', (e) => {
            // If moving to submenu, don't hide
            if (submenu.contains(e.relatedTarget)) {
                return;
            }

            // Set timeout to hide submenu
            this.submenuCloseTimeout = setTimeout(() => {
                if (this.activeSubmenu === submenu) {
                    this.activeSubmenu = null;
                }
            }, 150);
        });

        // Keep submenu visible when hovering over it
        submenu.addEventListener('mouseenter', () => {
            // Clear close timeout when entering submenu
            if (this.submenuCloseTimeout) {
                clearTimeout(this.submenuCloseTimeout);
                this.submenuCloseTimeout = null;
            }
            this.activeSubmenu = submenu;
        });

        // Hide submenu when leaving it
        submenu.addEventListener('mouseleave', (e) => {
            // If moving back to menu item, dont hide
            if (menuItem.contains(e.relatedTarget)) {
                return;
            }

            this.submenuCloseTimeout = setTimeout(() => {
                if (this.activeSubmenu === submenu) {
                    this.activeSubmenu = null;
                }
            }, 150);
        });
    }

    positionSubmenu(menuItem, submenu) {
        // Wait for the menu to be visible
        setTimeout(() => {
            const menuRect = this.menu.getBoundingClientRect();
            const submenuRect = submenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Check if there is enough space on the right
            const spaceRight = viewportWidth - menuRect.right;
            const spaceLeft = menuRect.left;

            // Default to right positioning
            let positionClass = '';

            // If not enough space on right but enough on left position to left
            if (spaceRight < submenuRect.width && spaceLeft >= submenuRect.width) {
                positionClass = 'left';
            }

            submenu.classList.toggle('left', positionClass === 'left');
        }, 10);
    }

    positionMenu(event) {
        if (!this.menu) return;

        // Show temporarily to calculate dimensions
        this.menu.style.visibility = 'hidden';
        this.menu.style.display = 'block';
        const menuRect = this.menu.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        this.menu.style.display = '';
        this.menu.style.visibility = 'visible';

        // Viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Available space calculation
        const spaceRight = viewportWidth - event.clientX;
        const spaceLeft = event.clientX;
        const spaceBottom = viewportHeight - event.clientY;
        const spaceTop = event.clientY;

        // Determine optimal position
        let posX = event.clientX;
        let posY = event.clientY;
        let positionClass = 'bottom-right';

        // Horizontal positioning
        if (spaceRight < menuWidth && spaceLeft >= menuWidth) {
            posX = event.clientX - menuWidth;
            positionClass = positionClass.replace('right', 'left');
        } else if (spaceRight < menuWidth && spaceLeft < menuWidth) {
            posX = spaceRight >= spaceLeft ? viewportWidth - menuWidth - 10 : 10;
            positionClass = spaceRight >= spaceLeft ? 'bottom-right' : 'bottom-left';
        }

        // Vertical positioning
        if (spaceBottom < menuHeight && spaceTop >= menuHeight) {
            posY = event.clientY - menuHeight;
            positionClass = positionClass.replace('bottom', 'top');
        } else if (spaceBottom < menuHeight && spaceTop < menuHeight) {
            posY = spaceBottom >= spaceTop ? viewportHeight - menuHeight - 10 : 10;
            positionClass = spaceBottom >= spaceTop ? 'bottom-right' : 'top-right';
        }

        // Apply position with boundary checks
        posX = Math.max(10, Math.min(posX, viewportWidth - menuWidth - 10));
        posY = Math.max(10, Math.min(posY, viewportHeight - menuHeight - 10));

        this.menu.style.left = `${posX}px`;
        this.menu.style.top = `${posY}px`;

        // Update position class
        this.menu.classList.remove('top-left', 'top-right', 'bottom-left', 'bottom-right');
        this.menu.classList.add(positionClass);
    }

    destroy() {
        this.hide();
        if (this.menu && document.body.contains(this.menu)) {
            document.body.removeChild(this.menu);
        }
    }
}

// Auto-initialize when DOM is loaded
let heatLabsContextMenu;

document.addEventListener('DOMContentLoaded', () => {
    heatLabsContextMenu = new HeatLabsContextMenu();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (heatLabsContextMenu) {
        heatLabsContextMenu.destroy();
    }
});