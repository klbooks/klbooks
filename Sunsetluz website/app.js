/* --- KLBooks Brand Interactive Client-Side Logic --- */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- GLOBAL SELECTORS ---
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const globalOverlay = document.getElementById('global-overlay');

  // --- STICKY NAV SCROLL EFFECTS ---
  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run immediately in case user loaded page scrolled down

  // --- MOBILE DRAWER INTERACTION ---
  const openMobileMenu = () => {
    mobileMenu.classList.add('active');
    globalOverlay.classList.add('active');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('active');
    globalOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (menuToggle) menuToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
  if (globalOverlay) globalOverlay.addEventListener('click', closeMobileMenu);

  // Close mobile drawer when clicking navigation links
  document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // --- BLOG INDEX FILTERING & SEARCH ---
  const blogSearchInput = document.getElementById('blog-search');
  const categoryButtons = document.querySelectorAll('.blog-cat-btn');
  const blogGrid = document.getElementById('blog-grid');
  const blogCards = document.querySelectorAll('#blog-grid .article-card');

  if (blogGrid && blogCards.length > 0) {
    let activeCategory = 'all';
    let searchQuery = '';

    const filterArticles = () => {
      let visibleCount = 0;

      blogCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardTitle = card.querySelector('.article-card-title').textContent.toLowerCase();
        const cardExcerpt = card.querySelector('.article-card-excerpt').textContent.toLowerCase();
        
        const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);
        const matchesSearch = (cardTitle.includes(searchQuery) || cardExcerpt.includes(searchQuery));

        if (matchesCategory && matchesSearch) {
          card.style.display = '';
          // Retrigger scroll-reveal class for animation
          card.classList.add('active');
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Show "No results" if nothing matches
      const existingNoResults = document.getElementById('no-results-msg');
      if (visibleCount === 0) {
        if (!existingNoResults) {
          const msg = document.createElement('div');
          msg.id = 'no-results-msg';
          msg.className = 'no-results-msg';
          msg.textContent = 'No articles found matching your criteria. Try adjusting your search query.';
          blogGrid.appendChild(msg);
        }
      } else {
        if (existingNoResults) {
          existingNoResults.remove();
        }
      }
    };

    // Category click handler
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        filterArticles();
      });
    });

    // Search input handler
    if (blogSearchInput) {
      blogSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterArticles();
      });
    }
  }

  // --- FAQ ACCORDION DROPDOWN (BOOK PAGE) ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all open FAQs
      faqItems.forEach(i => i.classList.remove('active'));

      // If it wasn't active, open it
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- SOCIAL SHARING TRIGGERS (BLOG DETAIL PAGE) ---
  const shareTwitter = document.getElementById('share-twitter');
  const shareFacebook = document.getElementById('share-facebook');
  const shareLink = document.getElementById('share-link');

  if (shareTwitter || shareFacebook || shareLink) {
    const pageUrl = window.location.href;
    const pageTitle = document.title;

    if (shareTwitter) {
      shareTwitter.addEventListener('click', () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
      });
    }

    if (shareFacebook) {
      shareFacebook.addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      });
    }

    if (shareLink) {
      shareLink.addEventListener('click', () => {
        navigator.clipboard.writeText(pageUrl).then(() => {
          // Temporarily show checkmark icon/alert
          const originalIcon = shareLink.innerHTML;
          shareLink.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="color:var(--color-success);"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;
          shareLink.style.borderColor = 'var(--color-success)';
          
          setTimeout(() => {
            shareLink.innerHTML = originalIcon;
            shareLink.style.borderColor = '';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy text: ', err);
        });
      });
    }
  }

  // --- CONTACT FORM SUBMISSION HANDLING (FormSubmit API) ---
  const contactForm = document.getElementById('contact-form-action');
  const contactStatus = document.getElementById('contact-status-msg');
  const contactSendBtn = document.getElementById('contact-send-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Show loading/sending state
      const btnText = contactSendBtn.querySelector('span');
      const originalText = btnText.textContent;
      btnText.textContent = 'Sending Message...';
      contactSendBtn.disabled = true;
      contactSendBtn.style.opacity = '0.7';

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactStatus.textContent = '✓ Your message has been sent successfully. K.L. will get back to you soon.';
          contactStatus.className = 'contact-status success';
          contactForm.reset();
        } else {
          throw new Error('Server error response');
        }
      } catch (err) {
        contactStatus.textContent = '✗ Something went wrong. Please email directly at klvisionsbooks@gmail.com';
        contactStatus.className = 'contact-status error';
      } finally {
        btnText.textContent = originalText;
        contactSendBtn.disabled = false;
        contactSendBtn.style.opacity = '';

        // Clear status after 8 seconds
        setTimeout(() => {
          contactStatus.style.opacity = '0';
          setTimeout(() => {
            contactStatus.textContent = '';
            contactStatus.style.opacity = '1';
            contactStatus.className = 'contact-status';
          }, 300);
        }, 8000);
      }
    });
  }

  // --- INTERSECTION OBSERVER FOR SCROLL REVEAL EFFECTS ---
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Trigger reveal only once
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -20px 0px'
    });
    
    scrollElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fail-safe fallbacks if Intersection Observer is not supported
    scrollElements.forEach(el => {
      el.classList.add('active');
    });
  }

});
