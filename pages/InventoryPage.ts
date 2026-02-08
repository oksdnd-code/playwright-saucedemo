import { Locator, Page } from "@playwright/test";

export class InventoryPage {
    private readonly page: Page;
    private readonly cartBadge: Locator;
    private readonly cartLink: Locator;
    private readonly inventoryItems: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartBadge = page.locator('.shopping_cart_badge');
        this.cartLink = page.locator('.shopping_cart_link');
        this.inventoryItems = page.locator('.inventory_item');
    }

    async addProductToCart(productName: string): Promise<void> {
        let dataTestId = this.getDataTestId(productName);
        await this.page.locator(`[data-test="add-to-cart-${dataTestId}"]`).click();
    }


    async addMultipleProductsToCart(productNames: string[]): Promise<void> {
        for (const name of productNames) {
            const item = await this.findItemByName(name);
            await item?.addToCart();
        }
    }

    private getDataTestId(productName: string): string {
        return productName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    }

    async clickCart(): Promise<void> {
        await this.cartLink.click();
        await this.page.waitForURL('https://www.saucedemo.com/cart.html');
    }

    private getProductContainer(productName: string): Locator {
        return this.inventoryItems.filter({ hasText: productName });
    }

    async addProductToCartSimple(productName: string): Promise<void> {
        const product = this.getProductContainer(productName);
        await product.locator('button:has-text("Add to cart")').click();
    }

    async getCartItemCount(): Promise<string> {
        if (await this.cartBadge.isVisible()) {
            return await this.cartBadge.textContent() || '0';
        }
        return '0';
    }

    async removeProduct(productName: string): Promise<void> {
        const item = this.getProductContainer(productName);
        await item.locator('button:has-text("Remove")').click();
    }



    /**
     * Represents a single inventory item with convenient accessors and actions.
     */
    getInventoryItemObjects = async (): Promise<InventoryItemObject[]> => {
        const count = await this.inventoryItems.count();
        const items: InventoryItemObject[] = [];
        for (let i = 0; i < count; i++) {
            const itemLocator = this.inventoryItems.nth(i);
            const name = await itemLocator.locator('.inventory_item_name').innerText();
            const description = await itemLocator.locator('.inventory_item_desc').innerText();
            const price = await itemLocator.locator('.inventory_item_price').innerText();
            const addToCartButton = itemLocator.locator('button:has-text("Add to cart")');
            const removeButton = itemLocator.locator('button:has-text("Remove")');
            items.push(new InventoryItemObject(
                name,
                description,
                price,
                addToCartButton,
                removeButton,
                itemLocator
            ));
        }
        return items;
    }

    /**
     * Find an inventory item object by name (case-insensitive).
     */
    findItemByName = async (name: string): Promise<InventoryItemObject | undefined> => {
        const items = await this.getInventoryItemObjects();
        return items.find(item => item.name.toLowerCase() === name.toLowerCase());
    }
}

/**
 * Inventory item wrapper for convenient property access and actions.
 */
export class InventoryItemObject {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly price: string,
        private readonly addToCartButton: Locator,
        private readonly removeButton: Locator,
        public readonly element: Locator
    ) { }

    /**
     * Clicks the "Add to cart" button for this item.
     */
    async addToCart() {
        await this.addToCartButton.click();
    }

    /**
     * Clicks the "Remove" button for this item (if present).
     */
    async removeFromCart() {
        if (await this.removeButton.isVisible()) {
            await this.removeButton.click();
        }
    }

    /**
     * Returns the price as a number (if possible).
     */
    get priceValue(): number | null {
        const match = this.price.match(/\d+\.?\d*/);
        return match ? parseFloat(match[0]) : null;
    }
}

