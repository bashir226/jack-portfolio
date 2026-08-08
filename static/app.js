document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Animation using Intersection Observer
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Simple Parallax scroll effect for images
    const parallaxImages = document.querySelectorAll('.parallax-img');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxImages.forEach(img => {
            const parent = img.parentElement;
            const parentOffsetTop = parent.getBoundingClientRect().top + scrolled;
            const parentHeight = parent.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // Check if element is in viewport
            if (scrolled + viewportHeight > parentOffsetTop && scrolled < parentOffsetTop + parentHeight) {
                // Calculate percentage of scroll inside section
                const relativeScroll = (scrolled + viewportHeight - parentOffsetTop) / (viewportHeight + parentHeight);
                // Translate image slightly (range from -20px to 20px)
                const translateY = (relativeScroll - 0.5) * 40;
                img.style.transform = `scale(1.06) translateY(${translateY}px)`;
            }
        });
    });

    // 3. Interactive Code Tabs Switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    const codeDisplay = document.getElementById('code-display');
    const filenameDisplay = document.getElementById('filename-display');

    const codeSnippets = {
        flask: {
            filename: 'server.py',
            code: `# Flask API Server slots calculation
@app.route('/api/slots', methods=['GET'])
def get_slots():
    master_id = request.args.get('master_id')
    date = request.args.get('date')
    
    # Fetch existing bookings to block busy slots
    conn = get_db_connection()
    booked = conn.execute(
        'SELECT time FROM bookings WHERE master_id = ? AND date = ?',
        (master_id, date)
    ).fetchall()
    conn.close()
    
    busy_times = [b['time'] for b in booked]
    available = [t for t in ALL_SLOTS if t not in busy_times]
    return jsonify({"slots": available})`
        },
        bot: {
            filename: 'bot.py',
            code: `# Telegram Bot WebApp initialization
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = types.InlineKeyboardMarkup()
    # Set up a button linking directly to the WebApp URL
    web_app = types.WebAppInfo("https://url.com/calendar")
    markup.add(types.InlineKeyboardButton(
        text="Забронировать услугу", 
        web_app=web_app
    ))
    
    bot.send_message(
        message.chat.id, 
        "Добро пожаловать! Нажмите кнопку ниже для записи:", 
        reply_markup=markup
    )`
        },
        sql: {
            filename: 'database.sql',
            code: `-- SQLite database schema for booking bot
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    master_id INTEGER,
    service_id INTEGER,
    date TEXT,
    time TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);`
        }
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Switch code display content
            const target = btn.getAttribute('data-target');
            if (codeSnippets[target]) {
                filenameDisplay.textContent = codeSnippets[target].filename;
                codeDisplay.textContent = codeSnippets[target].code;
            }
        });
    });

    // 4. Contact Form Submission
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const contact = document.getElementById('contact-info').value;
            const message = document.getElementById('contact-msg').value;
            
            formStatus.style.color = '#ffffff';
            formStatus.textContent = 'Отправка заявки...';
            
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, contact, message })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    formStatus.style.color = '#4ade80'; // Glowing green
                    formStatus.textContent = '✓ Заявка успешно отправлена! Я свяжусь с вами в ближайшее время.';
                    contactForm.reset();
                } else {
                    formStatus.style.color = '#f87171'; // Red
                    formStatus.textContent = '✗ Ошибка: ' + (data.message || 'Не удалось отправить.');
                }
            })
            .catch(err => {
                formStatus.style.color = '#f87171';
                formStatus.textContent = '✗ Ошибка отправки. Попробуйте позже.';
            });
        });
    }
});
