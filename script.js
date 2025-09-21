document.addEventListener('DOMContentLoaded', function() {
    // Quiz Elements
    const quizContainer = document.getElementById('quiz-container');
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const progressElement = document.getElementById('progress');
    const scratchCardSection = document.getElementById('scratch-card-section');
    
    // Spin Wheel Elements
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const result = document.getElementById('result');
    
    // Quiz Questions
    const questions = [
        {
            question: 'Is Flipkart celebrating its Big Billion Days sale?',
            options: ['Yes', 'No'],
            correct: 0
        },
        {
            question: 'Is the iPhone 16 Pro available in the sale?',
            options: ['Yes', 'No'],
            correct: 0
        },
        {
            question: 'Can you win an iPhone 16 Pro in this contest?',
            options: ['Yes', 'No'],
            correct: 0
        },
        {
            question: 'Is this contest open to all Indian residents?',
            options: ['Yes', 'No'],
            correct: 0
        },
        {
            question: 'Would you like to participate in this contest?',
            options: ['Yes', 'No'],
            correct: 0
        }
    ];
    
    // Possible rewards
    const rewards = [
        "10% OFF on your next purchase!",
        "Congratulations! You won ₹100 OFF!",
        "Better luck next time!",
        "Amazing! 20% OFF for you!",
        "You've won ₹50 OFF on your next order!",
        "Free shipping on your next order!"
    ];
    
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = [];
    let canvas, ctx;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Initialize Quiz
    function showQuestion() {
        const question = questions[currentQuestion];
        questionElement.textContent = question.question;
        
        // Clear previous options
        optionsElement.innerHTML = '';
        
        // Add new options
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'quiz-option';
            button.addEventListener('click', () => selectOption(index));
            optionsElement.appendChild(button);
        });
        
        // Update progress
        progressElement.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    }
    
    // Handle option selection
    function selectOption(selectedIndex) {
        userAnswers.push(selectedIndex);
        
        // Move to next question or show scratch card
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            // Quiz completed, show scratch card
            quizContainer.style.display = 'none';
            scratchCardSection.style.display = 'flex';
            initScratchCard();
        }
    }
    
    function initScratchCard() {
        const scratchOverlay = document.getElementById('scratch-overlay');
        const scratchHere = document.querySelector('.scratch-here');
        
        // Create canvas for scratching
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            const rect = scratchOverlay.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Fill with semi-transparent black
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Initialize canvas
        scratchOverlay.appendChild(canvas);
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Scratch functionality
        function draw(e) {
            if (!isDrawing) return;
            
            // Hide "Scratch Here" text when scratching starts
            if (scratchHere.style.opacity !== '0') {
                scratchHere.style.opacity = '0';
            }
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(e.offsetX, e.offsetY, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Check if enough has been scratched
            checkIfScratched();
        }
        
        function checkIfScratched() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let transparentPixels = 0;
            
            // Sample some pixels to check if enough is scratched
            for (let i = 3; i < imageData.length; i += 32) {
                if (imageData[i] < 128) {
                    transparentPixels++;
                }
            }
            
            const totalPixels = imageData.length / 128; // We're sampling 1/32 of the pixels
            const scratchedPercentage = (transparentPixels / totalPixels) * 100;
            
            if (scratchedPercentage > 30) {
                // Show the prize content
                scratchOverlay.style.opacity = '0';
                scratchOverlay.style.pointerEvents = 'none';
            }
        }
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
            draw(e);
        });
        
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseout', () => { isDrawing = false; });
        
        // Touch events
        function getTouchPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDrawing = true;
            const pos = getTouchPos(e);
            [lastX, lastY] = [pos.offsetX, pos.offsetY];
            draw(pos);
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const pos = getTouchPos(e);
            draw(pos);
        }, { passive: false });
        
        canvas.addEventListener('touchend', () => { isDrawing = false; });
    }
    
    // Initialize the quiz
    showQuestion();
    
    // Prize claim button functionality
    const claimButton = document.getElementById('claim-iphone');
    if (claimButton) {
        claimButton.addEventListener('click', function() {
                scratchAt(pos.x, pos.y);
            }
        );
        canvas.addEventListener('touchend', () => { isDrawing = false; });
        setTimeout(() => {
            resizeCanvas();
            
            // Add event listeners
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('touchstart', startDrawing, { passive: false });
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('touchmove', draw, { passive: false });
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('touchend', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // Handle window resize
            window.addEventListener('resize', resizeCanvas);
        }, 100);
        
        // Handle claim button click
        const claimBtn = document.getElementById('claim-iphone');
        claimBtn.addEventListener('click', function() {
            // Redirect to the claim page
            window.location.href = 'claim.html';
        });
        
        // Handle close button
        continueBtn.addEventListener('click', function() {
            document.getElementById('scratch-card-section').style.display = 'none';
            // You can add any additional behavior here when the scratch card is closed
        });
    }
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navRight = document.getElementById('navRight');
    const dropdowns = document.querySelectorAll('.dropdown');

    menuToggle.addEventListener('click', function() {
        navRight.classList.toggle('mobile-visible');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navRight.contains(event.target) && !menuToggle.contains(event.target)) {
            navRight.classList.remove('mobile-visible');
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
        }
    });

    // Handle dropdown toggle on mobile
    dropdowns.forEach(dropdown => {
        const dropbtn = dropdown.querySelector('.dropbtn');
        dropbtn.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.parentElement.classList.toggle('active');
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    });

    // Start the quiz
    showQuestion();
    
    // Review Section Interactions
    document.addEventListener('click', function(e) {
        // Like button functionality
        if (e.target.closest('.review-action.like')) {
            const likeBtn = e.target.closest('.review-action.like');
            likeBtn.classList.toggle('active');
            const likeCount = likeBtn.querySelector('i').nextSibling;
            if (likeCount) {
                let count = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = likeBtn.classList.contains('active') ? count + 1 : count - 1;
            }
        }
        
        // Reply button functionality
        if (e.target.closest('.review-action.reply')) {
            const reviewCard = e.target.closest('.review-card');
            const replySection = reviewCard.querySelector('.reply-section');
            if (replySection) {
                replySection.classList.toggle('visible');
            }
        }
        
        // Helpful/Report actions for replies
        if (e.target.closest('.reply-action')) {
            const action = e.target.closest('.reply-action');
            if (action.textContent.includes('Helpful')) {
                const countMatch = action.textContent.match(/\((\d+)\)/);
                if (countMatch) {
                    const count = parseInt(countMatch[1]) + 1;
                    action.innerHTML = action.innerHTML.replace(/\(\d+\)/, `(${count})`);
                }
            } else if (action.textContent.includes('Report')) {
                alert('Thank you for your feedback. We will review this content.');
            }
        }
    });
    
    // Add click effect to review images for lightbox view
    const reviewImages = document.querySelectorAll('.review-image');
    reviewImages.forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                cursor: zoom-out;
            `;
            
            const imgClone = this.cloneNode();
            imgClone.style.maxWidth = '90%';
            imgClone.style.maxHeight = '90%';
            imgClone.style.borderRadius = '8px';
            imgClone.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            
            lightbox.appendChild(imgClone);
            document.body.appendChild(lightbox);
            
            // Close lightbox on click
            lightbox.addEventListener('click', function() {
                document.body.removeChild(lightbox);
            });
        });
    });
    
    // Add click effect to review cards
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't toggle if clicking on interactive elements
            if (e.target.tagName === 'A' || e.target.closest('a, button, .review-action, .reply-action')) {
                return;
            }
            // Toggle active class for visual feedback
            this.classList.toggle('active');
        });
    });
});

    // Simulate loading animation for better UX
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
