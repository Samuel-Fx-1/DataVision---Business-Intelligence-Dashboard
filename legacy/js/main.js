// ===== Counter Animation for Numbers =====
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            // Handle decimal values
            if (target % 1 !== 0) {
                element.textContent = current.toFixed(1);
            } else if (target > 1000) {
                element.textContent = Math.floor(current).toLocaleString();
            } else {
                element.textContent = Math.floor(current);
            }
            requestAnimationFrame(updateCounter);
        } else {
            // Final value
            if (target % 1 !== 0) {
                element.textContent = target.toFixed(1);
            } else if (target > 1000) {
                element.textContent = target.toLocaleString();
            } else {
                element.textContent = target;
            }
        }
    };
    
    updateCounter();
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate counters
            const counters = entry.target.querySelectorAll('[data-target]');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                animateCounter(counter, target);
            });
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe sections with counters
document.addEventListener('DOMContentLoaded', () => {
    const heroStats = document.querySelector('.hero-stats');
    const kpiGrid = document.querySelector('.kpi-grid');
    
    if (heroStats) observer.observe(heroStats);
    if (kpiGrid) observer.observe(kpiGrid);
});

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Chart.js Configuration =====
Chart.defaults.color = '#FFFFFF';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;

// Common chart options
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: '#FFFFFF',
                padding: 15,
                font: {
                    size: 11,
                    weight: '500'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(44, 64, 73, 0.95)',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            borderColor: 'rgba(0, 217, 255, 0.5)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            titleFont: {
                size: 13,
                weight: 'bold'
            },
            bodyFont: {
                size: 12
            }
        }
    },
    interaction: {
        intersect: false,
        mode: 'index'
    }
};

// ===== Revenue Trend Chart =====
const revenueCtx = document.getElementById('revenueChart');
if (revenueCtx) {
    const revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue 2024',
                data: [185000, 195000, 210000, 225000, 235000, 245000, 250000, 260000, 268000, 275000, 282000, 290000],
                borderColor: '#00D9FF',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                    gradient.addColorStop(0, 'rgba(0, 217, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#00D9FF',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2
            }, {
                label: 'Revenue 2023',
                data: [165000, 172000, 180000, 190000, 198000, 205000, 212000, 218000, 225000, 232000, 238000, 245000],
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                borderDash: [5, 5]
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return '$' + (value / 1000) + 'K';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// ===== User Growth Chart =====
const userCtx = document.getElementById('userChart');
if (userCtx) {
    const userChart = new Chart(userCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Active Users',
                data: [32000, 34500, 36200, 38100, 39800, 41200, 42500, 43800, 44500, 45200, 45600, 45829],
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                    gradient.addColorStop(0, 'rgba(0, 255, 163, 0.8)');
                    gradient.addColorStop(1, 'rgba(0, 255, 163, 0.2)');
                    return gradient;
                },
                borderColor: '#00FFA3',
                borderWidth: 2,
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return (value / 1000) + 'K';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// ===== Sales by Category Chart =====
const categoryCtx = document.getElementById('categoryChart');
if (categoryCtx) {
    const categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Others'],
            datasets: [{
                data: [35, 25, 18, 12, 6, 4],
                backgroundColor: [
                    '#00D9FF',
                    '#00FFA3',
                    '#FF6B35',
                    '#9B59B6',
                    '#F1C40F',
                    'rgba(255, 255, 255, 0.3)'
                ],
                borderColor: 'rgba(44, 64, 73, 0.8)',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#FFFFFF',
                        padding: 12,
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    return {
                                        text: `${label} (${value}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// ===== Performance Metrics Chart =====
const performanceCtx = document.getElementById('performanceChart');
if (performanceCtx) {
    const performanceChart = new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: ['Sales', 'Marketing', 'Customer Service', 'Product Quality', 'Delivery', 'Support'],
            datasets: [{
                label: 'Current Quarter',
                data: [85, 78, 92, 88, 85, 90],
                backgroundColor: 'rgba(0, 217, 255, 0.2)',
                borderColor: '#00D9FF',
                borderWidth: 2,
                pointBackgroundColor: '#00D9FF',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }, {
                label: 'Previous Quarter',
                data: [78, 72, 85, 82, 80, 83],
                backgroundColor: 'rgba(0, 255, 163, 0.1)',
                borderColor: '#00FFA3',
                borderWidth: 2,
                pointBackgroundColor: '#00FFA3',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: 'rgba(255, 255, 255, 0.6)',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// ===== Market Share Chart =====
const marketShareCtx = document.getElementById('marketShareChart');
if (marketShareCtx) {
    const marketShareChart = new Chart(marketShareCtx, {
        type: 'polarArea',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Market Share by Quarter',
                data: [22, 28, 31, 35],
                backgroundColor: [
                    'rgba(0, 217, 255, 0.6)',
                    'rgba(0, 255, 163, 0.6)',
                    'rgba(255, 107, 53, 0.6)',
                    'rgba(155, 89, 182, 0.6)'
                ],
                borderColor: [
                    '#00D9FF',
                    '#00FFA3',
                    '#FF6B35',
                    '#9B59B6'
                ],
                borderWidth: 2
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10,
                        color: 'rgba(255, 255, 255, 0.6)',
                        backdropColor: 'transparent',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    display: false
                }
            }
        }
    });
}

// ===== Traffic Sources Chart =====
const trafficCtx = document.getElementById('trafficChart');
if (trafficCtx) {
    const trafficChart = new Chart(trafficCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [{
                label: 'Organic Search',
                data: [1200, 800, 2400, 3800, 4200, 3500, 2800],
                borderColor: '#00D9FF',
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: 'Direct',
                data: [800, 600, 1600, 2200, 2800, 2400, 1800],
                borderColor: '#00FFA3',
                backgroundColor: 'rgba(0, 255, 163, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: 'Social Media',
                data: [400, 300, 800, 1500, 1800, 1600, 1200],
                borderColor: '#FF6B35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return (value / 1000) + 'K';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        padding: 12,
                        font: {
                            size: 10,
                            weight: '500'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

// ===== Time Filter Functionality =====
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const period = btn.getAttribute('data-period');
        console.log(`Filter changed to: ${period}`);
        
        // Here you would typically update the charts with filtered data
        // For demo purposes, we'll just log it
    });
});

// ===== Chat Button Functionality =====
const chatButton = document.querySelector('.chat-button');
if (chatButton) {
    chatButton.addEventListener('click', () => {
        alert('Chat feature coming soon!\n\nThis would typically open a live chat widget for customer support.');
    });
}

// ===== Subscribe Form Handling =====
const subscribeForm = document.querySelector('.subscribe-form');
if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = subscribeForm.querySelector('.subscribe-input');
        const email = emailInput.value;
        
        if (email) {
            // Simulate subscription
            alert(`Thank you for subscribing!\n\nWe'll send weekly reports to: ${email}`);
            emailInput.value = '';
            
            // Add success animation
            const button = subscribeForm.querySelector('.subscribe-button');
            const originalText = button.textContent;
            button.textContent = 'SUBSCRIBED!';
            button.style.background = 'linear-gradient(135deg, #00FFA3, #00D9FF)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = 'linear-gradient(135deg, var(--tech-blue), var(--data-green))';
            }, 3000);
        }
    });
}

// ===== Real-time Data Stream Animation =====
function updateStreamTimes() {
    const streamItems = document.querySelectorAll('.stream-item');
    streamItems.forEach((item, index) => {
        const timeElement = item.querySelector('.stream-time');
        if (timeElement) {
            // Increment time
            let currentTime = parseInt(timeElement.textContent);
            if (isNaN(currentTime)) {
                currentTime = (index + 1) * 3;
            }
            currentTime += 1;
            
            if (currentTime < 60) {
                timeElement.textContent = `${currentTime}s ago`;
            } else {
                const minutes = Math.floor(currentTime / 60);
                timeElement.textContent = `${minutes}m ago`;
            }
        }
    });
}

// Update stream times every second
setInterval(updateStreamTimes, 1000);

// ===== Parallax Effect for Hero Section =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        const heroContent = heroSection.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 600);
        }
    }
});

// ===== Navigation Active State on Scroll =====
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 200)) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

// ===== Add Glow Effect to KPI Cards on Scroll =====
const kpiCards = document.querySelectorAll('.kpi-card');
const kpiObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = 'none';
                entry.target.offsetHeight; // Trigger reflow
                entry.target.style.animation = `fadeInUp 0.6s ease forwards`;
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

kpiCards.forEach(card => kpiObserver.observe(card));

// ===== Responsive Navigation Toggle (for mobile) =====
const createMobileMenu = () => {
    if (window.innerWidth <= 640) {
        const nav = document.querySelector('.main-nav');
        const navLinks = nav.querySelector('.nav-links');
        
        // Check if menu toggle already exists
        if (!nav.querySelector('.menu-toggle')) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.style.cssText = `
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 18px;
            `;
            
            menuToggle.addEventListener('click', () => {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
                if (navLinks.style.display === 'flex') {
                    navLinks.style.cssText = `
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: rgba(44, 64, 73, 0.95);
                        flex-direction: column;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 10px;
                    `;
                }
            });
            
            nav.appendChild(menuToggle);
        }
    }
};

// Call on load and resize
window.addEventListener('load', createMobileMenu);
window.addEventListener('resize', createMobileMenu);

// ===== Live Indicator Pulse =====
const liveIndicators = document.querySelectorAll('.live-indicator i');
liveIndicators.forEach(indicator => {
    setInterval(() => {
        indicator.style.opacity = indicator.style.opacity === '0.3' ? '1' : '0.3';
    }, 1000);
});

// ===== Console Log for Development =====
console.log('%c DataVision Dashboard Loaded ', 'background: linear-gradient(135deg, #00D9FF, #00FFA3); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold;');
console.log('All charts and interactive elements are ready!');
