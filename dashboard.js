// ============================================
// GUEST DATA MANAGEMENT
// ============================================
let guests = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredGuests = [];

// Load guests from localStorage
function loadGuests() {
    const saved = localStorage.getItem('weddingGuests');
    if (saved) {
        guests = JSON.parse(saved);
    } else {
        // Sample data to start with
        guests = [
            { name: "Kibinesh Wolde", phone: "+2519844164", email: "kibuw@gmail.com", status: "confirmed", sent: true },
            { name: "Dejene Maregn", phone: "+251923624656", email: "dejum@gmail.com", status: "pending", sent: true },
            { name: "Sozit Mohammed", phone: "+251933232993", email: "sozim@gmail.com", status: "pending", sent: true },
            { name: "Dinkines Maregn", phone: "+251949431434", email: "lucym@gmail.com", status: "declined", sent: false },
            { name: "Gedion Tesfaye", phone: "+251935536747", email: "gedit@gmail.com", status: "pending", sent: false },
            { name: "Yordianos Zelalem", phone: "+251942243886", email: "yordiz@gmail.com", status: "confirmed", sent: true }
        ];
        saveGuests();
    }
    filteredGuests = [...guests];
    updateStats();
    renderTable();
}

// Save guests to localStorage
function saveGuests() {
    localStorage.setItem('weddingGuests', JSON.stringify(guests));
}

// Update statistics
function updateStats() {
    document.getElementById('totalGuests').textContent = guests.length;
    document.getElementById('confirmedGuests').textContent = guests.filter(g => g.status === 'confirmed').length;
    document.getElementById('declinedGuests').textContent = guests.filter(g => g.status === 'declined').length;
    document.getElementById('pendingGuests').textContent = guests.filter(g => g.status === 'pending').length;
    document.getElementById('guestCount').textContent = `Showing ${filteredGuests.length} guests`;
}

// ============================================
// TABLE RENDERING
// ============================================
function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredGuests.slice(start, end);
    
    const tbody = document.getElementById('guestTableBody');
    
    if (pageItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #aaa;">
                    <i class="fas fa-inbox" style="font-size: 40px; display: block; margin-bottom: 10px;"></i>
                    No guests found. Import a CSV or add guests manually.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageItems.map((guest, index) => {
        const realIndex = guests.indexOf(guest);
        const statusClass = `status-${guest.status}`;
        const statusIcon = {
            'confirmed': '✅',
            'pending': '⏳',
            'declined': '❌'
        }[guest.status] || '❓';
        
        return `
            <tr>
                <td><input type="checkbox" class="guest-checkbox" data-index="${realIndex}"></td>
                <td><strong>${escapeHtml(guest.name)}</strong></td>
                <td><a href="https://wa.me/${guest.phone.replace(/\D/g, '')}" target="_blank" style="color: #25D366; text-decoration: none;">${escapeHtml(guest.phone)}</a></td>
                <td>${guest.email ? escapeHtml(guest.email) : '—'}</td>
                <td><span class="status-badge ${statusClass}">${statusIcon} ${guest.status}</span></td>
                <td>${guest.sent ? '📨 Sent' : '⏳ Pending'}</td>
                <td>
                    <button class="action-btn" onclick="editGuest(${realIndex})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteGuest(${realIndex})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn whatsapp" onclick="sendSingleReminder(${realIndex})" title="Send WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="action-btn" onclick="quickStatusUpdate(${realIndex}, 'confirmed')" title="Confirm" style="color: #27ae60;">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn" onclick="quickStatusUpdate(${realIndex}, 'declined')" title="Decline" style="color: #e74c3c;">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update pagination
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// FILTERING & SEARCH
// ============================================
function filterGuests() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    
    filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(search) || 
                             guest.phone.includes(search) ||
                             (guest.email && guest.email.toLowerCase().includes(search));
        const matchesStatus = status === 'all' || guest.status === status;
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    renderTable();
    updateStats();
}

// ============================================
// CSV IMPORT/EXPORT
// ============================================
function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            showToast('⚠️ CSV file is empty or invalid.');
            return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('guest'));
        const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel'));
        const emailIndex = headers.findIndex(h => h.includes('email'));
        
        if (nameIndex === -1 || phoneIndex === -1) {
            showToast('⚠️ CSV must have "Name" and "Phone" columns.');
            return;
        }
        
        let imported = 0;
        let errors = 0;
        
        for (let i = 1; i < lines.length; i++) {
            // Handle quoted values properly
            const columns = parseCSVLine(lines[i]);
            
            if (columns.length <= Math.max(nameIndex, phoneIndex)) {
                errors++;
                continue;
            }
            
            const name = columns[nameIndex]?.trim();
            const phone = columns[phoneIndex]?.trim();
            const email = emailIndex !== -1 ? columns[emailIndex]?.trim() || '' : '';
            
            if (name && phone) {
                guests.push({
                    name: name,
                    phone: phone,
                    email: email || '',
                    status: 'pending',
                    sent: false
                });
                imported++;
            } else {
                errors++;
            }
        }
        
        saveGuests();
        filteredGuests = [...guests];
        updateStats();
        renderTable();
        
        if (errors > 0) {
            showToast(`✅ Imported ${imported} guests (${errors} errors skipped)`);
        } else {
            showToast(`✅ Successfully imported ${imported} guests!`);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// Parse CSV line with quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function exportGuestList() {
    if (guests.length === 0) {
        showToast('⚠️ No guests to export.');
        return;
    }
    
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Sent'];
    const csvRows = [headers.join(',')];
    
    guests.forEach(guest => {
        csvRows.push([
            `"${guest.name}"`,
            `"${guest.phone}"`,
            `"${guest.email || ''}"`,
            guest.status,
            guest.sent ? 'Yes' : 'No'
        ].join(','));
    });
    
    const csvText = csvRows.join('\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding_guests_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 Guest list exported successfully!');
}

// ============================================
// ADD/EDIT/DELETE GUESTS
// ============================================
function addGuestManually() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add Guest';
    document.getElementById('editIndex').value = '-1';
    document.getElementById('guestForm').reset();
    document.getElementById('guestModal').classList.add('show');
}

function editGuest(index) {
    const guest = guests[index];
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit Guest';
    document.getElementById('editIndex').value = index;
    document.getElementById('guestName').value = guest.name;
    document.getElementById('guestPhone').value = guest.phone;
    document.getElementById('guestEmail').value = guest.email || '';
    document.getElementById('guestStatus').value = guest.status;
    document.getElementById('guestModal').classList.add('show');
}

function deleteGuest(index) {
    if (confirm(`Delete ${guests[index].name} from the guest list?`)) {
        guests.splice(index, 1);
        saveGuests();
        filteredGuests = [...guests];
        updateStats();
        renderTable();
        showToast(`🗑️ Guest deleted.`);
    }
}

function saveGuest(event) {
    event.preventDefault();
    const index = parseInt(document.getElementById('editIndex').value);
    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const email = document.getElementById('guestEmail').value.trim();
    const status = document.getElementById('guestStatus').value;
    
    if (!name || !phone) {
        showToast('⚠️ Name and Phone are required.');
        return;
    }
    
    const guestData = { name, phone, email, status, sent: false };
    
    if (index === -1) {
        guests.push(guestData);
        showToast(`👋 Added ${name}!`);
    } else {
        // Preserve sent status when editing
        guestData.sent = guests[index].sent;
        guests[index] = guestData;
        showToast(`✏️ Updated ${name}!`);
    }
    
    saveGuests();
    filteredGuests = [...guests];
    updateStats();
    renderTable();
    closeGuestModal();
}

function closeGuestModal() {
    document.getElementById('guestModal').classList.remove('show');
}

// ============================================
// QUICK STATUS UPDATE
// ============================================
function quickStatusUpdate(index, newStatus) {
    const guest = guests[index];
    const statusLabels = {
        'confirmed': 'Confirmed ✅',
        'declined': 'Declined ❌',
        'pending': 'Pending ⏳'
    };
    
    if (confirm(`Update ${guest.name}'s status to "${statusLabels[newStatus]}"?`)) {
        guest.status = newStatus;
        saveGuests();
        renderTable();
        updateStats();
        showToast(`✅ ${guest.name} is now ${newStatus}!`);
    }
}

// ============================================
// WHATSAPP SENDING
// ============================================
function sendSingleReminder(index) {
    const guest = guests[index];
    
    const message = `Friendly Reminder! 💍

የተከበሩ ${guest.name},

በጥቅምት 18, 2018 በሚደረገው የ ዮሃንስ ሸዋ እና የሰላም ማረኝ ጋብቻ ፕሮግራም ላይ እንድትገኙ በአክብሮት ጠርተንዎታል (ሰአት ከ 9:00 - 11:00)

ቦታው: The Grand Rose Garden, 22 ማዞሪያ, አዲስ አበባ

Please respond if you haven't already: ${window.location.href.replace('dashboard.html', 'index.html')}

Can't wait to celebrate with you! 🥂`;
    
    const encodedMessage = encodeURIComponent(message);
    const phone = guest.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Mark as sent
    guest.sent = true;
    saveGuests();
    renderTable();
    showToast(`📨 Reminder sent to ${guest.name}!`);
}

function openReminderModal() {
    document.getElementById('reminderModal').classList.add('show');
}

function closeReminderModal() {
    document.getElementById('reminderModal').classList.remove('show');
}

function sendReminders(event) {
    event.preventDefault();
    
    const type = document.getElementById('reminderType').value;
    let message = document.getElementById('reminderMessage').value;
    
    // Determine recipients based on type
    let recipients = [];
    const typeLabels = {
        'all': 'all guests',
        'pending': 'pending guests',
        'confirmed': 'confirmed guests',
        'declined': 'declined guests'
    };
    
    if (type === 'all') {
        recipients = guests;
    } else if (type === 'pending') {
        recipients = guests.filter(g => g.status === 'pending');
    } else if (type === 'confirmed') {
        recipients = guests.filter(g => g.status === 'confirmed');
    } else if (type === 'declined') {
        recipients = guests.filter(g => g.status === 'declined');
    }
    
    // Check if there are recipients
    if (recipients.length === 0) {
        showToast(`⚠️ No guests found with status: ${type}`);
        return;
    }
    
    // Confirm before sending
    if (!confirm(`📨 Send reminders to ${recipients.length} ${typeLabels[type]}?\n\nThis will open WhatsApp for each guest individually.`)) {
        return;
    }
    
    // Send to each recipient
    let sentCount = 0;
    const totalRecipients = recipients.length;
    
    recipients.forEach((guest, index) => {
        setTimeout(() => {
            // Personalize message
            let personalizedMessage = message
                .replace(/\{GUEST_NAME\}/g, guest.name)
                .replace(/\{INVITATION_LINK\}/g, window.location.href.replace('dashboard.html', 'index.html'));
            
            // Clean phone number
            const phone = guest.phone.replace(/\D/g, '');
            const encodedMessage = encodeURIComponent(personalizedMessage);
            const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Mark as sent
            guest.sent = true;
            sentCount++;
            
            // Update progress
            if (sentCount % 5 === 0 || sentCount === totalRecipients) {
                showToast(`📨 Sent ${sentCount}/${totalRecipients} reminders...`);
            }
            
            // Final completion
            if (sentCount === totalRecipients) {
                saveGuests();
                renderTable();
                updateStats();
                closeReminderModal();
                showToast(`✅ Successfully sent ${sentCount} reminders! 🎉`);
            }
        }, index * 1500); // 1.5 second delay
    });
}

// ============================================
// PAGINATION
// ============================================
function changePage(delta) {
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
    }
}

// ============================================
// SELECT ALL
// ============================================
function toggleAll() {
    const checked = document.getElementById('selectAll').checked;
    document.querySelectorAll('.guest-checkbox').forEach(cb => cb.checked = checked);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        closeGuestModal();
        closeReminderModal();
    }
    
    // Ctrl+F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadGuests();
    
    // Auto-focus search on load
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 500);
});

// ============================================
// CONSOLE HELP
// ============================================
console.log('💍 Wedding Guest Dashboard loaded!');
console.log('📊 Commands:');
console.log('  - guests: View all guests');
console.log('  - exportGuestList(): Export CSV');
console.log('  - addGuestManually(): Add new guest');
console.log('  - guests.length: Total guests');
console.log('  - guests.filter(g => g.status === "pending"): Pending guests');