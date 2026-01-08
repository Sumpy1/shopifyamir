/* ============================================
   CULTURE Theme - JavaScript
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
    fetch(window.routes.cart_url + '.js')
      .then(response => response.json())
      .then(cart => {
        updateCartUI(cart);
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
      });
  }

  // Update Cart UI
  function updateCartUI(cart) {
    const cartItems = document.querySelector('[data-cart-items]');
    const cartEmpty = document.querySelector('[data-cart-empty]');
    const cartFooter = document.querySelector('[data-cart-footer]');
    const cartSubtotal = document.querySelector('[data-cart-subtotal]');
    const cartCount = document.querySelector('[data-cart-count]');

    if (cartCount) {
      cartCount.textContent = cart.item_count;
    }

    if (cart.items.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartItems) cartItems.innerHTML = '';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';

    if (cartSubtotal) {
      cartSubtotal.textContent = formatMoney(cart.total_price);
    }

    if (cartItems) {
      cartItems.innerHTML = cart.items.map(item => {
        const imageUrl = item.image || (item.featured_image ? item.featured_image.url : '');
        return `
        <div class="cart-drawer__item" data-cart-item="${item.key}">
          <img 
            src="${imageUrl}" 
            alt="${escapeHtml(item.product_title)}"
            class="cart-drawer__item-image"
            width="80"
            height="80"
          >
          <div class="cart-drawer__item-info">
            <div class="cart-drawer__item-name">${escapeHtml(item.product_title)}</div>
            <div class="cart-drawer__item-price">${formatMoney(item.final_line_price)}</div>
            <div class="cart-drawer__item-quantity">
              <button 
                type="button" 
                class="cart-drawer__quantity-btn" 
                data-quantity-decrease="${item.key}"
              >-</button>
              <input 
                type="number" 
                value="${item.quantity}" 
                min="1"
                class="cart-drawer__quantity-input"
                data-quantity-input="${item.key}"
              >
              <button 
                type="button" 
                class="cart-drawer__quantity-btn" 
                data-quantity-increase="${item.key}"
              >+</button>
            </div>
          </div>
          <button 
            type="button" 
            class="cart-drawer__item-remove" 
            data-remove-item="${item.key}"
          >Remove</button>
        </div>
      `;
      }).join('');

      // Attach event listeners
      attachCartItemListeners(cart);
    }
  }

  // Attach Cart Item Listeners
  function attachCartItemListeners(cart) {
    // Quantity controls
    document.querySelectorAll('[data-quantity-decrease]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.dataset.quantityDecrease;
        const item = cart.items.find(i => i.key === key);
        if (item && item.quantity > 1) {
          updateCartItem(key, item.quantity - 1);
        }
      });
    });

    document.querySelectorAll('[data-quantity-increase]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.dataset.quantityIncrease;
        const item = cart.items.find(i => i.key === key);
        if (item) {
          updateCartItem(key, item.quantity + 1);
        }
      });
    });

    // Quantity input
    document.querySelectorAll('[data-quantity-input]').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.quantityInput;
        const quantity = parseInt(e.target.value, 10);
        if (quantity > 0) {
          updateCartItem(key, quantity);
        }
      });
    });

    // Remove item
    document.querySelectorAll('[data-remove-item]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.dataset.removeItem;
        updateCartItem(key, 0);
      });
    });
  }

  // Update Cart Item
  function updateCartItem(key, quantity) {
    const updates = {};
    updates[key] = quantity;

    fetch(window.routes.cart_update_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates })
    })
      .then(response => response.json())
      .then(cart => {
        updateCartUI(cart);
      })
      .catch(error => {
        console.error('Error updating cart:', error);
      });
  }

  // Add to Cart
  function addToCart(form) {
    const formData = new FormData(form);
    
    fetch(window.routes.cart_add_url, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.description || 'Error adding to cart');
          return;
        }
        fetchCart();
        openCart();
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart');
      });
  }

  // Product Form
  const productForm = document.querySelector('[data-product-form]');
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addToCart(productForm);
    });
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

  // Initialize cart count on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchCart);
  } else {
    fetchCart();
  }
})();

