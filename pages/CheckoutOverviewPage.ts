import { Locator, Page } from '@playwright/test';

export class CheckoutOverviewPage {
    readonly page: Page;
    readonly cancelButton: Locator;
    readonly finishButton: Locator;
    readonly itemTotal: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cancelButton = this.page.locator('[data-test="cancel"]');
        this.finishButton = this.page.locator('[data-test="finish"]');
        this.itemTotal = this.page.locator('.summary_subtotal_label');
    }

    async clickFinish() {
        await this.finishButton.click();
    }

    async clickCancel() {
        await this.cancelButton.click();
    }

    async getItemTotal(): Promise<number> {
        const text = await this.itemTotal.innerText();
        const price = text.replace('Item total: $', '');
        return parseFloat(price) || 0;
    }

    async getItemNames(): Promise<string[]> {
        const items = await this.page.locator('.inventory_item_name').allInnerTexts();
        return items.map(name => name.trim());
    }

    async isOrderComplete() {
        return this.page.locator('.complete-header').isVisible();
    }
}