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
Join us on October 17, 2026 at 3:00 PM.

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
console.log('💍 Welcome to Emily & James\'s Wedding!');
console.log('📋 Quick commands:');
console.log('  - setGuestName(): Personalize the invitation');
console.log('  - showRSVP(): Open RSVP form');
console.log('  - generateQRCode(): Refresh QR code');
console.log('  - resetMessage(): Reset WhatsApp message');
console.log('');
console.log('⌨️ Keyboard shortcuts:');
console.log('  - ESC: Close modals');


// ============================================
// MUSIC PLAYER
// ============================================

// ============================================
// SONG DATA (Replace with your actual MP3 URLs)
// ============================================
const songs = [
    {
        name: "Abinet A",
        artist: "Abinet",
        url: "AbinetA.mp3",  // <- Your local file
        duration: "6:27"
    },
    {
        name: "Tsegaye E",
        artist: "tsegaye",
        url: "tsegaye.mp3",
        duration: "10:13"
    },
    {
        name: "Perfect",
        artist: "Ed Sheeran",
        url: "EdSheeran.mp3",
        duration: "4:23"
    },
];

// ============================================
// PLAYER STATE
// ============================================
let currentSongIndex = 0;
let isPlaying = false;
let isMuted = false;
let audio = document.getElementById('weddingAudio');
let progressInterval = null;

// ============================================
// INITIALIZE PLAYER
// ============================================
function initPlayer() {
    // Load first song
    loadSong(currentSongIndex);
    
    // Set up audio event listeners
    audio.addEventListener('loadedmetadata', function() {
        updateDurationDisplay();
    });
    
    audio.addEventListener('timeupdate', function() {
        updateProgress();
    });
    
    audio.addEventListener('ended', function() {
        playNextSong();
    });
    
    audio.addEventListener('play', function() {
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('playBtn').classList.add('playing');
        document.getElementById('audioWave').classList.add('active');
        isPlaying = true;
    });
    
    audio.addEventListener('pause', function() {
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('playBtn').classList.remove('playing');
        document.getElementById('audioWave').classList.remove('active');
        isPlaying = false;
    });
}

// ============================================
// LOAD SONG
// ============================================
function loadSong(index) {
    if (index < 0 || index >= songs.length) return;
    
    currentSongIndex = index;
    const song = songs[index];
    audio.src = song.url;
    audio.load();
    
    // Update playlist highlighting
    document.querySelectorAll('.song-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Update duration display
    setTimeout(updateDurationDisplay, 500);
}

// ============================================
// PLAY/PAUSE
// ============================================
function togglePlay() {
    if (audio.paused) {
        audio.play().catch(e => {
            console.log('Autoplay prevented:', e);
            showToast('🎵 Tap play to start the music!');
        });
    } else {
        audio.pause();
    }
}

function playSong(index) {
    if (index === currentSongIndex) {
        togglePlay();
        return;
    }
    loadSong(index);
    audio.play().catch(e => console.log('Play prevented:', e));
}

function playNextSong() {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    playSong(nextIndex);
}

// ============================================
// PROGRESS BAR
// ============================================
function updateProgress() {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
    }
}

function updateDurationDisplay() {
    if (audio.duration) {
        document.getElementById('totalTime').textContent = formatTime(audio.duration);
        // Update song duration in playlist
        const duration = formatTime(audio.duration);
        document.querySelectorAll('.song-item')[currentSongIndex].querySelector('.song-duration').textContent = duration;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// VOLUME CONTROL
// ============================================
function changeVolume(value) {
    audio.volume = value;
    isMuted = value === 0;
    updateVolumeIcon();
}

function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
        audio.volume = 0;
        document.getElementById('volumeSlider').value = 0;
    } else {
        audio.volume = 0.7;
        document.getElementById('volumeSlider').value = 0.7;
    }
    updateVolumeIcon();
}

function updateVolumeIcon() {
    const icon = document.querySelector('.volume-control i');
    if (isMuted || audio.volume === 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (audio.volume < 0.5) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}

// ============================================
// PROGRESS BAR CLICK (Seek)
// ============================================
document.querySelector('.progress-bar').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    if (audio.duration) {
        audio.currentTime = percent * audio.duration;
    }
});

// ============================================
// KEYBOARD SHORTCUTS FOR MUSIC
// ============================================
document.addEventListener('keydown', function(e) {
    // Space bar to toggle play
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            togglePlay();
        }
        // Arrow right/left to seek
        if (e.key === 'ArrowRight') {
            audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
        }
        if (e.key === 'ArrowLeft') {
            audio.currentTime = Math.max(audio.currentTime - 5, 0);
        }
    }
});

// ============================================
// AUTO-PLAY ON FIRST VISIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Try to auto-play after user interaction
    const autoPlay = () => {
        audio.play().catch(() => {
            console.log('Auto-play blocked by browser. Tap play to start.');
        });
        document.removeEventListener('click', autoPlay);
        document.removeEventListener('touchstart', autoPlay);
    };
    
    // Auto-play on first user interaction (required by modern browsers)
    document.addEventListener('click', autoPlay);
    document.addEventListener('touchstart', autoPlay);
    
    // Init player
    setTimeout(initPlayer, 500);
});

// ============================================
// CONSOLE HELP FOR MUSIC
// ============================================
console.log('🎵 Music Player Controls:');
console.log('  - Space: Play/Pause');
console.log('  - Arrow Right/Left: Seek forward/backward');
console.log('  - Click song: Play that song');
console.log('  - Volume slider: Adjust volume');


console.log('  - Ctrl+Enter: Send WhatsApp');

// ============================================
// PLAYER VISIBILITY TOGGLE
// ============================================
let isPlayerOpen = false;

function togglePlayerVisibility() {
    isPlayerOpen = !isPlayerOpen;
    const body = document.getElementById('playerBody');
    const icon = document.querySelector('.toggle-icon');
    
    if (isPlayerOpen) {
        body.classList.add('open');
        icon.classList.add('open');
    } else {
        body.classList.remove('open');
        icon.classList.remove('open');
    }
}

// Auto-open player on first visit (optional)
// Uncomment to auto-open when user clicks play
// setTimeout(() => togglePlayerVisibility(), 1000);
