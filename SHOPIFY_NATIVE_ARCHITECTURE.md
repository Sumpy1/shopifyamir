# Shopify Native Cart & Checkout Architecture

This theme has been refactored to use **Shopify's native cart and checkout functionality**. All backend logic (cart, checkout, inventory, pricing, taxes, payments) is controlled by Shopify.

## Architecture Principles

### ✅ What Shopify Controls
- **Cart State**: All cart mutations (add, update, remove) handled by Shopify backend
- **Checkout Flow**: Native Shopify checkout at `/checkout`
- **Inventory**: Real-time inventory checks by Shopify
- **Pricing**: Shopify calculates prices, taxes, discounts
- **Payments**: Shopify handles all payment processing

### ✅ What JavaScript Does (Presentation Only)
- **UI Feedback**: Loading states, button disabled states, animations
- **Display Updates**: Fetching cart data for display purposes only
- **Form Enhancements**: Quantity button controls (visual only)
- **No Business Logic**: JavaScript never mutates cart state

## Implementation Details

### 1. Product Add to Cart

**File**: `sections/product-template.liquid`

```liquid
<form action="/cart/add" method="post" enctype="multipart/form-data">
  <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
  <input type="number" name="quantity" value="1" min="1">
  <button type="submit">Add to Cart</button>
</form>
```

- ✅ Form submits natively to `/cart/add`
- ✅ No JavaScript interception
- ✅ JavaScript only adds loading state feedback
- ✅ Shopify handles validation, inventory checks, cart updates

### 2. Cart Drawer

**File**: `snippets/cart-drawer.liquid`

- ✅ Displays cart items using Liquid `{% for item in cart.items %}`
- ✅ Uses native form for updates: `<form action="/cart" method="post">`
- ✅ Checkout button: `<button type="submit" name="checkout">` → redirects to `/checkout`
- ✅ Update button: `<button type="submit" name="update">` → updates cart via Shopify
- ✅ Remove links: `<a href="/cart/change?line=X&quantity=0">` → native Shopify removal

**JavaScript Role**:
- Fetches `/cart.js` for display purposes only
- Updates cart count in header
- Provides loading states on buttons
- **Never mutates cart state**

### 3. Cart Page

**File**: `templates/cart.liquid`

```liquid
<form action="/cart" method="post">
  {% for item in cart.items %}
    <input type="number" name="updates[]" value="{{ item.quantity }}" min="0">
  {% endfor %}
  <button type="submit" name="update">Update Cart</button>
  <button type="submit" name="checkout">Checkout</button>
</form>
```

- ✅ Native Shopify cart form
- ✅ Updates submit to `/cart` with `updates[]` array
- ✅ Checkout redirects to `/checkout` (Shopify handles this)
- ✅ JavaScript only provides loading feedback

### 4. JavaScript Architecture

**File**: `assets/theme.js`

**Key Functions**:

1. **`refreshCartDisplay()`** - Fetches `/cart.js` for display only
2. **`updateCartDisplay(cart)`** - Updates UI elements (count, subtotal)
3. **`setupCartForm(form)`** - Adds loading states to buttons
4. **`setupQuantityControls()`** - Visual quantity buttons (updates input value only)

**Removed Functions**:
- ❌ `addToCart()` - Form submits natively
- ❌ `updateCartItem()` - Form submits natively
- ❌ `removeCartItem()` - Link navigates natively
- ❌ Any cart mutation logic

## Form Submission Flow

### Add to Cart Flow
1. User clicks "Add to Cart"
2. Form submits to `/cart/add` (native POST)
3. Shopify validates, checks inventory, adds to cart
4. Shopify redirects back to product page (or cart page)
5. JavaScript updates cart count display

### Cart Update Flow
1. User changes quantity in cart drawer/page
2. User clicks "Update Cart"
3. Form submits to `/cart` with `updates[]` array
4. Shopify updates cart
5. Page reloads with updated cart (Liquid renders fresh data)

### Checkout Flow
1. User clicks "Checkout"
2. Form submits to `/cart` with `name="checkout"`
3. Shopify redirects to `/checkout`
4. Shopify handles entire checkout process

## Validation Checklist

✅ **Adding a product updates the cart every time**
- Native form submission ensures Shopify processes every add

✅ **Cart persists across page reloads**
- Cart stored in Shopify session/cookie
- Liquid renders cart data on every page load

✅ **Clicking "Checkout" always redirects to /checkout**
- Native form with `name="checkout"` ensures Shopify redirects

✅ **No custom checkout logic exists**
- All checkout handled by Shopify
- No custom checkout templates or routes

✅ **No custom cart state mutations**
- JavaScript only reads cart data for display
- All mutations via native forms

## Files Modified

1. **`sections/product-template.liquid`**
   - Changed form action to `/cart/add`
   - Removed JavaScript form interception
   - Added comments explaining native submission

2. **`snippets/cart-drawer.liquid`**
   - Converted to use Liquid cart data
   - Added native form for cart updates
   - Checkout button uses `name="checkout"`

3. **`templates/cart.liquid`** (NEW)
   - Created native cart page template
   - Uses Shopify's standard cart form structure

4. **`assets/theme.js`**
   - Removed all cart mutation logic
   - Kept only UI feedback functions
   - Added extensive comments explaining architecture

5. **`assets/theme.css`**
   - Added styles for cart page
   - Updated cart drawer styles for form elements

## Testing Checklist

- [ ] Add product to cart → Cart updates immediately
- [ ] Reload page → Cart persists
- [ ] Update quantity in cart drawer → Cart updates
- [ ] Update quantity in cart page → Cart updates
- [ ] Remove item from cart → Item removed
- [ ] Click "Checkout" → Redirects to `/checkout`
- [ ] Add out-of-stock product → Shopify shows error
- [ ] Add product with variant selection → Correct variant added

## Notes

- **No AJAX Cart**: This theme uses native form submissions. For AJAX cart, you would use `/cart/add.js` and `/cart/update.js` endpoints, but still let Shopify control the logic.
- **Cart Drawer Refresh**: When cart drawer opens, it fetches `/cart.js` to update display. This is read-only.
- **Page Reloads**: Cart updates cause page reloads. This ensures Shopify always has the latest cart state.
- **Checkout Redirect**: Shopify automatically redirects to `/checkout` when form submits with `name="checkout"`.
