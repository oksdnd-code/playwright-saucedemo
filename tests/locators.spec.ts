import { test, expect } from '@playwright/test'
import fs from 'fs'

test.describe('Playwright Locators', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8080')
    });

    //Search by ROLE

    test('Role locators', async ({ page }) => {
        await page.getByRole('button', { name: 'Primary Button' }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        //Search for links
        await expect(page.getByRole('link', { name: 'Playwright Documentation' })).toBeVisible();

        //Search heading
        await expect(page.getByRole('heading', { name: '1. Buttons' })).toBeVisible();

        //Search for rofm elements
        await page.getByRole('textbox', { name: 'Username' }).fill('John');
        await page.getByRole('textbox', { name: 'Email' }).fill('john@gmail.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('password123');
        await page.getByRole('spinbutton', { name: 'Number' }).fill('27');
        await page.getByRole('spinbutton', { name: 'Number' }).press('ArrowUp'); //ArrowDown    

        await page.getByRole('spinbutton', { name: 'Number' }).click();
        await page.getByRole('spinbutton', { name: 'Number' }).fill('35');


        //Checkbox
        await page.getByRole('checkbox', { name: 'Option 1' }).check();
        await expect(page.getByRole('checkbox', { name: 'Option 1' })).toBeChecked();

        //Radio Buttons
        await page.getByRole('radio', { name: 'Choice 1' }).check();

        //Dropdown
        await page.getByRole('combobox', { name: 'Select country' }).selectOption('canada');
    });

    test('Label locators', async ({ page }) => {
        await page.getByLabel('Username:').fill('John Doe');
        await page.getByLabel('Email:').fill('john.doe@gmail.com');

        //Verify value
        await expect(page.getByLabel('Username:')).toHaveValue('John Doe');
    });

    test('Placeholder locators', async ({ page }) => {
        await page.getByPlaceholder('Enter username').fill('john.doe');
        await page.getByPlaceholder('Enter password').fill('hello_world');
    });

    test('Search locator by text content', async ({ page }) => {
        await page.getByText('Primary Button').click();
        await page.getByText('Secondary Button').click();

        await page.getByText('Playwright Documentation').click();
        await page.waitForTimeout(1000);
        const pages = page.context().pages();
        const lastOpenedPage = pages[pages.length - 1];
        expect(await lastOpenedPage.title()).toBe('Fast and reliable end-to-end testing for modern web apps | Playwright');
    });

    test('List locators', async ({ page }) => {
        const listItems = page.locator('#unordered-list li');
        await expect(listItems).toHaveCount(4);

        await expect(listItems.nth(0)).toHaveText('First element');

        const count = await listItems.count();
        for (let i = 0; i < count; i++) {
            const text = await listItems.nth(i).textContent();
            console.log(`Item ${i}: ${text}`);
        }
    });

    test('Dropdown and select', async ({ page }) => {
        const countrySelect = page.getByLabel('Select country:');
        await countrySelect.selectOption('usa');
        await expect(countrySelect).toHaveValue('usa');

        //select option({index: 2});

        await page.getByRole('button', { name: 'Select action' }).click();
        await page.locator('[data-action="edit"]').click();
    });

    test('Modal window locators', async ({ page }) => {
        await page.getByRole('button', { name: 'Open modal window' }).click();

        const modal = page.locator('#myModal');
        await expect(modal).toBeVisible();

        await page.locator('#modal-input').fill('Hello World');
        await page.locator('.close').click();
        await expect(modal).not.toBeVisible();
    });

    //Drag & Drop
    test('Drag and drop', async ({ page }) => {
        const dragItem = page.locator('#item1');
        const dragTarget = page.locator('#drag-target');

        await expect(dragItem).toBeVisible();

        await dragItem.dragTo(dragTarget);

        await expect(dragTarget.locator('#item1')).toBeVisible();
    });

    //File upload
    test('File upload', async ({ page }) => {
        const fileInput = page.locator('#file-input');

        await fileInput.setInputFiles({
            name: 'hello_world.txt',
            mimeType: 'text/plain',
            buffer: fs.readFileSync('test.txt'),
        })

        await fileInput.setInputFiles([
            {
                name: 'test.txt',
                mimeType: 'text/plain',
                buffer: Buffer.from('File 1')
            },
            {
                name: 'test2.txt',
                mimeType: 'text/plain',
                buffer: Buffer.from('File 2')
            }
        ]);

        //Data picker
        test('Datapicker', async ({ page }) => {
            const datePicker = page.getByTestId('date-picker');

            await datePicker.fill('2025-12-10');
            await expect(datePicker).toHaveValue('2025-12-10');

            const currentDatePickerValue = await datePicker.inputValue();
            expect(currentDatePickerValue).toBe('2025-12-10');
        });

        //Progress and Slider
        test('Progress bar', async ({ page }) => {
            const progressBar = page.locator('#progress');

            expect(progressBar).toHaveAttribute('value', '70');
            expect(progressBar).toHaveAttribute('max', '100');

            const currentValue = await progressBar.getAttribute('value');
            const maxValue = await progressBar.getAttribute('max');

            expect(currentValue).toBe('70');
            expect(maxValue).toBe('100');
        });

    });
})