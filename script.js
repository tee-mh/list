class ShoppingListApp {
    constructor() {
        this.items = [];
        this.templates = [];
        this.itemCounter = 0;
        this.scheduledTemplates = [];
        this.isDarkMode = false;
        this.groupByStore = true;
        this.initializeElements();
        this.loadFromStorage();
        this.bindEvents();
        this.updateDisplay();
        this.checkScheduledTemplates();
    }

    initializeElements() {
        this.itemInput = document.getElementById('itemInput');
        this.addBtn = document.getElementById('addBtn');
        this.shoppingList = document.getElementById('shoppingList');
        this.itemCount = document.getElementById('itemCount');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.emptyState = document.getElementById('emptyState');
        this.storeSelector = document.getElementById('storeSelector');
        this.groupByStoreToggle = document.getElementById('groupByStore');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.exportBtn = document.getElementById('exportBtn');

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
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addItem());
        this.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        this.clearAllBtn.addEventListener('click', () => this.clearAllItems());

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (this.groupByStoreToggle) {
            this.groupByStoreToggle.addEventListener('change', () => {
                this.groupByStore = this.groupByStoreToggle.checked;
                this.updateDisplay();
            });
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.showExportMenu());
        }

        // Template events
        if (this.loadTemplateBtn) this.loadTemplateBtn.addEventListener('click', () => this.loadTemplate());
        if (this.saveTemplateBtn) this.saveTemplateBtn.addEventListener('click', () => this.showSaveTemplateModal());
        if (this.enableSchedule) this.enableSchedule.addEventListener('change', () => this.toggleScheduleControls());
        if (this.scheduleBtn) this.scheduleBtn.addEventListener('click', () => this.setupSchedule());

        // Modal events
        if (this.saveTemplateConfirm) this.saveTemplateConfirm.addEventListener('click', () => this.saveTemplate());
        if (this.cancelTemplate) this.cancelTemplate.addEventListener('click', () => this.hideSaveTemplateModal());
        if (this.closeModal) this.closeModal.addEventListener('click', () => this.hideSaveTemplateModal());

        window.addEventListener('click', (e) => {
            if (this.templateModal && e.target === this.templateModal) {
                this.hideSaveTemplateModal();
            }
            // Close export menu if clicking outside
            const exportMenu = document.getElementById('exportMenu');
            if (exportMenu && !exportMenu.contains(e.target) && e.target !== this.exportBtn) {
                exportMenu.remove();
            }
        });
    }

    addItem() {
        const text = this.itemInput.value.trim();
        if (!text) return;

        const store = this.storeSelector ? this.storeSelector.value : 'grocery';

        const item = {
            id: ++this.itemCounter,
            text: text,
            store: store,
            createdAt: new Date(),
            modifiedAt: null
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
            this.saveToStorage();
            this.updateDisplay();
        }
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

    // ── Export ────────────────────────────────────────────────────────────────

    getStoreName(storeKey) {
        const storeNames = {
            tesco: 'Tesco', asda: 'ASDA', sainsburys: "Sainsbury's",
            aldi: 'Aldi', lidl: 'Lidl', morrisons: 'Morrisons',
            homebargains: 'Home Bargains', savers: 'Savers',
            bq: 'B&Q', bm: 'B&M', primark: 'Primark',
            pharmacy: 'Pharmacy', other: 'Other'
        };
        return storeNames[storeKey] || storeKey;
    }

    showExportMenu() {
        const existing = document.getElementById('exportMenu');
        if (existing) { existing.remove(); return; }

        const menu = document.createElement('div');
        menu.id = 'exportMenu';
        menu.className = 'export-menu';
        menu.innerHTML = `
            <button class="export-option" id="exportTxt"><i class="fas fa-file-alt"></i> Export as Text</button>
            <button class="export-option" id="exportCsv"><i class="fas fa-file-csv"></i> Export as CSV</button>
            <button class="export-option" id="exportClipboard"><i class="fas fa-clipboard"></i> Copy to Clipboard</button>
        `;

        const btnRect = this.exportBtn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (btnRect.bottom + 8) + 'px';
        menu.style.left = btnRect.left + 'px';
        document.body.appendChild(menu);

        document.getElementById('exportTxt').addEventListener('click', () => { this.exportAsText(); menu.remove(); });
        document.getElementById('exportCsv').addEventListener('click', () => { this.exportAsCSV(); menu.remove(); });
        document.getElementById('exportClipboard').addEventListener('click', () => { this.copyToClipboard(); menu.remove(); });
    }

    buildTextContent() {
        if (this.items.length === 0) return 'Shopping list is empty.';
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        let lines = [`Shopping List — ${date}`, ''];

        if (this.groupByStore) {
            const groups = {};
            this.items.forEach(item => {
                const store = item.store || 'grocery';
                if (!groups[store]) groups[store] = [];
                groups[store].push(item);
            });
            Object.entries(groups).forEach(([store, items]) => {
                lines.push(`[ ${this.getStoreName(store)} ]`);
                items.forEach(item => lines.push(`  • ${item.text}`));
                lines.push('');
            });
        } else {
            this.items.forEach(item => lines.push(`• ${item.text}`));
        }

        return lines.join('\n');
    }

    buildCSVContent() {
        const rows = [['Item', 'Store', 'Added']];
        this.items.forEach(item => {
            rows.push([
                `"${item.text.replace(/"/g, '""')}"`,
                `"${this.getStoreName(item.store || 'grocery')}"`,
                `"${new Date(item.createdAt).toLocaleDateString('en-GB')}"`
            ]);
        });
        return rows.map(r => r.join(',')).join('\r\n');
    }

    exportAsText() {
        if (this.items.length === 0) { alert('Your shopping list is empty.'); return; }
        this.downloadFile('shopping-list.txt', this.buildTextContent(), 'text/plain');
    }

    exportAsCSV() {
        if (this.items.length === 0) { alert('Your shopping list is empty.'); return; }
        this.downloadFile('shopping-list.csv', this.buildCSVContent(), 'text/csv');
    }

    async copyToClipboard() {
        if (this.items.length === 0) { alert('Your shopping list is empty.'); return; }
        const text = this.buildTextContent();
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('List copied to clipboard!');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.showToast('List copied to clipboard!');
        }
    }

    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    showToast(message) {
        const existing = document.getElementById('toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('toast-visible'), 10);
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ── Theme ─────────────────────────────────────────────────────────────────

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : '');
        if (this.themeIcon) {
            this.themeIcon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
        localStorage.setItem('shoppingListDarkMode', this.isDarkMode.toString());
    }

    // ── Templates ─────────────────────────────────────────────────────────────

    saveTemplate() {
        const name = this.templateName.value.trim();
        if (!name) { alert('Please enter a template name.'); return; }
        if (this.items.length === 0) { alert('Add some items to your list first!'); return; }

        const template = {
            id: Date.now(),
            name: name,
            items: this.items.map(item => ({ text: item.text, store: item.store || 'grocery' })),
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

        if (this.items.length > 0 && !confirm('This will replace your current list. Continue?')) return;

        this.items = template.items.map(item => ({
            id: ++this.itemCounter,
            text: item.text,
            store: item.store || 'grocery',
            createdAt: new Date(),
            modifiedAt: null
        }));

        this.saveToStorage();
        this.updateDisplay();
        alert(`Template "${template.name}" loaded successfully!`);
    }

    showSaveTemplateModal() {
        if (this.items.length === 0) { alert('Add some items to your list first!'); return; }
        if (this.templateModal) {
            this.templateModal.style.display = 'block';
            this.templateName.value = '';
            this.templateName.focus();
        }
    }

    hideSaveTemplateModal() {
        if (this.templateModal) this.templateModal.style.display = 'none';
    }

    updateTemplateSelect() {
        if (!this.templateSelect) return;
        this.templateSelect.innerHTML = '<option value="">Select a template...</option>';
        this.templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = `${template.name} (${template.items.length} items)`;
            this.templateSelect.appendChild(option);
        });
    }

    // ── Scheduling ────────────────────────────────────────────────────────────

    toggleScheduleControls() {
        if (!this.scheduleType || !this.scheduleBtn) return;
        const enabled = this.enableSchedule.checked;
        this.scheduleType.disabled = !enabled;
        this.scheduleBtn.disabled = !enabled;
    }

    setupSchedule() {
        const templateId = parseInt(this.templateSelect.value);
        const scheduleType = this.scheduleType.value;
        if (!templateId) { alert('Please select a template first.'); return; }

        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        const schedule = {
            templateId,
            templateName: template.name,
            type: scheduleType,
            nextRun: this.calculateNextRun(scheduleType),
            active: true
        };

        this.scheduledTemplates = this.scheduledTemplates.filter(s => s.templateId !== templateId);
        this.scheduledTemplates.push(schedule);
        this.saveToStorage();
        alert(`Schedule set! "${template.name}" will auto-refill ${scheduleType}.`);
    }

    calculateNextRun(type) {
        const now = new Date();
        if (type === 'weekly') return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (type === 'monthly') return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        return now;
    }

    checkScheduledTemplates() {
        const now = new Date();
        this.scheduledTemplates.forEach(schedule => {
            if (schedule.active && now >= new Date(schedule.nextRun)) {
                this.executeScheduledTemplate(schedule);
            }
        });
        setTimeout(() => this.checkScheduledTemplates(), 60 * 60 * 1000);
    }

    executeScheduledTemplate(schedule) {
        const template = this.templates.find(t => t.id === schedule.templateId);
        if (!template) return;

        template.items.forEach(templateItem => {
            this.items.push({
                id: ++this.itemCounter,
                text: templateItem.text,
                store: templateItem.store || 'grocery',
                createdAt: new Date(),
                modifiedAt: null
            });
        });

        schedule.nextRun = this.calculateNextRun(schedule.type);
        this.saveToStorage();
        this.updateDisplay();

        if (Notification.permission === 'granted') {
            new Notification('Shopping List Updated', {
                body: `Template "${schedule.templateName}" has been added to your list.`,
                icon: '/favicon.ico'
            });
        }
    }

    // ── Display ───────────────────────────────────────────────────────────────

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
        return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    createItemElement(item, index) {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.setAttribute('data-id', item.id);

        const modifiedText = item.modifiedAt ?
            `<div class="item-modified">Modified ${this.formatTimestamp(item.modifiedAt)}</div>` : '';

        li.innerHTML = `
            <div class="item-content" draggable="true">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <div class="item-text">
                    <input type="text" class="item-edit" value="${this.escapeHtml(item.text)}" maxlength="100">
                    <div class="item-name">${this.escapeHtml(item.text)}</div>
                    <div class="item-timestamp">Added ${this.formatTimestamp(item.createdAt)}</div>
                    ${modifiedText}
                </div>
                <div class="item-actions">
                    <button class="item-btn edit-btn" title="Edit item"><i class="fas fa-edit"></i></button>
                    <button class="item-btn move-up-btn" title="Move up" ${index === 0 ? 'disabled' : ''}><i class="fas fa-chevron-up"></i></button>
                    <button class="item-btn move-down-btn" title="Move down" ${index === this.items.length - 1 ? 'disabled' : ''}><i class="fas fa-chevron-down"></i></button>
                    <button class="item-btn delete-btn" title="Delete item"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;

        this.bindItemEvents(li, item.id);
        return li;
    }

    // ── Drag & Drop ───────────────────────────────────────────────────────────

    bindDragEvents(li, id) {
        const content = li.querySelector('.item-content');

        content.addEventListener('dragstart', (e) => {
            this.dragSrcId = id;
            li.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', id);
        });

        content.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            document.querySelectorAll('.list-item').forEach(el => el.classList.remove('drag-over'));
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            document.querySelectorAll('.list-item').forEach(el => el.classList.remove('drag-over'));
            if (this.dragSrcId !== id) li.classList.add('drag-over');
        });

        li.addEventListener('dragleave', () => {
            li.classList.remove('drag-over');
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            li.classList.remove('drag-over');
            if (this.dragSrcId == null || this.dragSrcId === id) return;

            const srcIndex = this.items.findIndex(item => item.id === this.dragSrcId);
            const dstIndex = this.items.findIndex(item => item.id === id);
            if (srcIndex === -1 || dstIndex === -1) return;

            const [moved] = this.items.splice(srcIndex, 1);
            this.items.splice(dstIndex, 0, moved);
            this.dragSrcId = null;
            this.saveToStorage();
            this.updateDisplay();
        });
    }

    bindItemEvents(element, id) {
        this.bindDragEvents(element, id);

        const editBtn = element.querySelector('.edit-btn');
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
            this.clearAllBtn.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.clearAllBtn.style.display = 'inline-flex';

            if (this.groupByStore) {
                this.renderGroupedByStore();
            } else {
                this.items.forEach((item, index) => {
                    this.shoppingList.appendChild(this.createItemElement(item, index));
                });
            }

            const count = this.items.length;
            this.itemCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        }

        this.updateTemplateSelect();
    }

    renderGroupedByStore() {
        const groups = {};
        this.items.forEach(item => {
            const store = item.store || 'grocery';
            if (!groups[store]) groups[store] = [];
            groups[store].push(item);
        });

        Object.entries(groups).forEach(([store, items]) => {
            const section = document.createElement('li');
            section.className = 'store-category';
            section.innerHTML = `
                <div class="store-header">
                    <span>${this.getStoreName(store)}</span>
                    <span class="store-count">${items.length} item${items.length !== 1 ? 's' : ''}</span>
                </div>
                <ul class="store-items"></ul>
            `;
            const ul = section.querySelector('.store-items');
            items.forEach((item, index) => {
                ul.appendChild(this.createItemElement(item, this.items.indexOf(item)));
            });
            this.shoppingList.appendChild(section);
        });
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
            localStorage.setItem('shoppingListDarkMode', this.isDarkMode.toString());
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
            const savedDarkMode = localStorage.getItem('shoppingListDarkMode');

            if (savedItems) {
                this.items = JSON.parse(savedItems).map(item => ({
                    ...item,
                    createdAt: new Date(item.createdAt),
                    modifiedAt: item.modifiedAt ? new Date(item.modifiedAt) : null,
                    store: item.store || 'grocery'
                }));
            }

            if (savedCounter) this.itemCounter = parseInt(savedCounter, 10);

            if (savedTemplates) {
                this.templates = JSON.parse(savedTemplates).map(t => ({
                    ...t,
                    createdAt: new Date(t.createdAt)
                }));
            }

            if (savedSchedules) {
                this.scheduledTemplates = JSON.parse(savedSchedules).map(s => ({
                    ...s,
                    nextRun: new Date(s.nextRun)
                }));
            }

            if (savedDarkMode === 'true') {
                this.isDarkMode = true;
                document.documentElement.setAttribute('data-theme', 'dark');
                if (this.themeIcon) this.themeIcon.className = 'fas fa-sun';
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.items = [];
            this.templates = [];
            this.scheduledTemplates = [];
            this.itemCounter = 0;
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    new ShoppingListApp();
});
