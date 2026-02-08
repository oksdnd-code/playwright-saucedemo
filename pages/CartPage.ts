import { Locator, Page } from "@playwright/test";

export class CartPage {
    readonly page: Page;
    readonly cartItems: Locator;
    readonly cartItemNames: Locator;
    readonly cartItemPrices: Locator;
    readonly cartItemDescriptions: Locator;
    readonly removeButtons: Locator;
    readonly checkoutButton: Locator;
    readonly continueShoppingButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartItems = page.locator('.cart_item');
        this.cartItemNames = page.locator('.inventory_item_name');
        this.cartItemPrices = page.locator('.inventory_item_price');
        this.cartItemDescriptions = page.locator('.inventory_item_desc');
        this.removeButtons = page.locator('button:has-text("Remove")');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    }

    async getCartItems() {
        const count = await this.cartItems.count();
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push({
                name: await this.cartItems.nth(i).locator('.inventory_item_name').innerText(),
                price: await this.cartItems.nth(i).locator('.inventory_item_price').innerText(),
            });
        }
        return items;
    }

    async clickContinueShopping() {
        await this.continueShoppingButton.click();
    }

    async removeItemByName(name: string): Promise<void> {
        await this.page.locator(`.cart_item:has-text("${name}") button:has-text("Remove")`).click();
    }

    async clickCheckout() {
        await this.checkoutButton.click();
    }
}