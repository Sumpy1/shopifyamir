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
  // CART FORMS (UI Feedback Only)
  // ============================================
  // Cart update forms submit natively to /cart
  // JavaScript only provides loading feedback
  const cartForm = document.querySelector('[data-cart-form]');
  const cartDrawerForm = document.querySelector('[data-cart-drawer-form]');

  function setupCartForm(form) {
    if (!form) return;
    
    const updateBtn = form.querySelector('[data-update-btn]');
    const checkoutBtn = form.querySelector('[data-checkout-btn]');
    
    // Update button - submit to /cart with update action
    if (updateBtn) {
      updateBtn.addEventListener('click', function(e) {
        // Form will submit natively
        // Add loading state
        this.disabled = true;
        this.textContent = 'Updating...';
      });
    }
    
    // Checkout button - submit to /cart with checkout action
    // Shopify will redirect to /checkout
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function(e) {
        // Form will submit natively and Shopify redirects
        // Add loading state
        this.disabled = true;
        this.textContent = 'Processing...';
      });
    }
  }

  if (cartForm) setupCartForm(cartForm);
  if (cartDrawerForm) setupCartForm(cartDrawerForm);

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
  // SEARCH FUNCTIONALITY (UI Only)
  // ============================================
  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchWrapper = document.querySelector('.header__search-wrapper');

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

  if (searchInput && searchWrapper) {
    searchInput.addEventListener('focus', () => {
      searchWrapper.classList.add('is-expanded');
    });

    searchInput.addEventListener('blur', () => {
      if (!searchInput.value.trim()) {
        searchWrapper.classList.remove('is-expanded');
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
})();
