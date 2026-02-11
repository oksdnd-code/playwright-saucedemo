import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { faker } from '@faker-js/faker';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { URLS, ITEMS, ERROR_MESSAGES, SUCCESS_MESSAGES, CREDENTIALS } from '../constants';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

let loginPage: LoginPage;
let inventoryPage: InventoryPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;
let checkoutOverviewPage: CheckoutOverviewPage;
let checkoutCompletePage: CheckoutCompletePage;

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
        checkoutCompletePage = new CheckoutCompletePage(page);
        await page.goto(URLS.BASE);
        await loginPage.authorize(CREDENTIALS.USER_NAME, CREDENTIALS.PASSWORD);
        await expect(page).toHaveURL(URLS.INVENTORY)
    });

    test('Cart badge shows correct count after adding items', async ({ }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        const count = await inventoryPage.getCartItemCount();
        expect(count).toBe('2');
    });

    test('Check continue shopping button click returns to inventory page', async ({ page }) => {
        await inventoryPage.clickCart();
        await cartPage.clickContinueShopping();
        await expect(page).toHaveURL(URLS.INVENTORY);
    });

    test('Check checkout button', async ({ page }) => {
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        await expect(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
    });

    test('Add two items to the cart and check item names', async ({ }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        await inventoryPage.clickCart();
        const cartItems = await cartPage.getCartItems();
        expect(cartItems.length).toBe(2);
        const names = cartItems.map(i => i.name?.trim());
        expect(names).toContain(ITEMS.BACKPACK);
        expect(names).toContain(ITEMS.BIKE_LIGHT);
    })

    test('Remove item from the cart', async ({ }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        await inventoryPage.clickCart();
        await cartPage.removeItemByName(ITEMS.BIKE_LIGHT);
        const cartItems = await cartPage.getCartItems();
        expect(cartItems.length).toBe(1);
        const names = cartItems.map(i => i.name?.trim());
        expect(names).toContain(ITEMS.BACKPACK);
        expect(names).not.toContain(ITEMS.BIKE_LIGHT);
    });

    test('Remove all items from cart', async ({ }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        await inventoryPage.clickCart();
        await cartPage.removeItemByName(ITEMS.BACKPACK);
        await cartPage.removeItemByName(ITEMS.BIKE_LIGHT);
        const cartItems = await cartPage.getCartItems();
        expect(cartItems.length).toBe(0);
    });

    test('Check that item details in cart match inventory', async ({ }) => {
        const item = await inventoryPage.findItemByName(ITEMS.BACKPACK);
        await item?.addToCart();
        await inventoryPage.clickCart();
        const cartItems = await cartPage.getCartItems();
        expect(cartItems[0].name.trim()).toBe(item?.name.trim());
        expect(cartItems[0].price.trim()).toBe(item?.price.trim());
    });

    test('Checkout with random user data', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();

        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);

        await checkoutPage.clickContinue();
        await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    });


    test('Verify items total and names on checkout', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
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
        await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);

        const itemTotal = await checkoutOverviewPage.getItemTotal();
        const checkoutNames = await checkoutOverviewPage.getItemNames();

        expect(itemTotal).toBeCloseTo(expectedTotal, 2);
        expect(checkoutNames).toEqual(expect.arrayContaining(expectedNames));
    });

    test('Check cancel button on checkout information page', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        await inventoryPage.clickCart();

        await cartPage.clickCheckout();

        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);

        await checkoutOverviewPage.clickCancel();
        await expect(page).toHaveURL(URLS.CART);
    });

    test('Order completion page shows correct messages', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();

        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);
        await checkoutPage.clickContinue();
        await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);

        await checkoutOverviewPage.clickFinish();
        await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);

        await expect(checkoutCompletePage.completeHeader).toHaveText(SUCCESS_MESSAGES.THANK_YOU);
        await expect(checkoutCompletePage.title).toHaveText(SUCCESS_MESSAGES.CHECKOUT_COMPLETE);
    });

    test('Checkout info form shows errors when required fields are missing', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK, ITEMS.BIKE_LIGHT]);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        await expect(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);

        await checkoutPage.clickContinue();
        await expect(checkoutPage.errorMessage).toHaveText(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
        const { firstName, lastName } = generateRandomUser();

        await checkoutPage.fillCheckoutInfo(firstName, '', '');
        await checkoutPage.clickContinue();
        await expect(checkoutPage.errorMessage).toHaveText(ERROR_MESSAGES.LAST_NAME_REQUIRED);
        await checkoutPage.fillCheckoutInfo(firstName, lastName, '');
        await checkoutPage.clickContinue();
        await expect(checkoutPage.errorMessage).toHaveText(ERROR_MESSAGES.POSTAL_CODE_REQUIRED);
    });

    test('Cancel on checkout overview returns to inventory', async ({ page }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK]);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);
        await checkoutPage.clickContinue();
        await checkoutOverviewPage.clickCancel();
        await expect(page).toHaveURL(URLS.INVENTORY);
    });

    test('Order completion page shows confirmation icon, back home button and cart is empty', async ({ }) => {
        await inventoryPage.addMultipleProductsToCart([ITEMS.BACKPACK]);
        await inventoryPage.clickCart();
        await cartPage.clickCheckout();
        const { firstName, lastName, postalCode } = generateRandomUser();
        await checkoutPage.fillCheckoutInfo(firstName, lastName, postalCode);
        await checkoutPage.clickContinue();
        await checkoutOverviewPage.clickFinish();
        await expect(checkoutCompletePage.ponyExpress).toBeVisible();
        await expect(checkoutCompletePage.backToProducts).toBeVisible();
        await expect(checkoutCompletePage.shoppingCartBadge).not.toBeVisible();
    });

});