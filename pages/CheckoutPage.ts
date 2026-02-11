import { Locator, Page } from '@playwright/test';

export class CheckoutPage {
    readonly page: Page;
    readonly cancelButton: Locator;
    readonly continueButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cancelButton = this.page.locator('[data-test="cancel"]');
        this.continueButton = this.page.locator('[data-test="continue"]');
        this.errorMessage = this.page.locator('[data-test="error"]');
    }

    async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
        await this.page.fill('[data-test="firstName"]', firstName);
        await this.page.fill('[data-test="lastName"]', lastName);
        await this.page.fill('[data-test="postalCode"]', postalCode);
    }

    async clickContinue() {
        await this.continueButton.click();
    }

        async clickCancel() {
        await this.cancelButton.click();
    }
}