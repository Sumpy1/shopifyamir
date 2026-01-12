/* ============================================
   KombuchaMarket Theme - JavaScript
   ============================================ */

(function() {
  'use strict';

  // Header & Navigation
  const header = document.querySelector('[data-header]');
  const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });
  }

  // Cart Drawer
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const cartToggle = document.querySelector('[data-cart-toggle]');
  const cartClose = document.querySelector('[data-cart-close]');
  const cartOverlay = document.querySelector('[data-cart-overlay]');

  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // Always fetch fresh cart data when opening
      fetchCart();
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

  // Fetch Cart
  function fetchCart() {
    const cartUrl = window.routes.cart_url + '.js';
    console.log('Fetching cart from:', cartUrl);
    
    fetch(cartUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      cache: 'no-cache'
    })
      .then(response => {
        console.log('Cart response status:', response.status);
        console.log('Cart response headers:', response.headers);
        
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type') || '';
        console.log('Content-Type:', contentType);
        
        if (!contentType.includes('application/json') && !contentType.includes('text/javascript')) {
          return response.text().then(text => {
            console.error('Non-JSON response:', text.substring(0, 500));
            throw new Error('Response is not JSON');
          });
        }
        
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Error response:', text.substring(0, 500));
            throw new Error(`Failed to fetch cart: ${response.status}`);
          });
        }
        
        return response.json();
      })
      .then(cart => {
        console.log('Cart fetched successfully:', cart);
        console.log('Cart items:', cart.items);
        console.log('Cart item_count:', cart.item_count);
        
        if (cart && Array.isArray(cart.items)) {
          updateCartUI(cart);
        } else if (cart && cart.items !== undefined) {
          updateCartUI(cart);
        } else {
          console.error('Cart data missing items array:', cart);
          // Try to show empty state
          const cartEmpty = document.querySelector('[data-cart-empty]');
          const cartFooter = document.querySelector('[data-cart-footer]');
          if (cartEmpty) cartEmpty.style.display = 'block';
          if (cartFooter) cartFooter.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
        console.error('Error stack:', error.stack);
        // Show empty cart state on error
        const cartEmpty = document.querySelector('[data-cart-empty]');
        const cartFooter = document.querySelector('[data-cart-footer]');
        const cartItems = document.querySelector('[data-cart-items]');
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'none';
        if (cartItems) cartItems.innerHTML = '';
      });
  }

  // Update Cart UI
  function updateCartUI(cart) {
    const cartItems = document.querySelector('[data-cart-items]');
    const cartEmpty = document.querySelector('[data-cart-empty]');
    const cartFooter = document.querySelector('[data-cart-footer]');
    const cartSubtotal = document.querySelector('[data-cart-subtotal]');
    const cartCount = document.querySelector('[data-cart-count]');

    // Debug logging
    console.log('=== updateCartUI called ===');
    console.log('Cart object:', cart);
    console.log('Cart items:', cart?.items);
    console.log('Cart item_count:', cart?.item_count);
    console.log('Cart items type:', Array.isArray(cart?.items));
    console.log('Cart items length:', cart?.items?.length);

    if (!cart) {
      console.error('Cart is null or undefined');
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cart.items === undefined) {
      console.error('Cart items is undefined. Cart structure:', Object.keys(cart));
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cartCount) {
      cartCount.textContent = cart.item_count || 0;
    }

    const hasItems = Array.isArray(cart.items) && cart.items.length > 0;
    console.log('Cart has items:', hasItems, 'Items length:', cart.items?.length);

    if (!hasItems) {
      console.log('Cart is empty, showing empty state');
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartItems) cartItems.innerHTML = '';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    console.log('Cart has items, rendering them...');

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';

    if (cartSubtotal) {
      cartSubtotal.textContent = formatMoney(cart.total_price || 0);
    }

    if (cartItems) {
      console.log('Rendering', cart.items.length, 'items');
      cartItems.innerHTML = cart.items.map((item, index) => {
        console.log(`Item ${index}:`, item);
        console.log(`Item key: ${item.key}, id: ${item.id}`);
        
        // Handle different image formats
        let imageUrl = '';
        if (item.image) {
          imageUrl = item.image;
        } else if (item.featured_image) {
          if (typeof item.featured_image === 'string') {
            imageUrl = item.featured_image;
          } else if (item.featured_image.url) {
            imageUrl = item.featured_image.url;
          }
        }
        
        if (!imageUrl) {
          imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f5f5f5"/%3E%3C/svg%3E';
        }

        const variantTitle = item.variant_title && item.variant_title !== 'Default Title' 
          ? ` - ${escapeHtml(item.variant_title)}` 
          : '';

        const productTitle = item.product_title || item.title || 'Product';
        const itemKey = item.key || item.id || index;
        const linePrice = item.final_line_price || item.line_price || (item.price * item.quantity) || 0;
        const quantity = item.quantity || 1;

        return `
        <div class="cart-drawer__item" data-cart-item="${itemKey}">
          <img 
            src="${imageUrl}" 
            alt="${escapeHtml(productTitle)}"
            class="cart-drawer__item-image"
            width="80"
            height="80"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" height=\"80\"%3E%3Crect width=\"80\" height=\"80\" fill=\"%23f5f5f5\"/%3E%3C/svg%3E'"
          >
          <div class="cart-drawer__item-info">
            <div class="cart-drawer__item-name">${escapeHtml(productTitle)}${variantTitle}</div>
            <div class="cart-drawer__item-price">${formatMoney(linePrice)}</div>
            <div class="cart-drawer__item-quantity">
              <button 
                type="button" 
                class="cart-drawer__quantity-btn" 
                data-quantity-decrease="${itemKey}"
              >-</button>
              <input 
                type="number" 
                value="${quantity}" 
                min="1"
                class="cart-drawer__quantity-input"
                data-quantity-input="${itemKey}"
              >
              <button 
                type="button" 
                class="cart-drawer__quantity-btn" 
                data-quantity-increase="${itemKey}"
              >+</button>
            </div>
          </div>
          <button 
            type="button" 
            class="cart-drawer__item-remove" 
            data-remove-item="${itemKey}"
          >Remove</button>
        </div>
      `;
      }).join('');

      console.log('Cart items HTML rendered, attaching listeners...');
      // Attach event listeners
      attachCartItemListeners(cart);
      console.log('Cart UI update complete');
    }
  }

  // Attach Cart Item Listeners
  function attachCartItemListeners(cart) {
    // Remove old listeners by cloning and replacing elements
    const cartItems = document.querySelector('[data-cart-items]');
    if (cartItems) {
      // Use event delegation instead of attaching to individual elements
      cartItems.addEventListener('click', (e) => {
        const decreaseBtn = e.target.closest('[data-quantity-decrease]');
        const increaseBtn = e.target.closest('[data-quantity-increase]');
        const removeBtn = e.target.closest('[data-remove-item]');
        
        if (decreaseBtn) {
          e.preventDefault();
          e.stopPropagation();
          const key = decreaseBtn.getAttribute('data-quantity-decrease');
          const item = cart.items.find(i => i.key === key);
          if (item && item.quantity > 1) {
            updateCartItem(key, item.quantity - 1);
          }
        } else if (increaseBtn) {
          e.preventDefault();
          e.stopPropagation();
          const key = increaseBtn.getAttribute('data-quantity-increase');
          const item = cart.items.find(i => i.key === key);
          if (item) {
            updateCartItem(key, item.quantity + 1);
          }
        } else if (removeBtn) {
          e.preventDefault();
          e.stopPropagation();
          const key = removeBtn.getAttribute('data-remove-item');
          updateCartItem(key, 0);
        }
      });

      // Quantity input change handler
      cartItems.addEventListener('change', (e) => {
        const input = e.target.closest('[data-quantity-input]');
        if (input) {
          const key = input.getAttribute('data-quantity-input');
          const quantity = parseInt(input.value, 10);
          if (quantity > 0) {
            updateCartItem(key, quantity);
          } else {
            // Reset to 1 if invalid
            input.value = 1;
          }
        }
      });
    }
  }

  // Update Cart Item
  function updateCartItem(key, quantity) {
    const updates = {};
    updates[key] = quantity;

    // Disable buttons during update
    const buttons = document.querySelectorAll(`[data-quantity-decrease="${key}"], [data-quantity-increase="${key}"], [data-remove-item="${key}"]`);
    buttons.forEach(btn => btn.disabled = true);

    fetch(window.routes.cart_update_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ updates })
    })
      .then(response => {
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Failed to update cart: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(cart => {
        if (cart && cart.items !== undefined) {
          updateCartUI(cart);
        } else {
          throw new Error('Invalid cart response');
        }
      })
      .catch(error => {
        console.error('Error updating cart:', error);
        alert('Error updating cart. Please try again.');
        // Re-fetch cart to restore state
        fetchCart();
      })
      .finally(() => {
        // Re-enable buttons
        buttons.forEach(btn => btn.disabled = false);
      });
  }

  // Add to Cart
  function addToCart(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : '';
    
    // Disable button during request
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Adding...';
    }
    
    fetch(window.routes.cart_add_url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    })
      .then(response => {
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If not JSON, might be HTML error page
          return response.text().then(text => {
            throw new Error('Server returned an error page. Please try again.');
          });
        }
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.description || data.message || 'Error adding to cart');
          });
        }
        return response.json();
      })
      .then(data => {
        // Check for errors in response
        if (data.errors || data.status === 422 || data.status === 400) {
          const errorMessage = data.description || data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Error adding to cart');
          throw new Error(errorMessage);
        }
        // Success - update cart and open drawer
        // Small delay to ensure cart is updated on server
        setTimeout(() => {
          fetchCart();
          openCart();
        }, 100);
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        alert(error.message || 'Error adding to cart. Please try again.');
      })
      .finally(() => {
        // Re-enable button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
  }

  // Product Form
  const productForm = document.querySelector('[data-product-form]');
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addToCart(productForm);
    });

    // Handle variant selection changes
    const variantSelect = productForm.querySelector('[data-variant-select]');
    const variantIdInput = productForm.querySelector('[data-variant-id]');
    
    if (variantSelect) {
      variantSelect.addEventListener('change', (e) => {
        const selectedVariantId = e.target.value;
        if (variantIdInput) {
          variantIdInput.value = selectedVariantId;
        }
        // Update form action if needed
        const formAction = productForm.getAttribute('action');
        if (formAction) {
          // Form action is already set correctly
        }
      });
    }
  }

  // Product Quantity Controls
  const quantityDecrease = document.querySelector('[data-quantity-decrease]');
  const quantityIncrease = document.querySelector('[data-quantity-increase]');
  const quantityInput = document.querySelector('[data-quantity-input]');

  if (quantityDecrease) {
    quantityDecrease.addEventListener('click', () => {
      const current = parseInt(quantityInput.value, 10);
      if (current > 1) {
        quantityInput.value = current - 1;
      }
    });
  }

  if (quantityIncrease) {
    quantityIncrease.addEventListener('click', () => {
      const current = parseInt(quantityInput.value, 10);
      quantityInput.value = current + 1;
    });
  }

  // Product Thumbnails
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

  // Scroll Animations
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

  // Utility Functions
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

  // Search Functionality - Inline Search
  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchWrapper = document.querySelector('.header__search-wrapper');

  if (searchForm) {
    // Ensure form action is correct (use routes.search_url from Liquid)
    searchForm.addEventListener('submit', (e) => {
      const query = searchInput ? searchInput.value.trim() : '';
      if (!query) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
        return false;
      }
      // Form will submit normally to /search?q=query
    });
  }

  // Expand search on focus
  if (searchInput && searchWrapper) {
    searchInput.addEventListener('focus', () => {
      searchWrapper.classList.add('is-expanded');
    });

    // Collapse on blur if empty
    searchInput.addEventListener('blur', () => {
      if (!searchInput.value.trim()) {
        searchWrapper.classList.remove('is-expanded');
      }
    });
  }

  // Initialize cart count on load
  function initCart() {
    console.log('Initializing cart...');
    fetchCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
  } else {
    initCart();
  }
})();

