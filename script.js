class ShoppingListApp {
    constructor() {
        this.items = [];
        this.templates = [];
        this.itemCounter = 0;
        this.showPrices = false;
        this.priceCache = new Map();
        this.scheduledTemplates = [];
        this.initializeElements();
        this.loadFromStorage();
        this.bindEvents();
        this.updateDisplay();
        this.checkScheduledTemplates();
    }

    initializeElements() {
        this.itemInput = document.getElementById('itemInput');
        this.addBtn = document.getElementById('addBtn');
        this.priceCheckBtn = document.getElementById('priceCheckBtn');
        this.shoppingList = document.getElementById('shoppingList');
        this.itemCount = document.getElementById('itemCount');
        this.totalPrice = document.getElementById('totalPrice');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.togglePricesBtn = document.getElementById('togglePricesBtn');
        this.emptyState = document.getElementById('emptyState');
        
        // Template elements
        this.templateSelect = document.getElementById('templateSelect');
        this.loadTemplateBtn = document.getElementById('loadTemplateBtn');
        this.saveTemplateBtn = document.getElementById('saveTemplateBtn');
        this.enableSchedule = document.getElementById('enableSchedule');
        this.scheduleType = document.getElementById('scheduleType');
        this.scheduleBtn = document.getElementById('scheduleBtn');
        
        // Modal elements
        this.templateModal = document.getElementById('templateModal');
        this.templateName = document.getElementById('templateName');
        this.saveTemplateConfirm = document.getElementById('saveTemplateConfirm');
        this.cancelTemplate = document.getElementById('cancelTemplate');
        this.closeModal = document.querySelector('.close');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addItem());
        this.priceCheckBtn.addEventListener('click', () => this.checkAllPrices());
        this.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        this.clearAllBtn.addEventListener('click', () => this.clearAllItems());
        this.togglePricesBtn.addEventListener('click', () => this.togglePriceDisplay());
        
        // Template events
        this.loadTemplateBtn.addEventListener('click', () => this.loadTemplate());
        this.saveTemplateBtn.addEventListener('click', () => this.showSaveTemplateModal());
        this.enableSchedule.addEventListener('change', () => this.toggleScheduleControls());
        this.scheduleBtn.addEventListener('click', () => this.setupSchedule());
        
        // Modal events
        this.saveTemplateConfirm.addEventListener('click', () => this.saveTemplate());
        this.cancelTemplate.addEventListener('click', () => this.hideSaveTemplateModal());
        this.closeModal.addEventListener('click', () => this.hideSaveTemplateModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === this.templateModal) {
                this.hideSaveTemplateModal();
            }
        });
    }

    addItem() {
        const text = this.itemInput.value.trim();
        if (!text) return;

        const item = {
            id: ++this.itemCounter,
            text: text,
            createdAt: new Date(),
            modifiedAt: null,
            price: null,
            priceOptions: []
        };

        this.items.push(item);
        this.itemInput.value = '';
        this.saveToStorage();
        this.updateDisplay();
        this.itemInput.focus();
    }

    editItem(id, newText) {
        const item = this.items.find(item => item.id === id);
        if (item && newText.trim() && newText.trim() !== item.text) {
            item.text = newText.trim();
            item.modifiedAt = new Date();
            // Clear price data when item is edited
            item.price = null;
            item.priceOptions = [];
            this.saveToStorage();
            this.updateDisplay();
        }
    }

    async checkAllPrices() {
        if (this.items.length === 0) {
            alert('Add some items to your list first!');
            return;
        }

        this.showLoading();
        
        try {
            for (const item of this.items) {
                await this.checkItemPrice(item);
                await this.delay(1000); // Rate limiting
            }
            this.saveToStorage();
            this.updateDisplay();
        } catch (error) {
            console.error('Error checking prices:', error);
            alert('Failed to check some prices. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async checkItemPrice(item) {
        try {
            // In a real implementation, this would call actual price APIs
            // For demo purposes, we'll simulate price data
            const mockPrices = await this.getMockPriceData(item.text);
            item.price = mockPrices.length > 0 ? mockPrices[0].price : null;
            item.priceOptions = mockPrices;
            this.priceCache.set(item.text.toLowerCase(), mockPrices);
        } catch (error) {
            console.error(`Failed to get price for ${item.text}:`, error);
        }
    }

    async getMockPriceData(itemName) {
        // Simulate API delay
        await this.delay(Math.random() * 1000 + 500);
        
        // Mock price data - in real implementation, this would call actual APIs
        const stores = ['Walmart', 'Target', 'Amazon', 'Kroger', 'Costco'];
        const basePrice = Math.random() * 20 + 2; // $2-$22 base price
        
        return stores.map(store => ({
            store: store,
            price: (basePrice + (Math.random() - 0.5) * 4).toFixed(2),
            url: `https://${store.toLowerCase()}.com/search?q=${encodeURIComponent(itemName)}`
        })).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    togglePriceDisplay() {
        this.showPrices = !this.showPrices;
        this.togglePricesBtn.innerHTML = this.showPrices ? 
            '<i class="fas fa-eye-slash"></i> Hide Prices' : 
            '<i class="fas fa-eye"></i> Show Prices';
        this.updateDisplay();
    }

    showLoading() {
        this.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('active');
    }

    deleteItem(id) {
        const itemElement = document.querySelector(`[data-id="${id}"]`);
        if (itemElement) {
            itemElement.classList.add('removing');
            setTimeout(() => {
                this.items = this.items.filter(item => item.id !== id);
                this.saveToStorage();
                this.updateDisplay();
            }, 300);
        }
    }

    moveItemUp(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index > 0) {
            [this.items[index], this.items[index - 1]] = [this.items[index - 1], this.items[index]];
            this.saveToStorage();
            this.updateDisplay();
        }
    }

    moveItemDown(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index < this.items.length - 1) {
            [this.items[index], this.items[index + 1]] = [this.items[index + 1], this.items[index]];
            this.saveToStorage();
            this.updateDisplay();
        }
    }

    clearAllItems() {
        if (this.items.length === 0) return;
        
        if (confirm('Are you sure you want to clear all items? This action cannot be undone.')) {
            this.items = [];
            this.saveToStorage();
            this.updateDisplay();
        }
    }

    // Template Management
    saveTemplate() {
        const name = this.templateName.value.trim();
        if (!name) {
            alert('Please enter a template name.');
            return;
        }

        if (this.items.length === 0) {
            alert('Add some items to your list first!');
            return;
        }

        const template = {
            id: Date.now(),
            name: name,
            items: this.items.map(item => ({
                text: item.text,
                price: item.price,
                priceOptions: item.priceOptions
            })),
            createdAt: new Date()
        };

        this.templates.push(template);
        this.saveToStorage();
        this.updateTemplateSelect();
        this.hideSaveTemplateModal();
        alert(`Template "${name}" saved successfully!`);
    }

    loadTemplate() {
        const selectedId = parseInt(this.templateSelect.value);
        if (!selectedId) return;

        const template = this.templates.find(t => t.id === selectedId);
        if (!template) return;

        if (this.items.length > 0) {
            if (!confirm('This will replace your current list. Continue?')) {
                return;
            }
        }

        this.items = template.items.map(item => ({
            id: ++this.itemCounter,
            text: item.text,
            createdAt: new Date(),
            modifiedAt: null,
            price: item.price,
            priceOptions: item.priceOptions || []
        }));

        this.saveToStorage();
        this.updateDisplay();
        alert(`Template "${template.name}" loaded successfully!`);
    }

    showSaveTemplateModal() {
        if (this.items.length === 0) {
            alert('Add some items to your list first!');
            return;
        }
        this.templateModal.style.display = 'block';
        this.templateName.value = '';
        this.templateName.focus();
    }

    hideSaveTemplateModal() {
        this.templateModal.style.display = 'none';
    }

    updateTemplateSelect() {
        this.templateSelect.innerHTML = '<option value="">Select a template...</option>';
        this.templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = `${template.name} (${template.items.length} items)`;
            this.templateSelect.appendChild(option);
        });
    }

    // Schedule Management
    toggleScheduleControls() {
        const enabled = this.enableSchedule.checked;
        this.scheduleType.disabled = !enabled;
        this.scheduleBtn.disabled = !enabled;
    }

    setupSchedule() {
        const templateId = parseInt(this.templateSelect.value);
        const scheduleType = this.scheduleType.value;
        
        if (!templateId) {
            alert('Please select a template first.');
            return;
        }

        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        const schedule = {
            templateId: templateId,
            templateName: template.name,
            type: scheduleType,
            nextRun: this.calculateNextRun(scheduleType),
            active: true
        };

        // Remove existing schedule for this template
        this.scheduledTemplates = this.scheduledTemplates.filter(s => s.templateId !== templateId);
        this.scheduledTemplates.push(schedule);
        
        this.saveToStorage();
        alert(`Schedule set! "${template.name}" will auto-refill ${scheduleType}.`);
    }

    calculateNextRun(type) {
        const now = new Date();
        if (type === 'weekly') {
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (type === 'monthly') {
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            return nextMonth;
        }
        return now;
    }

    checkScheduledTemplates() {
        const now = new Date();
        this.scheduledTemplates.forEach(schedule => {
            if (schedule.active && now >= new Date(schedule.nextRun)) {
                this.executeScheduledTemplate(schedule);
            }
        });
        
        // Check again in 1 hour
        setTimeout(() => this.checkScheduledTemplates(), 60 * 60 * 1000);
    }

    executeScheduledTemplate(schedule) {
        const template = this.templates.find(t => t.id === schedule.templateId);
        if (!template) return;

        // Add template items to current list
        template.items.forEach(templateItem => {
            const item = {
                id: ++this.itemCounter,
                text: templateItem.text,
                createdAt: new Date(),
                modifiedAt: null,
                price: templateItem.price,
                priceOptions: templateItem.priceOptions || []
            };
            this.items.push(item);
        });

        // Update next run time
        schedule.nextRun = this.calculateNextRun(schedule.type);
        
        this.saveToStorage();
        this.updateDisplay();
        
        // Notify user
        if (Notification.permission === 'granted') {
            new Notification('Shopping List Updated', {
                body: `Template "${schedule.templateName}" has been added to your list.`,
                icon: '/favicon.ico'
            });
        }
    }

    formatTimestamp(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    createItemElement(item, index) {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.setAttribute('data-id', item.id);

        const modifiedText = item.modifiedAt ? 
            `<div class="item-modified">Modified ${this.formatTimestamp(item.modifiedAt)}</div>` : '';

        const priceDisplay = this.showPrices && item.price ? 
            `<div class="item-price">$${item.price}</div>` : '';

        const priceOptionsHtml = this.showPrices && item.priceOptions && item.priceOptions.length > 0 ? 
            `<div class="price-suggestions">
                <h5><i class="fas fa-store"></i> Price Comparison</h5>
                ${item.priceOptions.slice(0, 3).map(option => 
                    `<div class="price-option">
                        <span class="store-name">${option.store}</span>
                        <span class="store-price">$${option.price}</span>
                    </div>`
                ).join('')}
            </div>` : '';

        li.innerHTML = `
            <div class="item-content">
                <div class="item-text">
                    <input type="text" class="item-edit" value="${this.escapeHtml(item.text)}" maxlength="100">
                    <div class="item-name">${this.escapeHtml(item.text)}</div>
                    <div class="item-timestamp">Added ${this.formatTimestamp(item.createdAt)}</div>
                    ${modifiedText}
                    ${priceDisplay}
                    ${priceOptionsHtml}
                </div>
                <div class="item-actions">
                    <button class="item-btn edit-btn" title="Edit item">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="item-btn price-btn" title="Check price">
                        <i class="fas fa-dollar-sign"></i>
                    </button>
                    <button class="item-btn move-up-btn" title="Move up" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="item-btn move-down-btn" title="Move down" ${index === this.items.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <button class="item-btn delete-btn" title="Delete item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        this.bindItemEvents(li, item.id);
        return li;
    }

    bindItemEvents(element, id) {
        const editBtn = element.querySelector('.edit-btn');
        const priceBtn = element.querySelector('.price-btn');
        const editInput = element.querySelector('.item-edit');
        const itemName = element.querySelector('.item-name');
        const moveUpBtn = element.querySelector('.move-up-btn');
        const moveDownBtn = element.querySelector('.move-down-btn');
        const deleteBtn = element.querySelector('.delete-btn');

        let isEditing = false;

        editBtn.addEventListener('click', () => {
            if (!isEditing) {
                isEditing = true;
                editInput.classList.add('active');
                itemName.classList.add('editing');
                editInput.focus();
                editInput.select();
                editBtn.innerHTML = '<i class="fas fa-check"></i>';
                editBtn.title = 'Save changes';
            } else {
                this.saveEdit(id, editInput.value, editInput, itemName, editBtn);
                isEditing = false;
            }
        });

        priceBtn.addEventListener('click', async () => {
            const item = this.items.find(item => item.id === id);
            if (item) {
                this.showLoading();
                await this.checkItemPrice(item);
                this.hideLoading();
                this.saveToStorage();
                this.updateDisplay();
            }
        });

        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit(id, editInput.value, editInput, itemName, editBtn);
                isEditing = false;
            }
        });

        editInput.addEventListener('blur', () => {
            if (isEditing) {
                this.saveEdit(id, editInput.value, editInput, itemName, editBtn);
                isEditing = false;
            }
        });

        moveUpBtn.addEventListener('click', () => this.moveItemUp(id));
        moveDownBtn.addEventListener('click', () => this.moveItemDown(id));
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this item?')) {
                this.deleteItem(id);
            }
        });
    }

    saveEdit(id, newText, editInput, itemName, editBtn) {
        this.editItem(id, newText);
        editInput.classList.remove('active');
        itemName.classList.remove('editing');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit item';
    }

    updateDisplay() {
        this.shoppingList.innerHTML = '';
        
        if (this.items.length === 0) {
            this.emptyState.style.display = 'block';
            this.itemCount.textContent = '0 items';
            this.totalPrice.textContent = 'Total: $0.00';
            this.clearAllBtn.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.clearAllBtn.style.display = 'inline-flex';
            
            this.items.forEach((item, index) => {
                this.shoppingList.appendChild(this.createItemElement(item, index));
            });
            
            const count = this.items.length;
            this.itemCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
            
            // Calculate total price
            const total = this.items.reduce((sum, item) => {
                return sum + (item.price ? parseFloat(item.price) : 0);
            }, 0);
            this.totalPrice.textContent = `Total: $${total.toFixed(2)}`;
        }
        
        this.updateTemplateSelect();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToStorage() {
        try {
            localStorage.setItem('shoppingListItems', JSON.stringify(this.items));
            localStorage.setItem('shoppingListCounter', this.itemCounter.toString());
            localStorage.setItem('shoppingListTemplates', JSON.stringify(this.templates));
            localStorage.setItem('shoppingListSchedules', JSON.stringify(this.scheduledTemplates));
            localStorage.setItem('shoppingListShowPrices', this.showPrices.toString());
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const savedItems = localStorage.getItem('shoppingListItems');
            const savedCounter = localStorage.getItem('shoppingListCounter');
            const savedTemplates = localStorage.getItem('shoppingListTemplates');
            const savedSchedules = localStorage.getItem('shoppingListSchedules');
            const savedShowPrices = localStorage.getItem('shoppingListShowPrices');
            
            if (savedItems) {
                this.items = JSON.parse(savedItems).map(item => ({
                    ...item,
                    createdAt: new Date(item.createdAt),
                    modifiedAt: item.modifiedAt ? new Date(item.modifiedAt) : null,
                    price: item.price || null,
                    priceOptions: item.priceOptions || []
                }));
            }
            
            if (savedCounter) {
                this.itemCounter = parseInt(savedCounter, 10);
            }
            
            if (savedTemplates) {
                this.templates = JSON.parse(savedTemplates).map(template => ({
                    ...template,
                    createdAt: new Date(template.createdAt)
                }));
            }
            
            if (savedSchedules) {
                this.scheduledTemplates = JSON.parse(savedSchedules).map(schedule => ({
                    ...schedule,
                    nextRun: new Date(schedule.nextRun)
                }));
            }
            
            if (savedShowPrices) {
                this.showPrices = savedShowPrices === 'true';
                this.togglePricesBtn.innerHTML = this.showPrices ? 
                    '<i class="fas fa-eye-slash"></i> Hide Prices' : 
                    '<i class="fas fa-eye"></i> Show Prices';
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.items = [];
            this.templates = [];
            this.scheduledTemplates = [];
            this.itemCounter = 0;
            this.showPrices = false;
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    new ShoppingListApp();
});
