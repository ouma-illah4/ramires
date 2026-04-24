// ==================== HERO CAROUSEL (NEW) ====================
const slides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

function rotateHero() {
  slides.forEach(slide => slide.classList.remove('active'));
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}

setInterval(rotateHero, 4000); // Change image every 4 seconds

// ==================== ELEMENTS ====================
const home = document.getElementById('home');
const back = document.getElementById('back');
const toBack = document.getElementById('toBack');
const toHome = document.getElementById('toHome');
const logoBg = document.querySelector('.background-logo');

const menuGrid = document.getElementById('menuGrid');
const orderList = document.getElementById('order-list');
const orderTotal = document.getElementById('order-total');
const proceedPaymentBtn = document.getElementById('proceed-payment');
const paymentSection = document.getElementById('payment-section');

const mpesaBtn = document.getElementById('mpesaBtn');
const cashBtn = document.getElementById('cashBtn');

const mpesaPopup = document.getElementById('mpesa-popup');
const popupTotal = document.getElementById('popup-total');
const mpesaNumber = document.getElementById('mpesa-number');
const confirmMpesa = document.getElementById('confirmMpesa');
const cancelMpesa = document.getElementById('cancelMpesa');
const mpesaOverlay = document.getElementById('mpesa-overlay');

const logoutBtn = document.querySelector('.logout-btn');
const orderNowBtn = document.getElementById('orderNowBtn');

let cart = [];

// ==================== PAGE NAVIGATION ====================
function showPage(pageToShow) {
  if (pageToShow === 'back') {
    home.classList.remove('active');
    home.classList.add('slide-up');
    back.classList.add('active');
    back.classList.remove('slide-up');
    moveLogo(-40);
  } else {
    back.classList.remove('active');
    back.classList.add('slide-up');
    home.classList.add('active');
    home.classList.remove('slide-up');
    moveLogo(0);
  }
}

toBack.addEventListener('click', () => showPage('back'));
toHome.addEventListener('click', () => showPage('home'));

// Swipe gestures
let startX = 0, endX = 0;
document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
document.addEventListener('touchmove', e => {
  endX = e.touches[0].clientX;
  const diff = endX - startX;
  if (Math.abs(diff) > 10) moveLogo(Math.max(Math.min(diff / 5, 40), -40));
});
document.addEventListener('touchend', () => {
  const diff = endX - startX;
  if (diff < -50 && home.classList.contains('active')) showPage('back');
  else if (diff > 50 && back.classList.contains('active')) showPage('home');
  else moveLogo(home.classList.contains('active') ? 0 : -40);
  startX = 0; endX = 0;
});

function moveLogo(x) {
  logoBg.style.transform = `translateX(${x}px)`;
  logoBg.style.opacity = 0.07 + Math.abs(x) / 800;
}

// ==================== ORDER NOW BUTTON ====================
orderNowBtn.addEventListener('click', () => {
  document.getElementById('menuGrid').scrollIntoView({ behavior: 'smooth' });
});

// ==================== MENU LOADING ====================
document.addEventListener('DOMContentLoaded', () => {
  menuGrid.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;

  fetch('posts.json')
    .then(res => res.json())
    .then(data => {
      menuGrid.innerHTML = '';
      data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.category = item.category.toLowerCase();
        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p class="price">Ksh ${item.price}</p>
        `;
        menuGrid.appendChild(card);
      });
      highlightOffers(data);
    })
    .catch(err => console.error('Error loading menu:', err));
});

// ==================== OFFERS ====================
function highlightOffers(data) {
  const banner = document.getElementById('offersBanner');
  const offers = data.sort(() => 0.5 - Math.random()).slice(0, 2);
  const cards = document.querySelectorAll('.card');
  let offersFound = 0;

  offers.forEach(offer => {
    cards.forEach(card => {
      if (card.querySelector('h3').textContent === offer.name) {
        const oldPrice = offer.price;
        const newPrice = oldPrice - Math.floor(Math.random() * 50 + 20);
        card.querySelector('.price').innerHTML = `<span class="offer-old">Ksh ${oldPrice}</span> <span class="offer-new">🔥 Ksh ${newPrice}</span>`;
        card.classList.add('offer-card');
        offersFound++;
      }
    });
  });

  banner.style.display = offersFound > 0 ? 'inline-block' : 'none';
}

// ==================== FILTER ====================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    filterMenu(btn.dataset.category);
  });
});

function filterMenu(category) {
  const cards = menuGrid.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.display = (category === 'all' || category === card.dataset.category) ? 'block' : 'none';
  });
}

// ==================== CART ====================
menuGrid.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;

  const priceEl = card.querySelector('.offer-new') || card.querySelector('.price');
  const price = parseInt(priceEl.textContent.replace(/\D/g, ''));
  const name = card.querySelector('h3').textContent;

  cart.push({ name, price });
  renderCart();
});

function renderCart() {
  orderList.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement('li');
    li.innerHTML = `${item.name} - Ksh ${item.price} <button onclick="removeItem(${index})">❌</button>`;
    orderList.appendChild(li);
  });
  orderTotal.textContent = `Total: Ksh ${total}`;
}

window.removeItem = function(index) {
  cart.splice(index, 1);
  renderCart();
};

// ==================== PAYMENT ====================
proceedPaymentBtn.addEventListener('click', () => {
  if (cart.length === 0) return alert("Add items to cart first!");
  paymentSection.style.display = 'block';
});

cashBtn.addEventListener('click', () => {
  alert("Cash on Delivery selected. Total: Ksh " + cart.reduce((a, b) => a + b.price, 0));
  completeOrder('Cash');
});

mpesaBtn.addEventListener('click', () => {
  if (cart.length === 0) return alert("Add items to cart first!");
  popupTotal.textContent = "Ksh " + cart.reduce((a, b) => a + b.price, 0);
  mpesaNumber.value = "";
  mpesaPopup.style.display = 'block';
  mpesaOverlay.style.display = 'block';
});

cancelMpesa.addEventListener('click', () => {
  mpesaPopup.style.display = 'none';
  mpesaOverlay.style.display = 'none';
});

confirmMpesa.addEventListener('click', () => {
  const number = mpesaNumber.value.trim();
  if (!number.match(/^07\d{8}$/)) return alert("Enter a valid Kenyan phone number starting with 07");

  confirmMpesa.disabled = true;
  confirmMpesa.textContent = "Processing...";

  const totalAmount = cart.reduce((a, b) => a + b.price, 0);

  setTimeout(() => {
    confirmMpesa.disabled = false;
    confirmMpesa.textContent = "Confirm Payment";
    mpesaPopup.style.display = 'none';
    mpesaOverlay.style.display = 'none';

    completeOrder('M-Pesa');
    alert(`Payment successful! Ksh ${totalAmount} paid via M-Pesa number ${number}.`);
  }, 2000);
});

mpesaOverlay.addEventListener('click', () => {
  mpesaPopup.style.display = 'none';
  mpesaOverlay.style.display = 'none';
});

function completeOrder(method) {
  cart = [];
  renderCart();
  paymentSection.style.display = 'none';
}

// ==================== LOGOUT ====================
logoutBtn.addEventListener('click', () => {
  cart = [];
  renderCart();
  paymentSection.style.display = 'none';
  mpesaPopup.style.display = 'none';
  mpesaOverlay.style.display = 'none';
  alert("You have been logged out!");
  showPage('home');
});

console.log("✅ Suely Ramirez Foods - Full script loaded with rotating hero");