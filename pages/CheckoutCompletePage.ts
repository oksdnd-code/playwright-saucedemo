import { Locator, Page } from '@playwright/test';

export class CheckoutCompletePage {
    readonly page: Page;
    readonly completeHeader: Locator;
    readonly title: Locator;
    readonly ponyExpress: Locator;
    readonly backToProducts: Locator;
    readonly shoppingCartBadge: Locator;

    constructor(page: Page) {
        this.page = page;
        this.completeHeader = this.page.locator('.complete-header');
        this.title = this.page.locator('.title');
        this.ponyExpress = this.page.locator('.pony_express');
        this.backToProducts = this.page.locator('[data-test="back-to-products"]');
        this.shoppingCartBadge = this.page.locator('[data-test="shopping-cart-badge"]');
    }
}