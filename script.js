// CHRISMARI Car Rental Services - JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const isBookingPage = body.classList.contains('booking-page');

  // Sticky Header
  const header = document.querySelector('header');
  if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  }

  // Smooth Scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Smooth scroll for custom triggers
  document.querySelectorAll('[data-scroll]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const selector = trigger.getAttribute('data-scroll');
      const target = document.querySelector(selector);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Landing page booking form validation
  const landingBookingForm = document.querySelector('.booking form');
  if (landingBookingForm) {
    landingBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(landingBookingForm);
      let valid = true;

      for (let [key, value] of formData.entries()) {
        if (!value.trim()) {
          valid = false;
          alert(`${key} is required.`);
          break;
        }
      }

      if (valid) {
        alert('Booking submitted successfully!');
        landingBookingForm.reset();
      }
    });
  }

  // CTA Button Click Animation and Redirect
  const bookingRedirectButtons = document.querySelectorAll('.js-booking-redirect');
  if (bookingRedirectButtons.length) {
    bookingRedirectButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      const clickAnimation = document.createElement('img');
        clickAnimation.src = 'images/ClickClick.gif';
      clickAnimation.id = 'click-animation';
      clickAnimation.style.position = 'absolute';
      clickAnimation.style.top = '50%';
      clickAnimation.style.left = '50%';
      clickAnimation.style.transform = 'translate(-50%, -50%)';
      clickAnimation.style.zIndex = '1000';
      document.body.appendChild(clickAnimation);

      setTimeout(() => {
        clickAnimation.style.opacity = '1';
      }, 100);

      setTimeout(() => {
        window.location.href = 'booking.html';
      }, 2000);

      setTimeout(() => {
          if (document.body.contains(clickAnimation)) {
        document.body.removeChild(clickAnimation);
          }
      }, 2500);
    });
  });
  }

  // Booking page specific logic
  if (isBookingPage) {
    setupBookingPage();
  }

  function setupBookingPage() {
  const carCards = document.querySelectorAll('.car-card');
  const selectedCarInput = document.getElementById('selected-car');
  const totalPriceElement = document.getElementById('total-price');
    const bookingFormElement = document.getElementById('booking-form');
    const addOns = document.querySelectorAll('.add-ons input[type="checkbox"]');
    const summaryCar = document.getElementById('summary-car');
    const summaryDuration = document.getElementById('summary-duration');
    const summaryAddons = document.getElementById('summary-addons');
    const summaryPrice = document.getElementById('summary-price');
    const summaryPaymentMethod = document.getElementById('summary-payment-method');
    const durationHint = document.getElementById('duration-hint');
    const confirmationModal = document.getElementById('confirmation-modal');
    const bookingReferenceEl = document.getElementById('booking-reference');
    const backToHomeBtn = document.getElementById('back-to-home');
    const confirmBookingButton = document.querySelector('.confirm-booking');
    const paymentForm = document.getElementById('payment-form');
    const paymentStatus = document.getElementById('payment-status');
    const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
    const paymentFieldsGroups = document.querySelectorAll('.payment-fields');
    const methodCards = document.querySelectorAll('.method-card');
    const currencyFormatter = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    });
    const paymentLabelMap = {
      card: 'Credit/Debit Card',
      gcash: 'GCash',
      online: 'Online Banking'
    };
    const ADDON_PRICE = 500;
  let selectedCarPrice = 0;
    const bookingState = {
      reference: '',
      customer: { name: '', email: '', phone: '' },
      schedule: { pickup: '', dropoff: '' },
      locations: { pickup: '', dropoff: '' },
      car: '',
      baseRate: 0,
      baseSubtotal: 0,
      duration: 0,
      addons: [],
      addOnTotal: 0,
      total: 0,
      paymentMethod: paymentLabelMap.card,
      generatedAt: ''
    };

    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    function setSummaryPaymentLabel(method) {
      if (!summaryPaymentMethod) return;
      const label = paymentLabelMap[method] || paymentLabelMap.card;
      summaryPaymentMethod.textContent = label;
      bookingState.paymentMethod = label;
    }

    setSummaryPaymentLabel('card');

    function updateMethodCardStates() {
      methodCards.forEach(card => {
        const input = card.querySelector('input[name="payment-method"]');
        if (input) {
          card.classList.toggle('is-active', input.checked);
        }
      });
    }

    function togglePaymentFields(targetMethod) {
      paymentFieldsGroups.forEach(group => {
        const isActive = group.dataset.method === targetMethod;
        group.classList.toggle('active', isActive);
        group.querySelectorAll('input, select').forEach(field => {
          const shouldRequire = field.dataset.required === 'true';
          field.disabled = !isActive;
          if (shouldRequire) {
            field.required = isActive;
          }
    });
  });
      setSummaryPaymentLabel(targetMethod);
      updateMethodCardStates();
    }

    if (paymentMethodInputs.length) {
      paymentMethodInputs.forEach(input => {
        input.addEventListener('change', () => togglePaymentFields(input.value));
      });
      const initialMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'card';
      togglePaymentFields(initialMethod);
    }

    if (carCards.length && selectedCarInput) {
      carCards.forEach(card => {
        const selectButton = card.querySelector('.select-car');
        if (!selectButton) return;
        selectButton.addEventListener('click', () => {
          selectedCarPrice = parseInt(selectButton.dataset.price || '0', 10);
          selectedCarInput.value = selectButton.dataset.car || '';
          bookingState.baseRate = selectedCarPrice;
          carCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          recalcBookingDetails();
        });
      });
    }

    addOns.forEach(addOn => addOn.addEventListener('change', recalcBookingDetails));

    if (bookingFormElement) {
      const formInputs = bookingFormElement.querySelectorAll('input, select');
      formInputs.forEach(input => {
        input.addEventListener('input', recalcBookingDetails);
        input.addEventListener('change', recalcBookingDetails);
      });

  bookingFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(bookingFormElement);
    for (let [key, value] of formData.entries()) {
      if (!value.trim()) {
        alert(`${key} is required.`);
        return;
      }
    }
        if (!selectedCarInput.value) {
          alert('Please select a car to continue.');
          return;
        }

    const bookingReference = Math.random().toString(36).substring(2, 10).toUpperCase();
        bookingState.reference = bookingReference;
        bookingState.customer = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone')
        };
        bookingState.locations = {
          pickup: formData.get('pickup-location'),
          dropoff: formData.get('dropoff-location')
        };
        bookingState.schedule = {
          pickup: formData.get('pickup'),
          dropoff: formData.get('dropoff')
        };
        bookingState.car = formData.get('selected-car');
        bookingState.addons = getSelectedAddOnValues();
        bookingState.duration = getRentalDays();
        bookingState.baseSubtotal = bookingState.baseRate * (bookingState.duration || 1);
        bookingState.addOnTotal = bookingState.addons.length * ADDON_PRICE;
        bookingState.total = bookingState.baseSubtotal + bookingState.addOnTotal;
        bookingState.generatedAt = new Date().toISOString();

        if (bookingReferenceEl) {
          bookingReferenceEl.textContent = bookingReference;
        }
        if (confirmationModal) {
          confirmationModal.style.display = 'flex';
        }
      });
    }

    if (confirmBookingButton && bookingFormElement) {
      confirmBookingButton.addEventListener('click', () => bookingFormElement.requestSubmit());
    }

    if (paymentForm) {
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
        const total = bookingState.total || 0;
        if (total <= 0 || !bookingState.baseRate) {
          alert('Please complete your booking details before proceeding with payment.');
          return;
        }
        if (!bookingState.reference) {
          alert('Please submit your booking form and receive a reference number before paying.');
          return;
        }
        if (paymentStatus) {
          paymentStatus.textContent = 'Processing payment...';
        }
        setTimeout(() => {
          if (paymentStatus) {
            paymentStatus.textContent = 'Payment successful! A receipt has been sent to your email.';
          }
          alert('Payment successful!');
          generateInvoice(bookingState);
        }, 2000);
      });
    }

    if (confirmationModal) {
      confirmationModal.addEventListener('click', (event) => {
        if (event.target === confirmationModal) {
          confirmationModal.style.display = 'none';
        }
      });
    }

    function getRentalDays() {
      if (!bookingFormElement) return 0;
      const pickupValue = bookingFormElement.elements['pickup']?.value;
      const dropoffValue = bookingFormElement.elements['dropoff']?.value;
      if (!pickupValue || !dropoffValue) return 0;
      const pickupDate = new Date(pickupValue);
      const dropoffDate = new Date(dropoffValue);
      if (isNaN(pickupDate) || isNaN(dropoffDate)) return 0;
      const diff = dropoffDate - pickupDate;
      if (diff <= 0) return 0;
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    function updateDurationHint(dayCount) {
      if (!durationHint) return;
      if (!dayCount) {
        durationHint.textContent = 'Select your pick-up and drop-off to calculate the rental duration.';
      } else {
        durationHint.textContent = `Rental duration: ${dayCount} day(s).`;
      }
    }

    function getSelectedAddOnValues() {
      return Array.from(addOns)
        .filter(addOn => addOn.checked)
        .map(addOn => addOn.value);
    }

    function updateTotalPrice() {
      if (!totalPriceElement) return;
      const dayCount = getRentalDays();
      const selectedAddOns = getSelectedAddOnValues();
      const addOnTotal = selectedAddOns.length * ADDON_PRICE;
      const baseSubtotal = selectedCarPrice ? selectedCarPrice * (dayCount || 1) : 0;
      const total = baseSubtotal + addOnTotal;

      const formattedTotal = formatCurrency(total);
      if (totalPriceElement) {
        totalPriceElement.textContent = formattedTotal;
      }
      if (summaryPrice) {
        summaryPrice.textContent = formattedTotal;
      }
      updateDurationHint(dayCount);

      bookingState.duration = dayCount || 0;
      bookingState.car = selectedCarInput?.value || '';
      bookingState.addons = selectedAddOns;
      bookingState.baseRate = selectedCarPrice;
      bookingState.baseSubtotal = baseSubtotal;
      bookingState.addOnTotal = addOnTotal;
      bookingState.total = total;
    }

    function refreshSummary() {
      if (summaryCar) {
        const carText = selectedCarInput?.value || 'Choose a car';
        summaryCar.textContent = carText;
        bookingState.car = carText;
      }
      if (summaryDuration) {
        const dayCount = getRentalDays();
        summaryDuration.textContent = dayCount ? `${dayCount} day(s)` : 'Select dates';
      }
      if (summaryAddons) {
        summaryAddons.textContent = bookingState.addons.length ? bookingState.addons.join(', ') : 'None selected';
      }
    }

    function recalcBookingDetails() {
      updateTotalPrice();
      refreshSummary();
    }

    recalcBookingDetails();

    function formatDateTime(value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '—';
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    }

    function formatCurrency(amount) {
      return currencyFormatter.format(Number(amount || 0));
    }

    function generateInvoice(state) {
      if (!state || !state.reference) {
        alert('Booking details are incomplete. Please submit the booking form first.');
        return;
      }

      const pickupDate = formatDateTime(state.schedule.pickup);
      const dropoffDate = formatDateTime(state.schedule.dropoff);
      const generatedDate = formatDateTime(state.generatedAt || new Date().toISOString());
      const addOnList = state.addons.length
        ? state.addons.map(item => `<li>${item} (+${formatCurrency(ADDON_PRICE)})</li>`).join('')
        : '<li>None selected</li>';

      const invoiceHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Invoice ${state.reference}</title>
            <style>
              body {
                font-family: 'Poppins', Arial, sans-serif;
                background: #f5f5f5;
                margin: 0;
                padding: 2rem;
                color: #1f2933;
              }
              .invoice {
                max-width: 900px;
                margin: 0 auto;
                background: #fff;
                border-radius: 16px;
                padding: 2.5rem;
                box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
              }
              header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #f1f5f9;
                padding-bottom: 1.5rem;
                margin-bottom: 2rem;
              }
              header h1 {
                margin: 0;
                font-size: 1.75rem;
                letter-spacing: 0.05em;
              }
              .meta {
                text-align: right;
                font-size: 0.95rem;
                color: #64748b;
              }
              .section-title {
                font-size: 1.1rem;
                margin-bottom: 0.5rem;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #ff4d1c;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
              }
              .info-card {
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 1rem;
                background: #fafbfc;
              }
              .info-card h3 {
                margin-top: 0;
                margin-bottom: 0.5rem;
                font-size: 1rem;
                color: #0f172a;
              }
              .charges-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 2rem;
              }
              .charges-table th,
              .charges-table td {
                padding: 0.75rem 1rem;
                text-align: left;
              }
              .charges-table th {
                background: #f8fafc;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.85rem;
                letter-spacing: 0.1em;
              }
              .charges-table tr:not(:last-child) td {
                border-bottom: 1px solid #e2e8f0;
              }
              .charges-table .total-row td {
                font-weight: 700;
                font-size: 1.1rem;
              }
              ul {
                padding-left: 1.2rem;
              }
              .print-btn {
                display: inline-block;
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: linear-gradient(45deg, #ff4d1c, #ffb347);
                border: none;
                border-radius: 999px;
                color: #fff;
                font-size: 1rem;
                cursor: pointer;
              }
              .print-btn:hover {
                opacity: 0.9;
              }
              @media print {
                body {
                  padding: 0;
                  background: #fff;
                }
                .invoice {
                  box-shadow: none;
                  border-radius: 0;
                }
                .print-btn {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice">
              <header>
                <div>
                  <h1>CHRISMARI</h1>
                  <p>Car Rental Services</p>
                  <p>info@chrismari.com · +1 234 567 890</p>
                </div>
                <div class="meta">
                  <p><strong>Invoice #:</strong> ${state.reference}</p>
                  <p><strong>Issued:</strong> ${generatedDate}</p>
                  <p><strong>Payment:</strong> ${state.paymentMethod}</p>
                </div>
              </header>

              <section>
                <p class="section-title">Customer & Booking</p>
                <div class="grid">
                  <div class="info-card">
                    <h3>Customer</h3>
                    <p>${state.customer.name || '—'}</p>
                    <p>${state.customer.email || '—'}</p>
                    <p>${state.customer.phone || '—'}</p>
                  </div>
                  <div class="info-card">
                    <h3>Vehicle</h3>
                    <p>Model: ${state.car || '—'}</p>
                    <p>Daily Rate: ${state.baseRate ? formatCurrency(state.baseRate) : '—'}</p>
                    <p>Duration: ${state.duration || 0} day(s)</p>
                  </div>
                  <div class="info-card">
                    <h3>Locations</h3>
                    <p>Pick-up: ${state.locations.pickup || '—'}</p>
                    <p>Drop-off: ${state.locations.dropoff || '—'}</p>
                  </div>
                  <div class="info-card">
                    <h3>Schedule</h3>
                    <p>Pick-up: ${pickupDate}</p>
                    <p>Drop-off: ${dropoffDate}</p>
                  </div>
                </div>
              </section>

              <section>
                <p class="section-title">Charges</p>
                <table class="charges-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Vehicle Rental (${state.duration || 1} day(s) @ ${formatCurrency(state.baseRate || 0)} per day)</td>
                      <td>${formatCurrency(state.baseSubtotal)}</td>
                    </tr>
                    <tr>
                      <td>Add-ons (${state.addons.length} item/s)</td>
                      <td>${formatCurrency(state.addOnTotal)}</td>
                    </tr>
                    <tr class="total-row">
                      <td>Total Paid</td>
                      <td>${formatCurrency(state.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <p class="section-title">Selected Add-ons</p>
                <ul>
                  ${addOnList}
                </ul>
              </section>

              <section>
                <p class="section-title">Notes</p>
                <p>Thank you for choosing CHRISMARI. Please present this invoice at vehicle pick-up. For any changes, contact us 24 hours before your scheduled pick-up time.</p>
              </section>

              <button class="print-btn" onclick="window.print()">Print Invoice</button>
            </div>
          </body>
        </html>
      `;

    const invoiceWindow = window.open('', '_blank');
      invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
      invoiceWindow.focus();
    }
  }
});