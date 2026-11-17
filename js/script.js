/**
 * TransMove Logistics — Vanilla JavaScript Interactive Controller
 * Handles sticky navigation, active link tracking, mobile menu, language selector,
 * scroll-triggered animations, statistics counter animation, and interactive modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. Sticky Header & Active Section Highlighting
     ========================================================================== */
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id], footer[id]');

  const updateHeaderState = () => {
    if (!header) return;
    if (window.scrollY > 16) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));

  /* ==========================================================================
     2. Mobile Hamburger Menu Toggle
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  const closeMobileMenu = () => {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.hidden = true;
  };

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!expanded));
      mobileDrawer.hidden = expanded;
    });

    mobileDrawer.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('click', () => closeMobileMenu());
    });
  }

  /* ==========================================================================
     3. Language Selector Dropdown
     ========================================================================== */
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  const currentLang = document.getElementById('current-lang');

  if (langToggle && langMenu && currentLang) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = langToggle.getAttribute('aria-expanded') === 'true';
      langToggle.setAttribute('aria-expanded', String(!isExpanded));
      langMenu.hidden = isExpanded;
    });

    langMenu.querySelectorAll('li[data-lang]').forEach((item) => {
      item.addEventListener('click', () => {
        const selected = item.getAttribute('data-lang') || 'EN';
        currentLang.textContent = selected;
        langMenu.querySelectorAll('li').forEach((li) => {
          li.setAttribute('aria-selected', String(li === item));
        });
        langToggle.setAttribute('aria-expanded', 'false');
        langMenu.hidden = true;
      });
    });

    document.addEventListener('click', () => {
      langToggle.setAttribute('aria-expanded', 'false');
      langMenu.hidden = true;
    });
  }

  /* ==========================================================================
     4. Scroll-Triggered Reveal Animations & Statistics Counter
     ========================================================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-card');

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // Animated Counters
  const counters = document.querySelectorAll('.counter');
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    if (!target || prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }
    const duration = 1300;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => counterObserver.observe(c));

  /* ==========================================================================
     5. Modal System & Rich Detail Catalog
     ========================================================================== */
  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input, select, textarea, button:not(.modal-close)');
    if (firstInput) setTimeout(() => firstInput.focus(), 40);
  };

  const closeAllModals = () => {
    document.querySelectorAll('.modal-backdrop').forEach((m) => {
      m.hidden = true;
    });
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-open-modal');
      const presetService = trigger.getAttribute('data-service');
      if (targetId === 'story-modal') {
        showDetailModal('story');
        return;
      }
      if (presetService) {
        const serviceSelect = document.getElementById('quote-service');
        if (serviceSelect) serviceSelect.value = presetService;
      }
      if (targetId) openModal(targetId);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeAllModals());
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAllModals();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeMobileMenu();
    }
  });

  /* ==========================================================================
     6. Service, Industry, Story & Legal Interactive Detail Modal
     ========================================================================== */
  const SERVICE_CATALOG = {
    'Sea Freight': {
      kicker: 'OCEAN FREIGHT SOLUTIONS',
      title: 'Sea Freight — Global FCL & LCL Shipping',
      summary:
        'Cost-effective, high-capacity container shipping across 100+ countries with guaranteed space allocations on major trade lanes between Asia, Europe, the Middle East, and the Americas.',
      specs: [
        { label: 'Container Options', val: '20ft / 40ft Standard, High-Cube, Reefer & Open-Top' },
        { label: 'Consolidation', val: 'Weekly LCL departures from major Indian & global ports' },
        { label: 'Port Coverage', val: 'Nhava Sheva, Mundra, Chennai, Rotterdam, Jebel Ali, Singapore' },
        { label: 'Visibility', val: 'Real-time vessel AIS & container milestone alerts' },
      ],
    },
    'Air Freight': {
      kicker: 'EXPEDITED AIR CARGO',
      title: 'Air Freight — Priority & Charter Cargo',
      summary:
        'Time-critical air logistics engineered for high-value, urgent, and temperature-sensitive shipments with airport-to-airport and door-to-door delivery.',
      specs: [
        { label: 'Transit Speed', val: 'Next-flight-out & 24–72 hour global express corridors' },
        { label: 'Cargo Handling', val: 'IATA DG-certified & cold-chain pharma compliance' },
        { label: 'Charter Services', val: 'Part & full cargo charters for oversized loads' },
        { label: 'Customs Priority', val: 'Pre-arrival EDI filing for rapid tarmac clearance' },
      ],
    },
    'Land Transportation': {
      kicker: 'ROAD & RAIL NETWORK',
      title: 'Land Transportation — Domestic & Cross-Border',
      summary:
        'Flexible Full-Truckload (FTL) and Less-Than-Truckload (LTL) fleet operations connecting industrial corridors, ICDs, and seaports with GPS-monitored safety.',
      specs: [
        { label: 'Fleet Capabilities', val: 'Container trailers, closed-body trucks & multi-axle flatbeds' },
        { label: 'Security', val: '24/7 GPS geofencing, dual-driver express & e-lock seals' },
        { label: 'First & Last Mile', val: 'Port drayage, factory stuffing & retail distribution' },
        { label: 'On-Time SLA', val: '99% schedule adherence across national highways' },
      ],
    },
    'Warehousing & Storage': {
      kicker: 'STORAGE & FULFILLMENT',
      title: 'Warehousing & Storage — Grade-A Facilities',
      summary:
        'Strategically located, customs-bonded and temperature-controlled distribution hubs equipped with modern WMS inventory management and pick-pack-ship automation.',
      specs: [
        { label: 'Facility Standard', val: 'Grade-A high-bay racking with dock levelers & CCTV' },
        { label: 'Inventory Control', val: 'Barcode/RFID scanning with real-time SKU visibility' },
        { label: 'Value-Added Services', val: 'Kitting, labeling, palletizing & reverse logistics' },
        { label: 'Storage Zones', val: 'Ambient, climate-controlled & hazardous-compliant bays' },
      ],
    },
    'Customs Clearance': {
      kicker: 'REGULATORY & TRADE COMPLIANCE',
      title: 'Customs Clearance — Hassle-Free Documentation',
      summary:
        'Licensed customs brokerage professionals managing HS classification, duty optimization, import/export licensing, and fast-track port & airport clearance.',
      specs: [
        { label: 'Documentation', val: 'Bill of Entry, Shipping Bills, COO & Letter of Credit' },
        { label: 'Compliance', val: 'AEO, ICEGATE, PGA clearances (FSSAI, CDSCO, WPC)' },
        { label: 'Duty Advisory', val: 'FTA benefit analysis, EPCG & Advance Authorization' },
        { label: 'Turnaround', val: 'Zero-demurrage focus with digital pre-clearance' },
      ],
    },
    'Supply Chain Solutions': {
      kicker: '4PL & INTEGRATED LOGISTICS',
      title: 'Supply Chain Solutions — End-to-End Orchestration',
      summary:
        'Integrated multimodal control tower combining demand planning, multimodal route optimization, vendor consolidation, and carbon-footprint analytics.',
      specs: [
        { label: 'Control Tower', val: 'Single-window dashboard for purchase orders & transit KPIs' },
        { label: 'Network Design', val: 'Hub-and-spoke optimization & modal shift modeling' },
        { label: 'Sustainability', val: 'Scope 3 emissions reporting & green corridor routing' },
        { label: 'Dedicated Account Team', val: '24/7 solution architects & exception management' },
      ],
    },
  };

  const INDUSTRY_CATALOG = {
    'Retail & E-Commerce': {
      summary:
        'Omnichannel fulfillment, seasonal peak capacity, and rapid store/doorstep replenishment built for high-velocity retail and D2C brands.',
      specs: [
        { label: 'Fulfillment', val: 'Same-day / next-day dispatch & automated sortation' },
        { label: 'Returns Management', val: 'Quality-checked reverse logistics & restocking' },
      ],
    },
    Manufacturing: {
      summary:
        'Just-in-Time (JIT) raw material inbound logistics, heavy machinery transport, and export containerization for industrial plants.',
      specs: [
        { label: 'Inbound Logistics', val: 'Milk-run vendor consolidation & line-side delivery' },
        { label: 'Heavy Cargo', val: 'ODC / project cargo rigging & flat-rack ocean freight' },
      ],
    },
    Automotive: {
      summary:
        'Precision supply chains for OEMs and Tier-1 suppliers, including CKD/SKD kits, aftermarket spare parts distribution, and sequence in-plant logistics.',
      specs: [
        { label: 'Packaging', val: 'Returnable ESD bins & custom steel racks' },
        { label: 'Time-Critical', val: 'AOG/line-stop emergency air charter response' },
      ],
    },
    Pharmaceutical: {
      summary:
        'GDP-compliant cold-chain logistics (+2°C to +8°C, +15°C to +25°C, and -20°C) with continuous IoT thermal data loggers for vaccines, biologics, and APIs.',
      specs: [
        { label: 'Cold Chain', val: 'Active & passive thermal containers with reefer backup' },
        { label: 'Compliance', val: 'WHO-GDP & CDSCO validated handling protocols' },
      ],
    },
    'Food & Beverage': {
      summary:
        'Hygienic, temperature-controlled reefer transport and FEFO (First-Expired, First-Out) warehousing for perishables, packaged foods, and agricultural exports.',
      specs: [
        { label: 'Freshness Control', val: 'Humidity & temperature-monitored reefer fleet' },
        { label: 'Clearance', val: 'Priority FSSAI, Phytosanitary & APEDA documentation' },
      ],
    },
    Technology: {
      summary:
        'High-security, shock-monitored air and ground transport for semiconductors, data-center servers, telecom hardware, and consumer electronics.',
      specs: [
        { label: 'High-Value Security', val: 'TAPA-aligned escort, biometric access & CCTV cargo bays' },
        { label: 'White-Glove', val: 'Cleanroom unpacking, rack placement & debris removal' },
      ],
    },
    'Energy & Chemicals': {
      summary:
        'Certified hazardous (HAZMAT / DG) logistics, ISO tank containers, and project cargo transport for renewable energy, solar, oil & gas, and specialty chemicals.',
      specs: [
        { label: 'DG Certified', val: 'IMDG & IATA Dangerous Goods classes 2–9 specialists' },
        { label: 'Equipment', val: 'ISO tanks, flexibags & ADR-compliant tankers' },
      ],
    },
    Construction: {
      summary:
        'Site-synchronized delivery of structural steel, cement, glass facades, and heavy earthmoving equipment to major infrastructure and commercial developments.',
      specs: [
        { label: 'Equipment', val: 'Low-bed trailers, hydraulic axles & crane coordination' },
        { label: 'Scheduling', val: 'Just-in-sequence jobsite crane-slot delivery' },
      ],
    },
  };

  const detailKicker = document.getElementById('detail-modal-kicker');
  const detailTitle = document.getElementById('detail-modal-title');
  const detailBody = document.getElementById('detail-modal-body');
  const detailCta = document.getElementById('detail-modal-cta');

  const showDetailModal = (type, key = '') => {
    if (!detailKicker || !detailTitle || !detailBody || !detailCta) return;

    if (type === 'service' && SERVICE_CATALOG[key]) {
      const item = SERVICE_CATALOG[key];
      detailKicker.textContent = item.kicker;
      detailTitle.textContent = item.title;
      detailBody.innerHTML = `
        <p>${item.summary}</p>
        <div class="detail-spec-list">
          ${item.specs
            .map(
              (s) => `
            <div class="detail-spec-item">
              <strong>${s.label}</strong>
              <span>${s.val}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
      detailCta.onclick = () => {
        closeAllModals();
        const select = document.getElementById('quote-service');
        if (select) select.value = key;
        openModal('quote-modal');
      };
      openModal('detail-modal');
    } else if (type === 'industry' && INDUSTRY_CATALOG[key]) {
      const item = INDUSTRY_CATALOG[key];
      detailKicker.textContent = 'INDUSTRY LOGISTICS SPECIALIZATION';
      detailTitle.textContent = `${key} Logistics`;
      detailBody.innerHTML = `
        <p>${item.summary}</p>
        <div class="detail-spec-list">
          ${item.specs
            .map(
              (s) => `
            <div class="detail-spec-item">
              <strong>${s.label}</strong>
              <span>${s.val}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
      detailCta.onclick = () => {
        closeAllModals();
        const select = document.getElementById('quote-service');
        if (select) select.value = 'Industry-Specific Logistics';
        const msg = document.getElementById('quote-message');
        if (msg && !msg.value) {
          msg.value = `Industry Sector: ${key}\n`;
        }
        openModal('quote-modal');
      };
      openModal('detail-modal');
    } else if (type === 'story') {
      detailKicker.textContent = 'ABOUT TRANSMOVE LOGISTICS';
      detailTitle.textContent = 'People. Partnership. Progress.';
      detailBody.innerHTML = `
        <p>Founded with a mission to make cross-border trade effortless, TransMove has grown over 10+ years into a trusted multimodal logistics partner serving 10,000+ clients across 100+ countries.</p>
        <div class="detail-spec-list">
          <div class="detail-spec-item">
            <strong>10+ Years Experience</strong>
            <span>Proven operational excellence across sea, air, and land corridors.</span>
          </div>
          <div class="detail-spec-item">
            <strong>99% On-Time SLA</strong>
            <span>Proactive milestone monitoring and exception management.</span>
          </div>
          <div class="detail-spec-item">
            <strong>100+ Global Partners</strong>
            <span>Integrated carrier & customs network across major world ports.</span>
          </div>
          <div class="detail-spec-item">
            <strong>Sustainable Future</strong>
            <span>Committed to carbon-efficient modal shifts and green warehousing.</span>
          </div>
        </div>
      `;
      detailCta.onclick = () => {
        closeAllModals();
        openModal('quote-modal');
      };
      openModal('detail-modal');
    } else if (type === 'legal') {
      detailKicker.textContent = 'LEGAL & COMPLIANCE';
      detailTitle.textContent = key;
      detailBody.innerHTML = `
        <p>TransMove Logistics operates in accordance with standard international freight forwarding regulations, carrier liability conventions (Hague-Visby, Montreal Convention, and Multimodal Transport rules), and data protection standards.</p>
        <p style="margin-top:10px;">For official contract terms, standard trading conditions, or corporate privacy inquiries, please contact our compliance desk at <strong>hello@transmove.in</strong> or call <strong>+91 98765 43210</strong>.</p>
      `;
      detailCta.onclick = () => {
        closeAllModals();
        openModal('quote-modal');
      };
      openModal('detail-modal');
    }
  };

  document.querySelectorAll('[data-service-detail]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key = el.getAttribute('data-service-detail') || '';
      showDetailModal('service', key);
    });
  });

  document.querySelectorAll('[data-industry-detail]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key = el.getAttribute('data-industry-detail') || '';
      showDetailModal('industry', key);
    });
  });

  document.querySelectorAll('[data-legal]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key = el.getAttribute('data-legal') || 'Legal Notice';
      showDetailModal('legal', key);
    });
  });

  /* ==========================================================================
     7. Quote Request Form Validation & Submission Handler
     ========================================================================== */
  const quoteForm = document.getElementById('quote-form');
  const quoteFeedback = document.getElementById('quote-feedback');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[+\d\s\-()]{7,20}$/.test(phone);

  if (quoteForm && quoteFeedback) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const fields = [
        {
          id: 'quote-name',
          errId: 'err-quote-name',
          check: (v) => v.trim().length >= 2,
          msg: 'Please enter your full name.',
        },
        {
          id: 'quote-company',
          errId: 'err-quote-company',
          check: (v) => v.trim().length >= 2,
          msg: 'Please enter your company name.',
        },
        {
          id: 'quote-email',
          errId: 'err-quote-email',
          check: (v) => validateEmail(v.trim()),
          msg: 'Please enter a valid business email address.',
        },
        {
          id: 'quote-phone',
          errId: 'err-quote-phone',
          check: (v) => validatePhone(v.trim()),
          msg: 'Please enter a valid phone number.',
        },
        {
          id: 'quote-service',
          errId: 'err-quote-service',
          check: (v) => v.trim().length > 0,
          msg: 'Please select a logistics service.',
        },
        {
          id: 'quote-message',
          errId: 'err-quote-message',
          check: (v) => v.trim().length >= 8,
          msg: 'Please provide brief route or cargo details (min 8 chars).',
        },
      ];

      fields.forEach(({ id, errId, check, msg }) => {
        const input = document.getElementById(id);
        const errEl = document.getElementById(errId);
        if (!input || !errEl) return;
        const ok = check(input.value);
        input.classList.toggle('input-invalid', !ok);
        errEl.textContent = ok ? '' : msg;
        if (!ok) isValid = false;
      });

      if (!isValid) {
        quoteFeedback.hidden = true;
        return;
      }

      const nameVal = document.getElementById('quote-name').value.trim();
      const serviceVal = document.getElementById('quote-service').value;

      quoteFeedback.hidden = false;
      quoteFeedback.innerHTML = `
        <strong>Demo Mode — Form Validated Locally:</strong> Thank you, <strong>${nameVal}</strong>. Your inquiry for <strong>${serviceVal}</strong> passed client-side validation. Because no backend submission server is configured in this static preview, please connect a form endpoint in <code>js/script.js</code> or contact <strong>hello@transmove.in</strong> directly.
      `;
      quoteForm.reset();
    });
  }

  /* ==========================================================================
     8. Shipment Tracking Demo Interface
     ========================================================================== */
  const DEMO_SHIPMENTS = {
    'TM-849201-IN': {
      mode: 'Sea Freight (40ft High-Cube FCL)',
      origin: 'Nhava Sheva (INNSA), India',
      destination: 'Port of Rotterdam (NLRTM), Netherlands',
      eta: 'Scheduled — On Time',
      steps: [
        { title: 'Gate-In & Export Customs Cleared — Nhava Sheva', time: 'Completed', done: true },
        { title: 'Loaded on Vessel MV TransMove Horizon', time: 'Completed', done: true },
        { title: 'In Transit — Suez Canal Maritime Corridor', time: 'Current Stage (Demo)', done: true },
        { title: 'Arrival & Discharge at Rotterdam Terminal', time: 'Pending Arrival', done: false },
      ],
    },
    'TM-391044-EU': {
      mode: 'Air Freight Express (Temperature Controlled)',
      origin: 'Frankfurt Cargo Hub (FRA), Germany',
      destination: 'Indira Gandhi Intl Cargo (DEL), India',
      eta: 'Priority Air Corridor',
      steps: [
        { title: 'Picked Up & Security Screened — Frankfurt', time: 'Completed', done: true },
        { title: 'Departed on Cargo Flight TM-408', time: 'Completed', done: true },
        { title: 'Arrived DEL Cargo Terminal — Pre-Clearance EDI Filed', time: 'Current Stage (Demo)', done: true },
        { title: 'Final Mile Delivery to Zirakpur Distribution Hub', time: 'Scheduled Next', done: false },
      ],
    },
    'TM-772190-US': {
      mode: 'Land Transportation (GPS-Sealed FTL)',
      origin: 'Zirakpur Logistics Park, Punjab',
      destination: 'Mundra Port Container Terminal, Gujarat',
      eta: 'Express Highway Corridor',
      steps: [
        { title: 'Factory Stuffing & E-Lock Sealed — Zirakpur', time: 'Completed', done: true },
        { title: 'In Transit via NH-48 Freight Corridor', time: 'Current Stage (Demo)', done: true },
        { title: 'Port Gate Entry — Mundra Terminal', time: 'Pending', done: false },
      ],
    },
  };

  const trackForm = document.getElementById('track-form');
  const trackInput = document.getElementById('tracking-id');
  const trackErr = document.getElementById('err-tracking-id');
  const trackResultBox = document.getElementById('track-result-box');

  const renderTrackingResult = (rawId) => {
    if (!trackResultBox || !trackErr || !trackInput) return;
    const cleanId = rawId.trim().toUpperCase();
    if (cleanId.length < 4) {
      trackInput.classList.add('input-invalid');
      trackErr.textContent = 'Please enter a valid Tracking ID (e.g. TM-849201-IN).';
      trackResultBox.hidden = true;
      return;
    }

    trackInput.classList.remove('input-invalid');
    trackErr.textContent = '';

    const demoData = DEMO_SHIPMENTS[cleanId] || {
      mode: 'Multimodal Freight Demo Record',
      origin: 'Mumbai Logistics Gateway, India',
      destination: 'Global Distribution Hub',
      eta: 'Sample Demo Timeline',
      steps: [
        { title: `Booking Confirmed for Reference ${cleanId}`, time: 'Demo Record', done: true },
        { title: 'Documentation & Customs Pre-Check', time: 'Demo Record', done: true },
        { title: 'Connect Live Carrier API for Real-Time Telemetry', time: 'API Not Configured', done: false },
      ],
    };

    trackResultBox.hidden = false;
    trackResultBox.innerHTML = `
      <div class="track-demo-banner">
        DEMO TRACKING PREVIEW — Showing sample data for <strong>${cleanId}</strong>. Connect a live carrier API in <code>js/script.js</code> for production tracking.
      </div>
      <div class="track-summary-grid">
        <div class="track-summary-item">
          <strong>Service Mode</strong>
          <span>${demoData.mode}</span>
        </div>
        <div class="track-summary-item">
          <strong>Status</strong>
          <span>${demoData.eta}</span>
        </div>
        <div class="track-summary-item">
          <strong>Origin</strong>
          <span>${demoData.origin}</span>
        </div>
        <div class="track-summary-item">
          <strong>Destination</strong>
          <span>${demoData.destination}</span>
        </div>
      </div>
      <div class="track-timeline">
        ${demoData.steps
          .map(
            (s) => `
          <div class="track-step ${s.done ? '' : 'pending'}">
            <span class="track-step-marker">${s.done ? '✓' : '•'}</span>
            <div>
              <strong>${s.title}</strong>
              <div style="font-size:0.7rem;color:#637184;">${s.time}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  };

  if (trackForm && trackInput) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      renderTrackingResult(trackInput.value);
    });

    document.querySelectorAll('[data-sample-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sample = btn.getAttribute('data-sample-id') || '';
        trackInput.value = sample;
        renderTrackingResult(sample);
      });
    });
  }

  /* ==========================================================================
     9. Client Portal Form Validation
     ========================================================================== */
  const portalForm = document.getElementById('portal-form');
  const portalFeedback = document.getElementById('portal-feedback');

  if (portalForm && portalFeedback) {
    portalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('portal-email');
      const passInput = document.getElementById('portal-pass');
      const errEmail = document.getElementById('err-portal-email');
      const errPass = document.getElementById('err-portal-pass');

      const emailOk = validateEmail(emailInput.value.trim());
      const passOk = passInput.value.trim().length >= 6;

      emailInput.classList.toggle('input-invalid', !emailOk);
      passInput.classList.toggle('input-invalid', !passOk);
      errEmail.textContent = emailOk ? '' : 'Enter a valid corporate email.';
      errPass.textContent = passOk ? '' : 'Password must be at least 6 characters.';

      if (!emailOk || !passOk) {
        portalFeedback.hidden = true;
        return;
      }

      portalFeedback.hidden = false;
      portalFeedback.innerHTML = `
        <strong>Demo Portal Notice:</strong> Client authentication is not connected to a live identity provider in this static preview. For account provisioning, contact <strong>hello@transmove.in</strong>.
      `;
    });
  }
});
