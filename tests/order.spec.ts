import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { faker } from '@faker-js/faker';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';

let loginPage: LoginPage;
let inventoryPage: InventoryPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;
let checkoutOverviewPage: CheckoutOverviewPage;

function generateRandomUser() {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        postalCode: faker.location.zipCode(),
    };
}

test.describe('Order tests', () => {
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        inventoryPage = new InventoryPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);
        checkoutOverviewPage = new CheckoutOverviewPage(page);
        await page.goto('https://www.saucedemo.com');
        await loginPage.authorize('standard_user', 'secret_sauce');
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html')
    });

    test('Cart badge shows correct count after adding items', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        const count = await inventoryPage.getCartItemCount();
        expect(count).toBe('2');
    });

    test('Check continue shopping button click returns to inventory page', async ({ page }) => {
        await inventoryPage.clickCart();
        await cartPage.clickContinueShopping();
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    });

    test('Check checkout button', async ({ page }) => {
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    });

    test('Add two items to the cart and check item names', async ({ }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();
        const cartItems = await cartPage.getCartItems();
        expect(cartItems.length).toBe(2);
        const names = cartItems.map(i => i.name?.trim());
        expect(names).toContain('Sauce Labs Backpack');
        expect(names).toContain('Sauce Labs Bike Light');
    })

    test('Remove item from the cart', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();
        await cartPage.removeItemByName('Sauce Labs Bike Light');
        const cartItems = await cartPage.getCartItems();
        expect(cartItems.length).toBe(1);
        const names = cartItems.map(i => i.name?.trim());
        expect(names).toContain('Sauce Labs Backpack');
        expect(names).not.toContain('Sauce Labs Bike Light');
    });

    test('Remove all items from cart', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();
        await cartPage.removeItemByName('Sauce Labs Backpack');
        await cartPage.removeItemByName('Sauce Labs Bike Light');
        const cartItems = await cartPage.getCartItems();
        expect(cartItems.length).toBe(0);
    });

    test('Check that item details in cart match inventory', async ({ page }) => {
        const item = await inventoryPage.findItemByName('Sauce Labs Backpack');
        await item?.addToCart();
        await inventoryPage.clickCart();
        const cartItems = await cartPage.getCartItems();
        expect(cartItems[0].name.trim()).toBe(item?.name.trim());
        expect(cartItems[0].price.trim()).toBe(item?.price.trim());
    });

    test('Checkout with random user data', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();

        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);

        await checkoutPage.clickContinue();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
    });


    test('Verify items total and names on checkout', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();

        const cartItems = await cartPage.getCartItems();
        const expectedTotal = cartItems
            .map(item => parseFloat(item.price.replace('$', '')))
            .reduce((sum, price) => sum + price, 0);
        const expectedNames = cartItems.map(item => item.name.trim());

        await cartPage.clickCheckout();

        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);
        await checkoutPage.clickContinue();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');

        const itemTotal = await checkoutOverviewPage.getItemTotal();
        const checkoutNames = await checkoutOverviewPage.getItemNames();

        expect(itemTotal).toBeCloseTo(expectedTotal, 2);
        expect(checkoutNames).toEqual(expect.arrayContaining(expectedNames));
    });

    test('Check cancel button on checkout information page', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();

        await cartPage.clickCheckout();

        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);

        await checkoutOverviewPage.clickCancel();
        await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    });

    test('Order completion page shows correct messages', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();

        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);
        await checkoutPage.clickContinue();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');

        await checkoutOverviewPage.clickFinish();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');

        await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
        await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
    });

    test('Checkout info form shows errors when required fields are missing', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');

        await checkoutPage.clickContinue();
        await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');

        await checkoutPage.fillCheckoutInfo('John', '', '');
        await checkoutPage.clickContinue();
        await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');

        await checkoutPage.fillCheckoutInfo('John', 'Doe', '');
        await checkoutPage.clickContinue();
        await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
    });

    test('Cancel on checkout overview returns to inventory', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack']);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);
        await checkoutPage.clickContinue();
        await checkoutOverviewPage.clickCancel();
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    });

    test('Order completion page shows confirmation icon, back home button and cart is empty', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart(['Sauce Labs Backpack']);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);
        await checkoutPage.clickContinue();
        await checkoutOverviewPage.clickFinish();
        await expect(page.locator('.pony_express')).toBeVisible();
        await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
        await expect(page.locator('[data-test="shopping-cart-badge"]')).not.toBeVisible();
    });

});