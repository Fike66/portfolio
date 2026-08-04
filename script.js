// ============================================
// CONFETTI GENERATOR
// ============================================
function createConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#d4a853', '#f7d97e', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fb7'];
    const shapes = ['■', '●', '▲', '★', '♦'];
    
    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.fontSize = (Math.random() * 16 + 8) + 'px';
        confetti.style.animationDuration = (Math.random() * 4 + 3) + 's';
        confetti.style.animationDelay = (Math.random() * 4) + 's';
        container.appendChild(confetti);
    }
}

// Start confetti after 1 second
setTimeout(createConfetti, 1000);

// ============================================
// QR CODE GENERATOR
// ============================================
let qrCodeInstance = null;

function generateQRCode() {
    const container = document.getElementById('qrcode');
    if (container) {
        // Clear existing QR code
        container.innerHTML = '';
        
        // Generate new QR code
        qrCodeInstance = new QRCode(container, {
            text: window.location.href,
            width: 100,
            height: 100,
            colorDark: "#2c1810",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Generate QR code when page loads
document.addEventListener('DOMContentLoaded', function() {
    generateQRCode();
});

// ============================================
// GUEST NAME MANAGEMENT
// ============================================
let currentGuestName = '';

function setGuestName() {
    const input = document.getElementById('guestNameInput');
    const name = input.value.trim();
    
    if (name) {
        currentGuestName = name;
        input.style.borderColor = '#25D366';
        input.placeholder = '✓ ' + name;
        input.value = '';
        
        // Show message editor after setting name
        document.getElementById('messageEditor').classList.add('show');
        
        // Update the default message with the name
        updateMessagePreview(name);
        
        // Show success feedback
        showToast(`👋 Hi ${name}! Your invitation is personalized.`);
    } else {
        showToast('⚠️ Please enter a guest name first.');
        input.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            input.style.borderColor = '#e0d5c8';
        }, 2000);
    }
}

function updateMessagePreview(name) {
    const textarea = document.getElementById('customMessage');
    let message = textarea.value;
    
    // Replace {GUEST_NAME} placeholder with actual name
    message = message.replace(/\{GUEST_NAME\}/g, name);
    
    // Store the personalized message for sending
    textarea.dataset.personalized = message;
}

function resetMessage() {
    const textarea = document.getElementById('customMessage');
    textarea.value = `💍 You're Invited! 💍

Dear {GUEST_NAME},

Selam & Yohannes are getting married! 🎉
Join us on October 18, 2026 at 3:00 PM.

Venue: The Grand Rose Garden, 22 Round Addis Ababa

We can't wait to celebrate with you! 🥂
View invitation: {INVITATION_LINK}`;
    
    if (currentGuestName) {
        updateMessagePreview(currentGuestName);
    }
    showToast('🔄 Message reset to default!');
}

// ============================================
// WHATSAPP SHARING WITH PERSONALIZATION
// ============================================
document.getElementById('whatsappShareBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Check if guest name is set
    if (!currentGuestName) {
        showToast('⚠️ Please enter a guest name first!');
        document.getElementById('guestNameInput').focus();
        return;
    }
    
    // Get the message
    let message = document.getElementById('customMessage').value;
    
    // Replace placeholders
    const pageUrl = window.location.href;
    message = message.replace(/\{GUEST_NAME\}/g, currentGuestName);
    message = message.replace(/\{INVITATION_LINK\}/g, pageUrl);
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Track the invitation sent
    trackInvitationSent(currentGuestName);
});

// ============================================
// TRACK INVITATIONS SENT
// ============================================
function trackInvitationSent(guestName) {
    console.log(`📨 Invitation sent to ${guestName} at ${new Date().toLocaleString()}`);
    
    // Save to localStorage
    let sentLog = JSON.parse(localStorage.getItem('invitationLog') || '[]');
    sentLog.push({
        guest: guestName,
        timestamp: new Date().toISOString(),
        type: 'whatsapp'
    });
    localStorage.setItem('invitationLog', JSON.stringify(sentLog));
    
    console.log(`📊 Total invitations sent: ${sentLog.length}`);
}

// ============================================
// RSVP MODAL
// ============================================
function showRSVP() {
    document.getElementById('rsvpModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('rsvpModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
document.getElementById('rsvpModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ============================================
// RSVP FORM HANDLING
// ============================================
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    showToast('🎉 Thank you! Your RSVP has been sent. We can\'t wait to celebrate with you!');
    this.reset();
    closeModal();
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl+Enter to send WhatsApp
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('whatsappShareBtn').click();
    }
});

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
// CONSOLE HELP
// ============================================
console.log('💍 Welcome to Selam & Yohannes\'s Wedding!');
console.log('📋 Quick commands:');
console.log('  - setGuestName(): Personalize the invitation');
console.log('  - showRSVP(): Open RSVP form');
console.log('  - generateQRCode(): Refresh QR code');
console.log('  - resetMessage(): Reset WhatsApp message');
console.log('');
console.log('⌨️ Keyboard shortcuts:');
console.log('  - ESC: Close modals');
console.log('  - Ctrl+Enter: Send WhatsApp');

// ============================================
// DYNAMIC YEAR UPDATE
// ============================================
document.querySelectorAll('.date-badge, .detail-item p').forEach(el => {
    if (el.textContent.includes('2026')) {
        // Keep as is
    }
});