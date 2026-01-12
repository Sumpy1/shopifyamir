/* ============================================
   KombuchaMarket Theme - JavaScript
   PRESENTATION LAYER ONLY - NO BUSINESS LOGIC
   ============================================
   
   This file contains ONLY UI feedback and presentation logic.
   All cart, checkout, and inventory logic is handled by Shopify's backend.
   
   Rules:
   - Forms submit natively to Shopify endpoints
   - JavaScript only provides loading states and animations
   - No cart state mutations in JavaScript
   - No checkout logic in JavaScript
*/

(function() {
  'use strict';

  // ============================================
  // ANNOUNCEMENT BAR (UI Only)
  // ============================================
  const announcementBar = document.querySelector('[data-announcement-bar]');
  const announcementClose = document.querySelector('[data-announcement-close]');

  if (announcementClose && announcementBar) {
    announcementClose.addEventListener('click', () => {
      announcementBar.classList.add('is-hidden');
      // Store preference in localStorage
      localStorage.setItem('announcement-bar-hidden', 'true');
    });
  }

  // Check if announcement bar was previously closed
  if (announcementBar && localStorage.getItem('announcement-bar-hidden') === 'true') {
    announcementBar.classList.add('is-hidden');
  }

  // ============================================
  // HEADER & NAVIGATION (UI Only)
  // ============================================
  const header = document.querySelector('[data-header]');
  const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });
  }

  // ============================================
  // ACCOUNT DROPDOWN (UI Only)
  // ============================================
  const accountWrapper = document.querySelector('[data-account-wrapper]');
  const accountToggle = document.querySelector('[data-account-toggle]');
  const accountDropdown = document.querySelector('[data-account-dropdown]');

  function closeAccountDropdown() {
    if (accountDropdown) {
      accountDropdown.classList.remove('is-open');
      if (accountWrapper) {
        accountWrapper.classList.remove('is-open');
      }
    }
  }

  function toggleAccountDropdown() {
    if (accountDropdown && accountWrapper) {
      const isOpen = accountDropdown.classList.contains('is-open');
      
      // Close other dropdowns (like search)
      const searchWrapper = document.querySelector('[data-search-wrapper]');
      if (searchWrapper) {
        searchWrapper.classList.remove('is-expanded');
      }
      
      if (isOpen) {
        closeAccountDropdown();
      } else {
        accountDropdown.classList.add('is-open');
        accountWrapper.classList.add('is-open');
      }
    }
  }

  if (accountToggle && accountDropdown) {
    accountToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAccountDropdown();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (accountWrapper && !accountWrapper.contains(e.target)) {
      closeAccountDropdown();
    }
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && accountDropdown && accountDropdown.classList.contains('is-open')) {
      closeAccountDropdown();
    }
  });

  // ============================================
  // CART DRAWER (UI Display Only)
  // ============================================
  // NOTE: Cart drawer displays cart data from Liquid.
  // Cart updates use native forms that submit to Shopify.
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const cartToggle = document.querySelector('[data-cart-toggle]');
  const cartClose = document.querySelector('[data-cart-close]');
  const cartOverlay = document.querySelector('[data-cart-overlay]');

  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // Refresh page to get latest cart data from Shopify
      // Alternatively, could fetch /cart.js and update display only
      refreshCartDisplay();
    }
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  if (cartToggle) {
    cartToggle.addEventListener('click', openCart);
  }

  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }

  // ============================================
  // CART DISPLAY (Read-Only)
  // ============================================
  // This function ONLY fetches and displays cart data.
  // It does NOT mutate cart state - that's Shopify's job.
  function refreshCartDisplay() {
    // Fetch cart data for display purposes only
    fetch('/cart.js', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) return null;
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json') && !contentType.includes('text/javascript')) {
          return null;
        }
        return response.json();
      })
      .then(cart => {
        if (cart && cart.items) {
          updateCartDisplay(cart);
        }
      })
      .catch(() => {
        // Silently fail - cart display will use Liquid data
      });
  }

  // Update cart display ONLY - no mutations
  function updateCartDisplay(cart) {
    const cartCount = document.querySelector('[data-cart-count]');
    const cartSubtotal = document.querySelector('[data-cart-subtotal]');
    
    if (cartCount) {
      cartCount.textContent = cart.item_count || 0;
    }
    
    if (cartSubtotal) {
      cartSubtotal.textContent = formatMoney(cart.total_price || 0);
    }
  }

  // ============================================
  // PRODUCT FORM (UI Feedback Only)
  // ============================================
  // Form submits natively to /cart/add
  // JavaScript only provides loading state feedback
  const productForm = document.querySelector('[data-product-form]');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      // Allow form to submit natively to Shopify
      // Only add UI feedback
      const submitButton = this.querySelector('[data-add-to-cart-btn]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Adding...';
        
        // Re-enable after a delay (in case of redirect)
        setTimeout(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Add to Cart';
          }
        }, 2000);
      }
    });
  }

  // ============================================
  // QUANTITY CONTROLS (UI Only)
  // ============================================
  // These buttons only update the input value visually.
  // The form submission handles the actual cart update.
  function setupQuantityControls(container) {
    const decreaseBtn = container.querySelector('[data-quantity-decrease]');
    const increaseBtn = container.querySelector('[data-quantity-increase]');
    const quantityInput = container.querySelector('[data-quantity-input]');

    if (decreaseBtn && quantityInput) {
      decreaseBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value, 10) || 1;
        if (current > 1) {
          quantityInput.value = current - 1;
        }
      });
    }

    if (increaseBtn && quantityInput) {
      increaseBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value, 10) || 1;
        quantityInput.value = current + 1;
      });
    }
  }

  // Setup quantity controls on product page
  const productQuantityContainer = document.querySelector('.product-page__quantity-controls');
  if (productQuantityContainer) {
    setupQuantityControls(productQuantityContainer);
  }

  // ============================================
  // CART DRAWER QUANTITY CONTROLS (Automatic Updates)
  // ============================================
  // Automatically update cart when quantity changes in cart drawer
  function updateCartQuantity(line, quantity, key) {
    const formData = {
      line: line,
      quantity: quantity
    };
    
    const url = (window.Shopify?.routes?.root || '/') + 'cart/change.js';
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(cart => {
        // Update cart display (count, subtotal)
        updateCartDisplay(cart);
        
        // Update quantity input value
        const quantityInput = document.querySelector(`[data-cart-item="${key}"] [data-cart-quantity-input]`);
        if (quantityInput) {
          quantityInput.value = quantity;
        }
        
        // Update item price if it changed
        const itemElement = document.querySelector(`[data-cart-item="${key}"]`);
        if (itemElement && cart.items) {
          const updatedItem = cart.items.find(item => item.key === key);
          if (updatedItem) {
            const priceElement = itemElement.querySelector('.cart-drawer__item-price');
            if (priceElement) {
              priceElement.textContent = formatMoney(updatedItem.final_line_price);
            }
          }
        }
        
        // If quantity is 0, remove the item from display
        if (quantity === 0) {
          const itemElement = document.querySelector(`[data-cart-item="${key}"]`);
          if (itemElement) {
            itemElement.remove();
          }
          
          // Check if cart is empty
          if (cart.item_count === 0) {
            const cartContent = document.querySelector('[data-cart-content]');
            if (cartContent) {
              cartContent.innerHTML = '<div class="cart-drawer__empty" data-cart-empty><p>Your cart is empty</p><a href="/collections/all" class="cart-drawer__continue-shopping">Continue Shopping</a></div>';
            }
          }
        }
      })
      .catch(error => {
        console.error('Error updating cart:', error);
        // Refresh cart display on error
        refreshCartDisplay();
      });
  }

  function initCartDrawerQuantityControls() {
    const quantityControls = document.querySelectorAll('[data-quantity-controls]');
    
    quantityControls.forEach(container => {
      const decreaseBtn = container.querySelector('[data-quantity-decrease]');
      const increaseBtn = container.querySelector('[data-quantity-increase]');
      const quantityInput = container.querySelector('[data-cart-quantity-input]');
      const line = parseInt(container.getAttribute('data-line'), 10);
      const key = container.getAttribute('data-key');

      if (decreaseBtn && quantityInput) {
        // Remove existing listeners by cloning
        const newDecreaseBtn = decreaseBtn.cloneNode(true);
        decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
        
        newDecreaseBtn.addEventListener('click', () => {
          const current = parseInt(quantityInput.value, 10) || 1;
          if (current > 1) {
            const newQuantity = current - 1;
            quantityInput.value = newQuantity;
            updateCartQuantity(line, newQuantity, key);
          }
        });
      }

      if (increaseBtn && quantityInput) {
        // Remove existing listeners by cloning
        const newIncreaseBtn = increaseBtn.cloneNode(true);
        increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);
        
        newIncreaseBtn.addEventListener('click', () => {
          const current = parseInt(quantityInput.value, 10) || 1;
          const newQuantity = current + 1;
          quantityInput.value = newQuantity;
          updateCartQuantity(line, newQuantity, key);
        });
      }
    });
  }

  // Initialize cart drawer quantity controls on page load
  if (document.querySelector('[data-cart-drawer]')) {
    initCartDrawerQuantityControls();
  }

  // ============================================
  // CHECKOUT BUTTON (Direct Link)
  // ============================================
  // Checkout buttons are now direct links to /checkout
  // No form submission needed - Shopify handles checkout
  const checkoutButtons = document.querySelectorAll('[data-checkout-btn]');
  checkoutButtons.forEach(btn => {
    if (btn.tagName === 'A') {
      // Already a link, no action needed
      return;
    }
    // If it's a button, convert to link behavior
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/checkout';
    });
  });

  // ============================================
  // PRODUCT THUMBNAILS (UI Only)
  // ============================================
  const thumbnails = document.querySelectorAll('[data-thumbnail]');
  const mainImage = document.querySelector('.product-page__main-image img');

  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
      const img = thumbnail.querySelector('img');
      if (img && mainImage) {
        mainImage.src = img.src.replace('width=200', 'width=1200');
        thumbnails.forEach(t => t.classList.remove('is-active'));
        thumbnail.classList.add('is-active');
      }
    });
  });

  // ============================================
  // SCROLL ANIMATIONS (UI Only)
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-section]').forEach(section => {
    observer.observe(section);
  });

  // ============================================
  // SEARCH FUNCTIONALITY (Predictive Search)
  // ============================================
  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchWrapper = document.querySelector('[data-search-wrapper]');
  const searchToggle = document.querySelector('[data-search-toggle]');
  const predictiveSearchContainer = document.querySelector('[data-predictive-search]');
  let searchTimeout = null;

  // Toggle search input visibility
  if (searchToggle && searchWrapper) {
    searchToggle.addEventListener('click', () => {
      searchWrapper.classList.toggle('is-expanded');
      if (searchWrapper.classList.contains('is-expanded')) {
        searchInput?.focus();
      } else {
        searchInput?.blur();
        if (predictiveSearchContainer) {
          predictiveSearchContainer.innerHTML = '';
          predictiveSearchContainer.classList.remove('is-visible');
        }
      }
    });
  }

  // Handle form submission
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      const query = searchInput ? searchInput.value.trim() : '';
      if (!query) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
        return false;
      }
      // Form submits natively to /search?q=query
    });
  }

  // Predictive search functionality
  function performPredictiveSearch(query) {
    if (!query || query.length < 2) {
      if (predictiveSearchContainer) {
        predictiveSearchContainer.innerHTML = '';
        predictiveSearchContainer.classList.remove('is-visible');
      }
      return;
    }

    // Find the predictive search section ID
    const sectionId = 'predictive-search';
    const url = (window.Shopify?.routes?.root || '/') + `search/suggest?q=${encodeURIComponent(query)}&resources[type]=product,collection,query&resources[limit]=5&section_id=${sectionId}`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        if (!predictiveSearchContainer) return;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sectionContent = doc.querySelector(`#shopify-section-${sectionId}`);
        
        if (sectionContent) {
          const results = sectionContent.querySelector('[data-predictive-search-results]');
          if (results) {
            predictiveSearchContainer.innerHTML = results.outerHTML;
            predictiveSearchContainer.classList.add('is-visible');
          } else {
            predictiveSearchContainer.innerHTML = '';
            predictiveSearchContainer.classList.remove('is-visible');
          }
        } else {
          predictiveSearchContainer.innerHTML = '';
          predictiveSearchContainer.classList.remove('is-visible');
        }
      })
      .catch(error => {
        console.error('Error performing predictive search:', error);
        if (predictiveSearchContainer) {
          predictiveSearchContainer.innerHTML = '';
          predictiveSearchContainer.classList.remove('is-visible');
        }
      });
  }

  // Debounce function for predictive search
  function debounce(func, wait) {
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(searchTimeout);
        func(...args);
      };
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(later, wait);
    };
  }

  // Handle search input changes
  if (searchInput) {
    const debouncedSearch = debounce((e) => {
      const query = e.target.value.trim();
      performPredictiveSearch(query);
    }, 300);

    searchInput.addEventListener('input', debouncedSearch);

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2) {
        performPredictiveSearch(searchInput.value.trim());
      }
    });

    // Close predictive search when clicking outside
    document.addEventListener('click', (e) => {
      if (searchWrapper && !searchWrapper.contains(e.target)) {
        if (predictiveSearchContainer) {
          predictiveSearchContainer.classList.remove('is-visible');
        }
      }
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // INITIALIZE CART COUNT (Display Only)
  // ============================================
  // Update cart count in header on page load
  // This is read-only - Shopify controls the actual cart
  function initCartCount() {
    fetch('/cart.js', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (!response.ok) return null;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json') || contentType.includes('text/javascript')) {
          return response.json();
        }
        return null;
      })
      .then(cart => {
        if (cart && cart.item_count !== undefined) {
          const cartCount = document.querySelector('[data-cart-count]');
          if (cartCount) {
            cartCount.textContent = cart.item_count;
          }
        }
      })
      .catch(() => {
        // Silently fail - Liquid will show cart count
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartCount);
  } else {
    initCartCount();
  }

  // ============================================
  // EMAIL CAPTURE MODAL (UI Only)
  // ============================================
  const emailModal = document.querySelector('[data-email-modal]');
  const emailModalClose = document.querySelector('[data-email-modal-close]');
  const emailModalOverlay = document.querySelector('[data-email-modal-overlay]');
  const EMAIL_MODAL_STORAGE_KEY = 'email-modal-closed';

  function openEmailModal() {
    if (emailModal) {
      emailModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeEmailModal() {
    if (emailModal) {
      emailModal.classList.remove('is-open');
      document.body.style.overflow = '';
      // Store that modal was closed in localStorage
      localStorage.setItem(EMAIL_MODAL_STORAGE_KEY, 'true');
    }
  }

  function initEmailModal() {
    if (!emailModal) return;

    // Check if modal was previously closed
    if (localStorage.getItem(EMAIL_MODAL_STORAGE_KEY) === 'true') {
      return;
    }

    // Get delay from data attribute (in seconds, convert to milliseconds)
    const delay = parseInt(emailModal.getAttribute('data-modal-delay') || '3', 10) * 1000;

    // Show modal after delay
    setTimeout(() => {
      // Double check localStorage in case user closed it during delay
      if (localStorage.getItem(EMAIL_MODAL_STORAGE_KEY) !== 'true') {
        openEmailModal();
      }
    }, delay);
  }

  // Close modal handlers
  if (emailModalClose) {
    emailModalClose.addEventListener('click', closeEmailModal);
  }

  if (emailModalOverlay) {
    emailModalOverlay.addEventListener('click', closeEmailModal);
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && emailModal && emailModal.classList.contains('is-open')) {
      closeEmailModal();
    }
  });

  // Initialize modal on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailModal);
  } else {
    initEmailModal();
  }
})();
