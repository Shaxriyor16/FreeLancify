import "./index.css";
import confetti from "canvas-confetti";
import * as d3 from "d3";
import { jsPDF } from "jspdf";
import { renderBidChart } from "./chart.jsx";
import { renderTimeline } from "./timeline.jsx";
import { renderCollaborators } from "./collaborators.jsx";
import { renderDocuments } from "./documents.jsx";

document.addEventListener("DOMContentLoaded", () => {
  // ---- Setup Intersection Observer for project cards entrance animation ----
  window.projectCardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("opacity-0", "translate-y-4");
        entry.target.classList.add("opacity-100", "translate-y-0", "transition-all", "duration-500", "ease-out");
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  // Observe existing project cards
  requestAnimationFrame(() => {
    document.querySelectorAll(".js-project-card").forEach(card => {
      card.classList.add("opacity-0", "translate-y-4");
      card.classList.remove("opacity-100", "translate-y-0");
      window.projectCardObserver.observe(card);
    });
  });

  // ---- Make showToast available globally for React components if needed ----
  window.showToast = showToast;

  function updateMilestoneBadges() {
    const milestonesContainer = document.getElementById("milestones-container");
    if (!milestonesContainer) return;
    const rows = milestonesContainer.querySelectorAll(".py-4");
    rows.forEach(row => {
      const badge = row.querySelector(".js-status-badge");
      const progressBtn = row.querySelector(".js-update-milestone-btn");
      if (!badge || !progressBtn) return;
      
      const progress = parseInt(progressBtn.getAttribute("data-progress")) || 0;
      const isUrgent = badge.getAttribute("data-is-urgent") === "true";
      
      let badgeClasses = "js-status-badge text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ";
      let badgeText = "";
      
      if (progress === 100) {
        badgeClasses += "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
        badgeText = "Complete";
      } else if (isUrgent) {
        badgeClasses += "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse";
        badgeText = "Urgent";
      } else if (progress > 0) {
        badgeClasses += "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
        badgeText = "In Progress";
      } else {
        badgeClasses += "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
        badgeText = "Not Started";
      }
      
      badge.className = badgeClasses;
      badge.textContent = badgeText;
    });
  }

  updateMilestoneBadges();

  // ---- Check for urgent milestones (Deadlines) ----
  setTimeout(() => {
    const urgentMilestones = document.querySelectorAll(
      "#milestones-container .js-status-badge[data-is-urgent='true']",
    );
    if (urgentMilestones.length > 0) {
      if (typeof showToast === "function") {
        showToast(
          `Deadline approaching: You have ${urgentMilestones.length} urgent milestone${urgentMilestones.length > 1 ? "s" : ""}!`,
          "warning",
          6000,
        );
      }
    }
  }, 1500);

  // ---- Theme Toggle Logic ----
  const themeToggleBtn = document.getElementById("theme-toggle");
  const darkIcon = document.getElementById("theme-toggle-dark-icon");
  const lightIcon = document.getElementById("theme-toggle-light-icon");

  // Check initial state
  if (
    localStorage.getItem("color-theme") === "dark" ||
    (!("color-theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    if (lightIcon) lightIcon.classList.remove("hidden");
    if (darkIcon) darkIcon.classList.add("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    if (darkIcon) darkIcon.classList.remove("hidden");
    if (lightIcon) lightIcon.classList.add("hidden");
  }

  // Toggle event
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      // Toggle icons
      if (darkIcon) darkIcon.classList.toggle("hidden");
      if (lightIcon) lightIcon.classList.toggle("hidden");

      // Toggle logic
      if (localStorage.getItem("color-theme")) {
        if (localStorage.getItem("color-theme") === "light") {
          document.documentElement.classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        }
      } else {
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        }
      }
    });
  }

  // ---- Navigation Logic ----
  const navLinks = document.querySelectorAll(".nav-link");
  const viewSections = document.querySelectorAll(".view-section");

  function switchTab(targetId) {
    // Update nav buttons
    navLinks.forEach((link) => {
      const nav = link.closest("nav");
      const isMobile = nav ? nav.classList.contains("md:hidden") : false;
      
      if (link.dataset.target === targetId) {
        // Active state
        link.classList.add("active");
        if (isMobile) {
          link.classList.add("text-primary", "dark:text-primary");
          link.classList.remove("text-gray-500", "dark:text-gray-400");
        } else {
          link.classList.add("text-primary", "bg-primary-50", "dark:bg-primary-900/30");
          link.classList.remove("text-gray-600", "hover:bg-gray-100", "dark:text-gray-300", "dark:hover:bg-slate-700");
        }
      } else {
        // Inactive state
        link.classList.remove("active");
        if (isMobile) {
          link.classList.remove("text-primary", "dark:text-primary");
          link.classList.add("text-gray-500", "dark:text-gray-400");
        } else {
          link.classList.remove("text-primary", "bg-primary-50", "dark:bg-primary-900/30");
          link.classList.add("text-gray-600", "hover:bg-gray-100", "dark:text-gray-300", "dark:hover:bg-slate-700");
        }
      }
    });

    // Update views
    viewSections.forEach((section) => {
      if (section.id === `view-${targetId}`) {
        section.classList.remove("hidden");
        section.classList.add("block");
      } else {
        section.classList.remove("block");
        section.classList.add("hidden");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.dataset.target;
      switchTab(targetId);
      
      // Close profile dropdown if open
      const dropdown = document.getElementById("user-dropdown-menu");
      if (dropdown && !dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
      }
    });
  });

  // ---- Profile Dropdown Logic ----
  const profileBtn = document.getElementById("user-profile-btn");
  const profileDropdown = document.getElementById("user-dropdown-menu");
  
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });
    
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add("hidden");
      }
    });
  }

  // ---- Filtering Logic ----
  const searchInput = document.getElementById("job-search-input");
  const searchBtn = document.getElementById("job-search-btn");
  const filterCheckboxes = document.querySelectorAll(".js-filter-checkbox");
  const projectCardsRef = document.querySelectorAll(".js-project-card"); // initial reference
  const clearFiltersBtn = document.getElementById("clear-filters-btn");
  const filterGroupToggles = document.querySelectorAll(".js-filter-group-toggle");

  filterGroupToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !isExpanded);
      
      const chevron = toggle.querySelector(".js-filter-chevron");
      const content = toggle.nextElementSibling;
      
      if (isExpanded) {
        chevron.classList.add("-rotate-90");
        content.classList.remove("grid-rows-[1fr]");
        content.classList.add("grid-rows-[0fr]");
      } else {
        chevron.classList.remove("-rotate-90");
        content.classList.remove("grid-rows-[0fr]");
        content.classList.add("grid-rows-[1fr]");
      }
    });
  });

  // ---- Sort Logic ----
  const projectSortSelect = document.getElementById("project-sort");
  const availableProjectsList = document.getElementById("available-projects-list");

  // Save initial order
  projectCardsRef.forEach((card, idx) => {
     card.setAttribute("data-initial-order", idx);
  });

  function parseBudget(budgetStr) {
     if (!budgetStr) return 0;
     const matches = budgetStr.match(/[\d,]+/g);
     if (!matches) return 0;
     return Math.max(...matches.map(m => parseInt(m.replace(/,/g, ''), 10)));
  }

  function sortProjects() {
    if (!projectSortSelect || !availableProjectsList) return;
    const sortVal = projectSortSelect.value;
    const cardsArray = Array.from(document.querySelectorAll(".js-project-card"));
    
    cardsArray.sort((a, b) => {
       if (sortVal === "recency") {
          return parseInt(a.getAttribute("data-initial-order")) - parseInt(b.getAttribute("data-initial-order"));
       } else if (sortVal === "budget_high") {
          return parseBudget(b.getAttribute("data-budget")) - parseBudget(a.getAttribute("data-budget"));
       } else if (sortVal === "budget_low") {
          return parseBudget(a.getAttribute("data-budget")) - parseBudget(b.getAttribute("data-budget"));
       }
       return 0;
    });

    cardsArray.forEach(card => {
       availableProjectsList.appendChild(card);
    });
  }

  // Load and apply the saved sorting option from local storage on load
  if (projectSortSelect) {
    try {
      const savedSort = localStorage.getItem("preferred-project-sort");
      if (savedSort) {
        projectSortSelect.value = savedSort;
        sortProjects();
      }
    } catch (e) {
      console.warn("Could not read preferred sort from localStorage:", e);
    }

    projectSortSelect.addEventListener("change", () => {
       try {
         localStorage.setItem("preferred-project-sort", projectSortSelect.value);
       } catch (e) {
         console.warn("Could not save preferred sort to localStorage:", e);
       }
       sortProjects();
       filterProjects();
    });
  }

  function filterProjects() {
    const query = searchInput.value.toLowerCase().trim();

    const activeFilters = {
      category: [],
      type: [],
      skill: [],
      status: []
    };

    filterCheckboxes.forEach((cb) => {
      if (cb.checked && activeFilters[cb.dataset.filter]) {
        activeFilters[cb.dataset.filter].push(cb.value);
      }
    });

    let visibleIndex = 0;
    const currentProjectCards = document.querySelectorAll(".js-project-card");
    currentProjectCards.forEach((card) => {
      // Reset animation
      card.classList.remove("animate-fade-in-up");
      card.style.animationDelay = '';
      
      const title = (card.getAttribute("data-title") || "").toLowerCase();
      const descEl = card.querySelector(".line-clamp-2");
      const descTextContent = descEl
        ? descEl.getAttribute("data-raw-desc") || descEl.textContent
        : "";
      const desc = descTextContent.toLowerCase();

      // Store original description so we can highlight properly
      if (descEl && !descEl.hasAttribute("data-raw-desc")) {
        descEl.setAttribute("data-raw-desc", descTextContent);
      }

      const category = card.getAttribute("data-category") || "";
      const type = card.getAttribute("data-type") || "";
      const skills = (card.getAttribute("data-skills") || "").split(",");
      const isApplied = card.getAttribute("data-applied") === "true";

      const matchesSearch =
        !query || title.includes(query) || desc.includes(query);
      const matchesCategory =
        activeFilters.category.length === 0 ||
        activeFilters.category.includes(category);
      const matchesType =
        activeFilters.type.length === 0 || activeFilters.type.includes(type);
      const matchesSkill =
        activeFilters.skill.length === 0 ||
        activeFilters.skill.some((skill) => skills.includes(skill));
        
      const isSaved = card.getAttribute("data-saved") === "true";
      const hidesApplied = activeFilters.status.includes("Hides Applied");
      const requiresSaved = activeFilters.status.includes("Saved");
      
      const passesAppliedCheck = hidesApplied ? !isApplied : true;
      const passesSavedCheck = requiresSaved ? isSaved : true;
      const matchesStatus = passesAppliedCheck && passesSavedCheck;

      if (matchesSearch && matchesCategory && matchesType && matchesSkill && matchesStatus) {
        card.classList.remove("hidden");

        // Staggered animation
        card.classList.add("animate-fade-in-up");
        card.style.animationDelay = `${visibleIndex * 50}ms`;
        // Opacity 0 initially to prevent flash before animation starts
        // We'll trust the fadeInUp animation 'from' state to handle opacity

        visibleIndex++;

        // Apply highlighting to description
        if (descEl && query.length > 0) {
          const regex = new RegExp(`(${query})`, "gi");
          descEl.innerHTML = descTextContent.replace(
            regex,
            '<mark class="bg-yellow-200 dark:bg-yellow-800/50 text-gray-900 dark:text-white rounded px-1">$1</mark>',
          );
        } else if (descEl) {
          descEl.innerHTML = descTextContent;
        }

        // Apply Recommended Badge logic
        let matchBadge = card.querySelector(".js-recommended-badge");
        let hasFilters =
          activeFilters.skill.length > 0 ||
          activeFilters.category.length > 0 ||
          activeFilters.type.length > 0;

        if (hasFilters) {
          let matchedSkills = activeFilters.skill.filter((s) =>
            skills.includes(s),
          ).length;
          let totalSelected =
            activeFilters.skill.length +
            (activeFilters.category.length > 0 ? 1 : 0) +
            (activeFilters.type.length > 0 ? 1 : 0);
          let currentMatches =
            matchedSkills +
            (matchesCategory && activeFilters.category.length > 0 ? 1 : 0) +
            (matchesType && activeFilters.type.length > 0 ? 1 : 0);

          if (currentMatches > 0) {
            const basePercentage = Math.round(
              (currentMatches / totalSelected) * 100,
            );
            // mock a realistic score by tweaking slightly based on title length
            const mockScore = Math.min(
              99,
              Math.max(0, basePercentage - (title.length % 10) + 5),
            );

            if (!matchBadge) {
              matchBadge = document.createElement("div");
              matchBadge.className =
                "js-recommended-badge inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2.5 border border-green-200 dark:border-green-800/50";
              const titleWrapper = card.querySelector("h3").parentElement;
              titleWrapper.insertBefore(matchBadge, titleWrapper.firstChild);
            }
            matchBadge.classList.remove("hidden");
            matchBadge.innerHTML = `
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Recommended for you · ${mockScore}% Match</span>
              `;
          } else {
            if (matchBadge) matchBadge.classList.add("hidden");
          }
        } else {
          if (matchBadge) matchBadge.classList.add("hidden");
        }
      } else {
        card.classList.add("hidden");
      }
    });

    renderActiveFilters(activeFilters, query);
  }

  function renderActiveFilters(activeFilters, query) {
    const container = document.getElementById("active-filters-container");
    if (!container) return;
    container.innerHTML = "";
    
    const createPill = (label, onRemove) => {
      const pill = document.createElement("div");
      pill.className = "flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm shadow-sm";
      pill.innerHTML = `
        <span>${label}</span>
        <button type="button" class="text-white/70 hover:text-white transition-colors focus:outline-none rounded-full ml-1" aria-label="Remove filter">
          <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      `;
      pill.querySelector("button").addEventListener("click", onRemove);
      return pill;
    };

    if (query.trim()) {
       container.appendChild(createPill(`Search: "${query.trim()}"`, () => {
           searchInput.value = "";
           const targetBtn = document.getElementById("job-search-clear-btn");
           if(targetBtn) targetBtn.classList.add("hidden");
           filterProjects();
       }));
    }

    Object.keys(activeFilters).forEach(category => {
        activeFilters[category].forEach(val => {
            const prettyVal = val === "Hides Applied" ? "Hide Applied" : val;
            container.appendChild(createPill(prettyVal, () => {
                const cb = Array.from(filterCheckboxes).find(c => c.value === val && c.dataset.filter === category);
                if (cb) {
                    cb.checked = false;
                    filterProjects();
                }
            }));
        });
    });
  }

  const searchClearBtn = document.getElementById("job-search-clear-btn");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterProjects();
      if (searchClearBtn) {
        if (searchInput.value.trim().length > 0) {
          searchClearBtn.classList.remove("hidden");
        } else {
          searchClearBtn.classList.add("hidden");
        }
      }
    });
    
    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchClearBtn.classList.add("hidden");
        filterProjects();
        searchInput.focus();
      });
    }
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", filterProjects);
  }

  filterCheckboxes.forEach((cb) => {
    cb.addEventListener("change", filterProjects);
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        if (searchClearBtn) searchClearBtn.classList.add("hidden");
      }
      filterCheckboxes.forEach((cb) => (cb.checked = false));
      filterProjects();
    });
  }

  // ---- Recent Searches Logic ----
  const recentSearchesDropdown = document.getElementById(
    "recent-searches-dropdown",
  );
  const recentSearchesList = document.getElementById("recent-searches-list");
  const clearRecentSearchesBtn = document.getElementById(
    "clear-recent-searches-btn",
  );

  const MAX_RECENT_SEARCHES = 5;

  function getRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem("recentSearches")) || [];
    } catch {
      return [];
    }
  }

  function saveRecentSearch(query) {
    if (!query) return;
    let searches = getRecentSearches();
    searches = searches.filter((q) => q.toLowerCase() !== query.toLowerCase()); // remove duplicate
    searches.unshift(query); // add to top
    if (searches.length > MAX_RECENT_SEARCHES) searches.pop();
    localStorage.setItem("recentSearches", JSON.stringify(searches));
    renderRecentSearches();
  }

  function renderRecentSearches() {
    if (!recentSearchesDropdown || !recentSearchesList) return;
    const searches = getRecentSearches();
    recentSearchesList.innerHTML = "";

    if (searches.length === 0) {
      recentSearchesList.innerHTML =
        '<li class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No recent searches</li>';
      return;
    }

    searches.forEach((search) => {
      const li = document.createElement("li");
      li.className =
        "px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center justify-between group transition-colors";
      li.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">${search}</span>
        </div>
      `;
      li.addEventListener("click", () => {
        searchInput.value = search;
        recentSearchesDropdown.classList.add("hidden");
        filterProjects();
      });
      recentSearchesList.appendChild(li);
    });
  }

  function renderTrendingSkills() {
    const trendingSkillsList = document.getElementById("trending-skills-list");
    if (!trendingSkillsList) return;

    const trendingSkills = [
      "React",
      "Node.js",
      "Python",
      "UI/UX",
      "Tailwind CSS",
      "Data Science",
      "AWS",
      "Typescript",
    ];

    trendingSkillsList.innerHTML = "";
    trendingSkills.forEach((skill) => {
      const btn = document.createElement("button");
      btn.className =
        "px-3 py-1.5 bg-gray-100 dark:bg-slate-700/50 hover:bg-primary/10 hover:text-primary text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-primary/20";
      btn.textContent = skill;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        searchInput.value = skill;
        saveRecentSearch(skill);
        recentSearchesDropdown.classList.add("hidden");
        filterProjects();
      });
      trendingSkillsList.appendChild(btn);
    });
  }

  if (searchInput && recentSearchesDropdown) {
    searchInput.addEventListener("focus", () => {
      renderRecentSearches();
      renderTrendingSkills();
      recentSearchesDropdown.classList.remove("hidden");
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        saveRecentSearch(query);
        recentSearchesDropdown.classList.add("hidden");
        // filterProjects is already attached to input event, but if needed we call it:
        filterProjects();
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !recentSearchesDropdown.contains(e.target)
      ) {
        recentSearchesDropdown.classList.add("hidden");
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      saveRecentSearch(query);
      recentSearchesDropdown.classList.add("hidden");
    });
  }

  if (clearRecentSearchesBtn) {
    clearRecentSearchesBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent document click from closing dropdown if it triggers
      localStorage.removeItem("recentSearches");
      renderRecentSearches();
      searchInput.focus();
    });
  }

  // ---- Project Details Modal Logic ----
  const modalBackdrop = document.getElementById("project-modal-backdrop");
  const modal = document.getElementById("project-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");

  let currentOpenedCard = null;

  // ---- Quick View Modal Logic ----
  const quickViewModal = document.getElementById("quick-view-modal");
  
  function openQuickViewModal(card) {
    if (!quickViewModal) return;
    
    currentOpenedCard = card;
    const title = card.getAttribute("data-title") || "Project Title";
    const category = card.getAttribute("data-category") || "Category";
    const type = card.getAttribute("data-type") || "Fixed";
    const budget = card.getAttribute("data-budget") || "$0";
    const skills = (card.getAttribute("data-skills") || "").split(",");
    
    const titleEl = document.getElementById("quick-view-title");
    const categoryEl = document.getElementById("quick-view-category");
    const typeEl = document.getElementById("quick-view-type");
    const budgetEl = document.getElementById("quick-view-budget");
    const skillsContainer = document.getElementById("quick-view-skills");
    const applyBtn = quickViewModal.querySelector(".js-quick-view-apply");

    if (titleEl) titleEl.textContent = title;
    if (categoryEl) categoryEl.textContent = category;
    if (typeEl) typeEl.textContent = type;
    if (budgetEl) budgetEl.textContent = budget;
    
    if (skillsContainer) {
      skillsContainer.innerHTML = "";
      skills.forEach((skill) => {
        if (!skill.trim()) return;
        const sp = document.createElement("span");
        sp.className =
          "px-2.5 py-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/50 text-gray-700 dark:text-gray-300 text-[11px] font-bold rounded uppercase tracking-wider";
        sp.textContent = skill.trim();
        skillsContainer.appendChild(sp);
      });
    }

    if (applyBtn) {
       const isApplied = card.getAttribute("data-applied") === "true";
       if (isApplied) {
          applyBtn.textContent = "Applied";
          applyBtn.classList.remove("bg-primary", "hover:bg-primary-600");
          applyBtn.classList.add("bg-green-500", "cursor-default");
       } else {
          applyBtn.innerHTML = `Apply Now <svg class="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
          applyBtn.classList.add("bg-primary", "hover:bg-primary-600");
          applyBtn.classList.remove("bg-green-500", "cursor-default");
       }
    }

    quickViewModal.classList.remove("pointer-events-none", "opacity-0");
    const backdrop = quickViewModal.querySelector(".js-close-quick-view");
    const innerPanel = quickViewModal.children[1];
    if (backdrop) backdrop.classList.remove("opacity-0");
    if (innerPanel) {
      innerPanel.classList.remove("scale-95", "opacity-0");
      innerPanel.classList.add("scale-100", "opacity-100");
    }
  }

  function closeQuickViewModal() {
    if (!quickViewModal) return;
    const backdrop = quickViewModal.querySelector(".js-close-quick-view");
    const innerPanel = quickViewModal.children[1];
    
    if (innerPanel) {
      innerPanel.classList.remove("scale-100", "opacity-100");
      innerPanel.classList.add("scale-95", "opacity-0");
    }
    
    setTimeout(() => {
      quickViewModal.classList.add("pointer-events-none", "opacity-0");
    }, 300);
  }

  // Setup close quick view events
  document.querySelectorAll(".js-close-quick-view").forEach(btn => {
    btn.addEventListener("click", closeQuickViewModal);
  });
  
  if (quickViewModal) {
    const applyBtn = quickViewModal.querySelector(".js-quick-view-apply");
    if (applyBtn) {
      applyBtn.addEventListener("click", (e) => {
        if (!currentOpenedCard || currentOpenedCard.getAttribute("data-applied") === "true") return;
        
        applyBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Applying...
        `;
        
        setTimeout(() => {
          applyBtn.innerHTML = `Applied`;
          applyBtn.classList.remove("bg-primary", "hover:bg-primary-600");
          applyBtn.classList.add("bg-green-500", "cursor-default");
          
          if (currentOpenedCard) {
            currentOpenedCard.setAttribute("data-applied", "true");
            // update original apply button on card too
            const cardApplyBtn = Array.from(currentOpenedCard.querySelectorAll("button")).find(b => b.textContent.trim().includes("Apply Now"));
            if (cardApplyBtn) {
              cardApplyBtn.innerHTML = `Applied`;
              cardApplyBtn.classList.remove("bg-primary", "hover:scale-105");
              cardApplyBtn.classList.add("bg-green-500", "cursor-default");
            }
          }
          filterProjects();
          showToast("Application sent successfully!", "success");
        }, 1500);
      });
    }
  }

  function openModal(card) {
    currentOpenedCard = card;
    // Extract data
    const title = card.getAttribute("data-title") || "";
    const type = card.getAttribute("data-type") || "";
    const skills = (card.getAttribute("data-skills") || "").split(",");
    const budget = card.getAttribute("data-budget") || "";
    const level = card.getAttribute("data-level") || "";
    const desc = card.getAttribute("data-desc") || "";
    const time = card.getAttribute("data-time") || "";
    const client = card.getAttribute("data-client") || "";
    const spent = card.getAttribute("data-spent") || "";
    const clientTime = card.getAttribute("data-client-time") || "Unknown";
    const clientResponse = card.getAttribute("data-response") || "~1 hr response";

    // Populate modal
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-desc").textContent = desc;
    document.getElementById("modal-budget").textContent = budget;
    document.getElementById("modal-type-badge").textContent = type;
    document.getElementById("modal-type-text").textContent = type;
    document.getElementById("modal-level").textContent = level;
    document.getElementById("modal-time").textContent = time;
    document.getElementById("modal-client").textContent = client;
    document.getElementById("modal-spent").textContent = spent;
    
    const clientTimeEl = document.getElementById("modal-client-time");
    if (clientTimeEl) {
      clientTimeEl.textContent = clientTime;
    }
    
    const clientResponseEl = document.getElementById("modal-client-response");
    if (clientResponseEl) {
      clientResponseEl.textContent = clientResponse;
    }

    const skillsContainer = document.getElementById("modal-skills");
    skillsContainer.innerHTML = "";
    const userMatchedSkills = ["react.js", "django", "tailwindcss", "figma"];
    skills.forEach((skill) => {
      if (!skill.trim()) return;
      const s = skill.trim();
      const sp = document.createElement("span");
      const isMatch = userMatchedSkills.includes(s.toLowerCase());

      if (isMatch) {
        sp.className =
          "flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg uppercase tracking-wider shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all cursor-pointer hover:bg-green-100 dark:hover:bg-green-800/40";
        sp.innerHTML = `<svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${s}`;
      } else {
        sp.className =
          "px-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/50 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors";
        sp.textContent = s;
      }
      
      sp.addEventListener("click", () => {
         closeModal();
         switchTab("find-work");
         if (searchInput) {
            searchInput.value = s;
            saveRecentSearch(s);
            filterProjects();
            const dropdown = document.getElementById("recent-searches-dropdown");
            if (dropdown) dropdown.classList.add("hidden");
            searchInput.focus();
         }
      });

      skillsContainer.appendChild(sp);
    });

    // Reset Apply Button state if needed
    const modalApplyBtn = document.getElementById("modal-apply-btn");
    if (modalApplyBtn) {
      const span = modalApplyBtn.querySelector("span");
      span.textContent = "Quick Apply";
      modalApplyBtn.classList.add("bg-primary", "hover:bg-primary-600");
      modalApplyBtn.classList.remove("bg-green-500", "hover:bg-green-600");
      modalApplyBtn.querySelector("svg").innerHTML =
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>';
      modalApplyBtn.querySelector("svg").classList.remove("animate-spin");
    }

    // Reset Save Button state
    const modalSaveBtn = document.getElementById("modal-save-btn");
    if (modalSaveBtn && currentOpenedCard) {
      const isCardSaved = currentOpenedCard.getAttribute("data-saved") === "true";
      modalSaveBtn.setAttribute("data-saved", isCardSaved ? "true" : "false");
      
      if (isCardSaved) {
        modalSaveBtn.innerHTML = `<svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg> <span>Saved</span>`;
        modalSaveBtn.classList.remove(
          "text-gray-700",
          "dark:text-gray-200",
          "border-gray-300",
          "dark:border-slate-600",
          "bg-white",
          "dark:bg-slate-800"
        );
        modalSaveBtn.classList.add(
          "text-primary",
          "border-primary-200",
          "bg-primary-50",
          "dark:bg-primary-900/20"
        );
      } else {
        modalSaveBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg> <span>Save for later</span>`;
        modalSaveBtn.classList.remove(
          "text-primary",
          "border-primary-200",
          "bg-primary-50",
          "dark:bg-primary-900/20"
        );
        modalSaveBtn.classList.add(
          "text-gray-700",
          "dark:text-gray-200",
          "border-gray-300",
          "dark:border-slate-600",
          "bg-white",
          "dark:bg-slate-800"
        );
      }
    }

    // Reset description toggle
    const modalDesc = document.getElementById("modal-desc");
    const modalDescToggle = document.getElementById("modal-desc-toggle");
    const modalDescFade = document.getElementById("modal-desc-fade");

    if (modalDesc && modalDescToggle && modalDescFade) {
      modalDesc.classList.add("line-clamp-3");
      modalDescToggle.textContent = "Read More";
      modalDescFade.classList.remove("opacity-0");
      modalDescFade.classList.remove("hidden");
      modalDescToggle.classList.remove("hidden");

      setTimeout(() => {
        // If text is not long enough to be clamped, hide the 'Read More' features
        if (modalDesc.scrollHeight <= modalDesc.clientHeight) {
          modalDescToggle.classList.add("hidden");
          modalDescFade.classList.add("hidden");
        }
      }, 50);
    }

    // Show modal
    modalBackdrop.classList.remove("hidden");
    // Small delay for CSS transition
    setTimeout(() => {
      modalBackdrop.classList.remove("opacity-0");
      modal.classList.remove("scale-95");
      modal.classList.add("scale-100");
      document.body.style.overflow = "hidden"; // prevent bg body scrolling
      renderBidChart();
      renderTimeline();
      renderCollaborators();
      renderDocuments();
    }, 10);
  }

  function closeModal() {
    modalBackdrop.classList.add("opacity-0");
    modal.classList.remove("scale-100");
    modal.classList.add("scale-95");
    setTimeout(() => {
      modalBackdrop.classList.add("hidden");
      document.body.style.overflow = ""; // restore scrolling
    }, 300); // matches Tailwind CSS transition duration
  }

  // Attach click listener for Read More toggle
  const modalDescToggleBtn = document.getElementById("modal-desc-toggle");
  const modalDescText = document.getElementById("modal-desc");
  const modalDescFadeEl = document.getElementById("modal-desc-fade");
  if (modalDescToggleBtn && modalDescText && modalDescFadeEl) {
    modalDescToggleBtn.addEventListener("click", () => {
      if (modalDescText.classList.contains("line-clamp-3")) {
        modalDescText.classList.remove("line-clamp-3");
        modalDescToggleBtn.textContent = "Read Less";
        modalDescFadeEl.classList.add("opacity-0");
      } else {
        modalDescText.classList.add("line-clamp-3");
        modalDescToggleBtn.textContent = "Read More";
        modalDescFadeEl.classList.remove("opacity-0");
      }
    });
  }

  // Read saved jobs from local storage initially
  let savedJobs = [];
  try {
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      savedJobs = JSON.parse(saved);
    }
  } catch(e) {}

  function setupCard(card) {
    // Make card focusable for keyboard navigation
    card.setAttribute("tabindex", "0");
    card.classList.add("focus:outline-none", "focus:ring-2", "focus:ring-primary", "focus:border-transparent");

    const titleEl = card.querySelector("h3");
    if (titleEl) {
      titleEl.addEventListener("click", () => openModal(card));
    }

    const settingsMenu = card.querySelector(".group\\/settings");
    if (settingsMenu) {
      settingsMenu.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
    
    // Find "Apply Now" button on the card
    const buttons = card.querySelectorAll("button");
    let applyBtn = null;
    buttons.forEach(btn => {
      if (btn.textContent.trim() === "Apply Now") {
        applyBtn = btn;
      }
    });
    
    if (applyBtn) {
      applyBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent modal if it was bubbling
        
        const quickApplyToggle = card.querySelector(".js-quick-apply-toggle");
        if (quickApplyToggle && !quickApplyToggle.checked) {
          openModal(card);
          return;
        }

        applyBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Applying...
        `;
        
        setTimeout(() => {
          applyBtn.innerHTML = `Applied`;
          applyBtn.classList.remove("bg-primary", "hover:scale-105");
          applyBtn.classList.add("bg-green-500", "cursor-default");
          
          card.setAttribute("data-applied", "true");
          filterProjects();
          showToast("Instant application sent with default cover letter!", "success");
        }, 1500);
      });
    }

    const saveBtn = card.querySelector(".js-save-btn");
    const jobTitle = card.getAttribute("data-title") || "";
    
    if (saveBtn) {
      const icon = saveBtn.querySelector(".js-save-icon");
      const tooltip = saveBtn.querySelector(".js-save-tooltip");

      // Initialize saved state from localStorage
      if (savedJobs.includes(jobTitle)) {
        card.setAttribute("data-saved", "true");
        if (icon) {
          icon.setAttribute("fill", "currentColor");
          icon.classList.add("text-primary");
        }
        if (saveBtn) {
          saveBtn.classList.add("border-primary", "text-primary");
        }
        if (tooltip) {
          tooltip.textContent = "Saved";
        }
      }

      // Add click listener
      saveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isSaved = card.getAttribute("data-saved") === "true";

        if (isSaved) {
          card.setAttribute("data-saved", "false");
          if (icon) {
            icon.setAttribute("fill", "none");
            icon.classList.remove("text-primary");
          }
          saveBtn.classList.remove("border-primary", "text-primary");
          if (tooltip) tooltip.textContent = "Save";
          
          // Remove from local storage
          savedJobs = savedJobs.filter(t => t !== jobTitle);
        } else {
          card.setAttribute("data-saved", "true");
          if (icon) {
            icon.setAttribute("fill", "currentColor");
            icon.classList.add("text-primary");
          }
          saveBtn.classList.add("border-primary", "text-primary");
          if (tooltip) tooltip.textContent = "Saved";
          
          // Add to local storage
          if (!savedJobs.includes(jobTitle)) {
            savedJobs.push(jobTitle);
          }
        }
        
        // Persist to localStorage
        try {
          localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
        } catch(err) {}
        
        filterProjects();
      });
    }

    const quickViewBtn = card.querySelector(".js-quick-view-btn");
    if (quickViewBtn) {
      quickViewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openQuickViewModal(card);
      });
    }
  }

  // Attach listeners to initial cards
  projectCardsRef.forEach((card) => {
    setupCard(card);
  });

  // ---- Keyboard Navigation for Project Cards ----
  document.addEventListener("keydown", (e) => {
    // Check if any modal is open
    const isMainModalOpen = modalBackdrop && !modalBackdrop.classList.contains("hidden") && !modalBackdrop.classList.contains("opacity-0");
    const isQuickViewOpen = quickViewModal && !quickViewModal.classList.contains("opacity-0");
    const coverLetterModalEl = document.getElementById("ai-cover-letter-modal");
    const isAiModalOpen = coverLetterModalEl && !coverLetterModalEl.classList.contains("hidden");
    
    if (isMainModalOpen || isQuickViewOpen || isAiModalOpen) return;

    // Only process ArrowDown, ArrowUp, Enter
    if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
      const visibleCards = Array.from(document.querySelectorAll(".js-project-card:not(.hidden)"));
      if (visibleCards.length === 0) return;
      
      const currentIndex = visibleCards.indexOf(document.activeElement);

      if (e.key === "ArrowDown") {
        e.preventDefault(); // Prevent scrolling
        if (currentIndex === -1 || currentIndex === visibleCards.length - 1) {
          visibleCards[0].focus();
        } else {
          visibleCards[currentIndex + 1].focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault(); // Prevent scrolling
        if (currentIndex === -1 || currentIndex === 0) {
          visibleCards[visibleCards.length - 1].focus();
        } else {
          visibleCards[currentIndex - 1].focus();
        }
      } else if (e.key === "Enter") {
        if (currentIndex !== -1) {
          e.preventDefault();
          openModal(visibleCards[currentIndex]);
        }
      }
    }
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  const modalExportPdfBtn = document.getElementById("modal-export-pdf-btn");
  if (modalExportPdfBtn) {
    modalExportPdfBtn.addEventListener("click", () => {
      const title =
        document.getElementById("modal-title").textContent || "Project Details";
      const desc = document.getElementById("modal-desc").textContent || "";
      const budget = document.getElementById("modal-budget").textContent || "";
      const type =
        document.getElementById("modal-type-badge").textContent || "";
      const level = document.getElementById("modal-level").textContent || "";
      const client = document.getElementById("modal-client").textContent || "";

      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(22);
      const splitTitle = doc.splitTextToSize(title, 170);
      doc.text(splitTitle, 20, y);
      y += splitTitle.length * 10;

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Client: ${client}`, 20, y);
      y += 8;
      doc.text(
        `Type: ${type} | Experience: ${level} | Budget: ${budget}`,
        20,
        y,
      );
      y += 15;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Project Description", 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(50);

      const splitDesc = doc.splitTextToSize(desc, 170);
      doc.text(splitDesc, 20, y);
      y += splitDesc.length * 6 + 10;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Timeline & Milestones", 20, y);
      y += 8;

      const timelineItems = document.querySelectorAll(
        "#project-timeline-root h4",
      );
      if (timelineItems.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(50);
        timelineItems.forEach((item, index) => {
          const splitItem = doc.splitTextToSize(
            `${index + 1}. ${item.textContent.trim()}`,
            170,
          );
          doc.text(splitItem, 20, y);
          y += splitItem.length * 6;
        });
      } else {
        doc.setFontSize(11);
        doc.setTextColor(50);
        doc.text("No specific deliverables set in this view.", 20, y);
      }

      if (typeof showToast === "function") {
        showToast("PDF generated successfully!", "success");
      }

      doc.save(
        `${title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_Summary.pdf`,
      );
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalBackdrop.classList.contains("hidden")) {
      closeModal();
    }
  });

  // ---- Share & Toast Logic ----
  const shareBtns = document.querySelectorAll(".js-share-btn");

  function showToast(message, type = "success", duration = 3000) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    const toastMsg = document.getElementById("toast-message");
    const toastIcon = document.getElementById("toast-icon");
    const toastIconBg = document.getElementById("toast-icon-bg");

    if (toastMsg) toastMsg.textContent = message;

    if (toastIconBg) {
      toastIconBg.className = "p-1 rounded-full"; // reset
      if (type === "success") {
        toastIconBg.classList.add("bg-green-500/20", "text-green-400");
      } else if (type === "info") {
        toastIconBg.classList.add("bg-blue-500/20", "text-blue-400");
      } else if (type === "warning" || type === "error") {
        toastIconBg.classList.add("bg-red-500/20", "text-red-400");
      }
    }

    if (toastIcon) {
      if (type === "success") {
        toastIcon.innerHTML =
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
      } else if (type === "info") {
        toastIcon.innerHTML =
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
      } else if (type === "warning" || type === "error") {
        toastIcon.innerHTML =
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>';
      }
    }

    toast.classList.remove("translate-y-20", "opacity-0");

    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      toast.classList.add("translate-y-20", "opacity-0");
    }, duration); // Hide after duration
  }

  shareBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent modal from opening
      const link = btn.getAttribute("data-link");
      if (link) {
        navigator.clipboard
          .writeText(link)
          .then(() => {
            showToast("Link copied to clipboard!", "success");
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      }
    });
  });

  const modalApplyBtn = document.getElementById("modal-apply-btn");
  if (modalApplyBtn) {
    modalApplyBtn.addEventListener("click", () => {
      const span = modalApplyBtn.querySelector("span");
      const svg = modalApplyBtn.querySelector("svg");
      if (span.textContent === "Quick Apply") {
        // Spinner State
        span.textContent = "Applying...";
        svg.innerHTML =
          '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" class="opacity-25"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>';
        svg.classList.add("animate-spin");

        // Final Success State
        setTimeout(() => {
          span.textContent = "Applied";
          modalApplyBtn.classList.remove("bg-primary", "hover:bg-primary-600");
          modalApplyBtn.classList.add("bg-green-500", "hover:bg-green-600");
          svg.classList.remove("animate-spin");
          svg.innerHTML =
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';

          if (currentOpenedCard) {
            currentOpenedCard.setAttribute("data-applied", "true");
            filterProjects();
          }

          showToast("Quick application sent successfully!", "success");
        }, 1500);
      }
    });
  }

  // ---- Escrow / Release Funds Logic ----
  const modalReleaseBtn = document.getElementById("modal-release-funds-btn");
  if (modalReleaseBtn) {
    modalReleaseBtn.addEventListener("click", () => {
      // Spinner State
      modalReleaseBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Completing API Transaction...
      `;
      modalReleaseBtn.disabled = true;
      modalReleaseBtn.classList.add("opacity-75", "cursor-not-allowed");

      // Simulate Escrow API transfer (Freelancer receiving funds from Employer's Escrow)
      setTimeout(() => {
        modalReleaseBtn.innerHTML = `
          <span>Funds Released to Freelancer</span>
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        `;
        modalReleaseBtn.classList.remove(
          "bg-green-500",
          "hover:bg-green-600",
          "opacity-75",
          "cursor-not-allowed",
        );
        modalReleaseBtn.classList.add("bg-gray-400", "hover:bg-gray-500");

        // Show success notification matching user request
        showToast(
          "Escrow API: Funds securely transferred to Freelancer's Balance",
          "success",
        );

        // Trigger generic platform confetti
        if (typeof confetti !== "undefined") {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#10b981", "#34d399", "#fbbf24"],
          });
        }
      }, 1500);
    });
  }

  const modalSaveBtn = document.getElementById("modal-save-btn");
  if (modalSaveBtn) {
    modalSaveBtn.addEventListener("click", () => {
      const isSaved = modalSaveBtn.getAttribute("data-saved") === "true";
      if (isSaved) {
        modalSaveBtn.setAttribute("data-saved", "false");
        modalSaveBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg> <span>Save for later</span>`;
        modalSaveBtn.classList.remove(
          "text-primary",
          "border-primary-200",
          "bg-primary-50",
          "dark:bg-primary-900/20"
        );
        modalSaveBtn.classList.add(
          "text-gray-700",
          "dark:text-gray-200",
          "border-gray-300",
          "dark:border-slate-600",
          "bg-white",
          "dark:bg-slate-800"
        );
      } else {
        modalSaveBtn.setAttribute("data-saved", "true");
        modalSaveBtn.innerHTML = `<svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg> <span>Saved</span>`;
        modalSaveBtn.classList.remove(
          "text-gray-700",
          "dark:text-gray-200",
          "border-gray-300",
          "dark:border-slate-600",
          "bg-white",
          "dark:bg-slate-800"
        );
        modalSaveBtn.classList.add(
          "text-primary",
          "border-primary-200",
          "bg-primary-50",
          "dark:bg-primary-900/20"
        );

        // Add pop animation
        modalSaveBtn.classList.add("scale-105");
        setTimeout(() => modalSaveBtn.classList.remove("scale-105"), 150);
      }
      
      // Update the card if it's open
      if (currentOpenedCard) {
        const jobTitle = currentOpenedCard.getAttribute("data-title") || "";
        currentOpenedCard.setAttribute("data-saved", !isSaved ? "true" : "false");
        
        let currentSaved = [];
        try {
          const sv = localStorage.getItem("savedJobs");
          if (sv) currentSaved = JSON.parse(sv);
        } catch(err) {}

        if (isSaved) {
          // It was saved, now not saved
          currentSaved = currentSaved.filter(t => t !== jobTitle);
        } else {
          // It was not saved, now saved
          if (!currentSaved.includes(jobTitle)) {
            currentSaved.push(jobTitle);
          }
        }
        try {
          localStorage.setItem("savedJobs", JSON.stringify(currentSaved));
        } catch(err) {}

        // Update its UI
        const saveBtn = currentOpenedCard.querySelector(".js-save-btn");
        if (saveBtn) {
          const icon = saveBtn.querySelector(".js-save-icon");
          const tooltip = saveBtn.querySelector(".js-save-tooltip");
          
          if (isSaved) {
            if (icon) {
              icon.setAttribute("fill", "none");
              icon.classList.remove("text-primary");
            }
            saveBtn.classList.remove("border-primary", "text-primary");
            if (tooltip) tooltip.textContent = "Save";
          } else {
            if (icon) {
              icon.setAttribute("fill", "currentColor");
              icon.classList.add("text-primary");
            }
            saveBtn.classList.add("border-primary", "text-primary");
            if (tooltip) tooltip.textContent = "Saved";
          }
        }
        
        filterProjects();
      }
    });
  }

  // ---- Milestone Modal Logic ----
  const milestoneModalBackdrop = document.getElementById(
    "milestone-modal-backdrop",
  );
  const milestoneModal = document.getElementById("milestone-modal");
  const cancelMilestoneBtn = document.getElementById("cancel-milestone-btn");
  const saveMilestoneBtn = document.getElementById("save-milestone-btn");
  const milestoneProgressInput = document.getElementById(
    "milestone-progress-input",
  );
  const milestoneProgressValue = document.getElementById(
    "milestone-progress-value",
  );
  const milestonePrivateNotes = document.getElementById(
    "milestone-private-notes",
  );

  let currentMilestoneId = null;
  const milestoneData = {};

  function openMilestoneModal(id, title, progress) {
    currentMilestoneId = id;
    document.getElementById("milestone-modal-title").textContent = title;
    milestoneProgressInput.value = progress;
    milestoneProgressValue.textContent = `${progress}%`;

    if (milestonePrivateNotes) {
      milestonePrivateNotes.value = milestoneData[id] || "";
    }

    milestoneModalBackdrop.classList.remove("hidden");
    setTimeout(() => {
      milestoneModalBackdrop.classList.remove("opacity-0");
      milestoneModal.classList.remove("scale-95");
      milestoneModal.classList.add("scale-100");
      document.body.style.overflow = "hidden";
    }, 10);
  }

  function closeMilestoneModal() {
    milestoneModalBackdrop.classList.add("opacity-0");
    milestoneModal.classList.remove("scale-100");
    milestoneModal.classList.add("scale-95");
    setTimeout(() => {
      milestoneModalBackdrop.classList.add("hidden");
      document.body.style.overflow = "";
    }, 300);
  }

  if (milestoneProgressInput) {
    milestoneProgressInput.addEventListener("input", (e) => {
      milestoneProgressValue.textContent = `${e.target.value}%`;
    });
  }

  document.querySelectorAll(".js-update-milestone-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const title = btn.getAttribute("data-title");
      const progress = btn.getAttribute("data-progress");
      openMilestoneModal(id, title, progress);
    });
  });

  if (cancelMilestoneBtn) {
    cancelMilestoneBtn.addEventListener("click", closeMilestoneModal);
  }

  if (saveMilestoneBtn) {
    saveMilestoneBtn.addEventListener("click", () => {
      if (currentMilestoneId) {
        const oldProgress = parseInt(
          document
            .querySelector(
              `.js-update-milestone-btn[data-id="${currentMilestoneId}"]`,
            )
            ?.getAttribute("data-progress") || "0",
        );
        const newProgress = parseInt(milestoneProgressInput.value);
        const textEl = document.querySelector(
          `.js-progress-text[data-id="${currentMilestoneId}"]`,
        );
        const barEl = document.getElementById(`bar-${currentMilestoneId}`);
        const btnEl = document.querySelector(
          `.js-update-milestone-btn[data-id="${currentMilestoneId}"]`,
        );

        if (textEl) textEl.textContent = `${newProgress}%`;
        if (barEl) barEl.style.width = `${newProgress}%`;
        if (btnEl) btnEl.setAttribute("data-progress", newProgress);

        if (milestonePrivateNotes) {
          milestoneData[currentMilestoneId] = milestonePrivateNotes.value;
          // Update the tooltip with the note
          if (btnEl) {
            const row = btnEl.closest(".py-4");
            if (row) {
              const noteContentEl = row.querySelector(".note-content");
              if (noteContentEl) {
                noteContentEl.textContent =
                  milestonePrivateNotes.value || "No notes";
              }
            }
          }
        }

        if (newProgress === 100 && oldProgress !== 100) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#4f46e5", "#10b981", "#fbbf24"],
          });
          showToast("Milestone Completed!", "success");

          if (barEl) {
            barEl.classList.remove("bg-primary", "animate-pulse");
            barEl.classList.add(
              "bg-green-500",
              "shadow-[0_0_12px_rgba(34,197,94,0.8)]",
            );

            // Also animate the timeline mini progress bar if available
            const row = barEl.closest(".py-4");
            if (row) {
              const timelineBar = row.querySelector(
                ".absolute.top-0.h-full.bg-primary",
              );
              if (timelineBar) {
                timelineBar.style.width = "100%";
                timelineBar.classList.remove("bg-primary");
                timelineBar.classList.add("bg-green-500");
              }

              // Switch the nodes
              const nodes = row.querySelectorAll(
                ".flex-col.items-center.shrink-0",
              );
              nodes.forEach((node) => {
                const circle = node.querySelector(".rounded-full");
                if (circle) {
                  circle.classList.remove(
                    "bg-primary",
                    "border-primary",
                    "bg-white",
                    "border-gray-300",
                    "animate-pulse",
                  );
                  circle.classList.add("bg-green-500", "border-green-500");
                }
              });
            }
          }
        } else if (newProgress < 100 && oldProgress === 100) {
          // Revert if somehow demoted from 100
          if (barEl) {
            barEl.classList.add("bg-primary");
            barEl.classList.remove(
              "bg-green-500",
              "shadow-[0_0_12px_rgba(34,197,94,0.8)]",
            );
          }
          showToast("Project milestone status updated", "info");
        } else if (newProgress !== oldProgress) {
          showToast("Project milestone status updated", "info");
        }
      }
      closeMilestoneModal();
      updateMilestoneBadges();
      filterMilestones(); // Re-apply filter in case progress changed
    });
  }

  // ---- Milestone Filter Logic ----
  const milestoneFilter = document.getElementById("milestone-filter");
  const milestonesContainer = document.getElementById("milestones-container");

  function filterMilestones() {
    if (!milestoneFilter || !milestonesContainer) return;
    const filterVal = milestoneFilter.value;
    const rows = milestonesContainer.querySelectorAll(".py-4");

    rows.forEach((row) => {
      let showRow = true;
      if (filterVal === "urgent") {
        const isUrgent = row.querySelector(".js-status-badge[data-is-urgent='true']") !== null;
        showRow = isUrgent;
      } else if (filterVal === "in-progress") {
        const progressBtn = row.querySelector(".js-update-milestone-btn");
        if (progressBtn) {
          const progress = parseInt(progressBtn.getAttribute("data-progress"));
          showRow = progress < 100 && progress > 0;
        } else {
          showRow = false;
        }
      }

      if (showRow) {
        row.classList.remove("hidden");
      } else {
        row.classList.add("hidden");
      }
    });
  }

  if (milestoneFilter) {
    milestoneFilter.addEventListener("change", filterMilestones);
  }

  if (milestoneModalBackdrop) {
    milestoneModalBackdrop.addEventListener("click", (e) => {
      if (e.target === milestoneModalBackdrop) closeMilestoneModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      milestoneModalBackdrop &&
      !milestoneModalBackdrop.classList.contains("hidden")
    ) {
      closeMilestoneModal();
    }
  });

  // ---- Job Alerts Toggle Logic ----
  const jobAlertsToggle = document.getElementById("job-alerts-toggle");
  const jobAlertsModalBackdrop = document.getElementById("job-alerts-modal-backdrop");
  const jobAlertsModal = document.getElementById("job-alerts-modal");
  const cancelAlertBtn = document.getElementById("cancel-alert-btn");
  const saveAlertBtn = document.getElementById("save-alert-btn");
  let alertsConfigured = false;

  function openAlertsModal() {
    jobAlertsModalBackdrop.classList.remove("hidden");
    void jobAlertsModalBackdrop.offsetWidth;
    jobAlertsModalBackdrop.classList.remove("opacity-0");
    jobAlertsModalBackdrop.classList.add("opacity-100");
    jobAlertsModal.classList.remove("scale-95");
    jobAlertsModal.classList.add("scale-100");
  }

  function closeAlertsModal() {
    jobAlertsModalBackdrop.classList.remove("opacity-100");
    jobAlertsModalBackdrop.classList.add("opacity-0");
    jobAlertsModal.classList.remove("scale-100");
    jobAlertsModal.classList.add("scale-95");
    setTimeout(() => {
      jobAlertsModalBackdrop.classList.add("hidden");
    }, 300);
  }

  if (jobAlertsToggle) {
    jobAlertsToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (!alertsConfigured && jobAlertsModalBackdrop) {
          openAlertsModal();
        } else {
          showToast("Job Alerts enabled for current filters!", "success");
        }
      } else {
        showToast("Job Alerts disabled.", "info");
      }
    });
  }

  if (cancelAlertBtn) {
    cancelAlertBtn.addEventListener("click", () => {
      jobAlertsToggle.checked = false;
      closeAlertsModal();
    });
  }

  if (saveAlertBtn) {
    saveAlertBtn.addEventListener("click", () => {
      const emailInput = document.getElementById("alert-email");
      if(emailInput && !emailInput.value) {
          emailInput.focus();
          return;
      }
      alertsConfigured = true;
      closeAlertsModal();
      showToast("Job Alerts configured successfully!", "success");
    });
  }

  // ---- Chat Modal Logic ----
  const chatModalBackdrop = document.getElementById("chat-modal-backdrop");
  const chatModal = document.getElementById("chat-modal");
  const closeChatBtn = document.getElementById("close-chat-btn");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatInput = document.getElementById("chat-input");
  const chatContainer = document.getElementById("chat-messages-container");
  const modalMessageBtn = document.getElementById("modal-message-btn");

  function openChatModal() {
    // Set client name from the project modal
    const clientName =
      document.getElementById("modal-client").textContent || "Client";

    const chatClientNameEl = document.getElementById("chat-client-name");
    if (chatClientNameEl) {
      // "Client: PayFlow Startup" -> "PayFlow Startup"
      const name = clientName.startsWith("Client: ")
        ? clientName.replace("Client: ", "")
        : clientName;
      chatClientNameEl.textContent = name;
    }

    chatModalBackdrop.classList.remove("hidden");
    setTimeout(() => {
      chatModalBackdrop.classList.remove("opacity-0");
      chatModal.classList.remove("scale-95");
      chatModal.classList.add("scale-100");
      if (chatInput) chatInput.focus();
    }, 10);
  }

  function closeChatModal() {
    chatModalBackdrop.classList.add("opacity-0");
    chatModal.classList.remove("scale-100");
    chatModal.classList.add("scale-95");
    setTimeout(() => {
      chatModalBackdrop.classList.add("hidden");
      // reset messages
      if (chatContainer) chatContainer.innerHTML = "";
      if (chatInput) chatInput.value = "";
    }, 300);
  }

  if (modalMessageBtn) {
    modalMessageBtn.addEventListener("click", () => {
      // Open chat above the current modal without closing it completely usually,
      // but doing this z-index approach is fine
      openChatModal();
    });
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener("click", closeChatModal);
  }

  if (chatModalBackdrop) {
    chatModalBackdrop.addEventListener("click", (e) => {
      if (e.target === chatModalBackdrop) closeChatModal();
    });
  }

  function sendChatMessage() {
    if (!chatInput) return;
    const msg = chatInput.value.trim();
    if (!msg) return;

    // User message UI
    const msgDiv = document.createElement("div");
    msgDiv.className =
      "bg-primary text-white text-sm py-2 px-3 rounded-xl rounded-br-none self-end max-w-[85%] shadow-sm";
    msgDiv.textContent = msg;
    chatContainer.appendChild(msgDiv);
    chatInput.value = "";

    // Simulate reply after 1s
    setTimeout(() => {
      const replyDiv = document.createElement("div");
      replyDiv.className =
        "bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm py-2 px-3 rounded-xl rounded-bl-none self-start max-w-[85%] shadow-sm border border-gray-100 dark:border-slate-600";
      replyDiv.textContent =
        "Thanks for reaching out! I will check your profile and get back to you shortly.";
      chatContainer.appendChild(replyDiv);

      // Scroll to bottom
      chatContainer.parentElement.scrollTop =
        chatContainer.parentElement.scrollHeight;
    }, 1000);

    // Scroll to bottom immediately on send
    chatContainer.parentElement.scrollTop =
      chatContainer.parentElement.scrollHeight;
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendChatMessage();
    });
  }

  // ---- Deposit Logic ----
  const depositModalBackdrop = document.getElementById(
    "deposit-modal-backdrop",
  );
  const depositModal = document.getElementById("deposit-modal");
  const openDepositBtn = document.getElementById("open-deposit-modal-btn");
  const closeDepositBtn = document.getElementById("close-deposit-btn");
  const cancelDepositBtn = document.getElementById("cancel-deposit-btn");
  const confirmDepositBtn = document.getElementById("confirm-deposit-btn");
  const depositAmountInput = document.getElementById("deposit-amount-input");
  const availableBalanceEl = document.getElementById(
    "available-balance-amount",
  );

  // Payment Tabs Logic
  const tabMethodCard = document.getElementById("tab-method-card");
  const tabMethodCrypto = document.getElementById("tab-method-crypto");
  const contentCard = document.getElementById("method-content-card");
  const contentCrypto = document.getElementById("method-content-crypto");

  let currentPaymentMethod = "card"; // card or crypto

  if (tabMethodCard && tabMethodCrypto) {
    tabMethodCard.addEventListener("click", () => {
      currentPaymentMethod = "card";

      tabMethodCard.className =
        "flex-1 py-1.5 text-xs font-bold rounded-md bg-white dark:bg-slate-800 shadow-sm text-gray-900 dark:text-white transition-all";
      tabMethodCrypto.className =
        "flex-1 py-1.5 text-xs font-bold rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all flex items-center justify-center gap-1";

      contentCard.classList.remove("hidden");
      contentCrypto.classList.add("hidden");

      if (confirmDepositBtn && depositAmountInput) {
        const amount = parseFloat(depositAmountInput.value) || 0;
        confirmDepositBtn.textContent = `Pay $${amount.toLocaleString("en-US")} Securely`;
      }
    });

    tabMethodCrypto.addEventListener("click", () => {
      currentPaymentMethod = "crypto";

      tabMethodCrypto.className =
        "flex-1 py-1.5 text-xs font-bold rounded-md bg-white dark:bg-slate-800 shadow-sm text-gray-900 dark:text-white transition-all flex items-center justify-center gap-1";
      tabMethodCard.className =
        "flex-1 py-1.5 text-xs font-bold rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all";

      contentCrypto.classList.remove("hidden");
      contentCard.classList.add("hidden");

      if (confirmDepositBtn && depositAmountInput) {
        confirmDepositBtn.textContent = `Connect Wallet & Deposit`;
      }
    });
  }

  let currentBalance = 1250.0;

  function openDepositModal() {
    if (!depositModalBackdrop) return;
    depositModalBackdrop.classList.remove("hidden");
    // trigger reflow
    void depositModalBackdrop.offsetWidth;
    depositModalBackdrop.classList.remove("opacity-0");
    depositModalBackdrop.classList.add("opacity-100");
    depositModal.classList.remove("scale-95");
    depositModal.classList.add("scale-100");
    if (depositAmountInput) depositAmountInput.focus();
  }

  function closeDepositModal() {
    if (!depositModalBackdrop) return;
    depositModalBackdrop.classList.remove("opacity-100");
    depositModalBackdrop.classList.add("opacity-0");
    depositModal.classList.remove("scale-100");
    depositModal.classList.add("scale-95");
    setTimeout(() => {
      depositModalBackdrop.classList.add("hidden");
    }, 300);
  }

  if (openDepositBtn) {
    openDepositBtn.addEventListener("click", openDepositModal);
  }

  if (closeDepositBtn) {
    closeDepositBtn.addEventListener("click", closeDepositModal);
  }

  if (cancelDepositBtn) {
    cancelDepositBtn.addEventListener("click", closeDepositModal);
  }

  if (depositModalBackdrop) {
    depositModalBackdrop.addEventListener("click", (e) => {
      if (e.target === depositModalBackdrop) closeDepositModal();
    });
  }

  if (depositAmountInput && confirmDepositBtn) {
    const updateButtonText = () => {
      const amount = parseFloat(depositAmountInput.value) || 0;
      confirmDepositBtn.textContent = `Pay $${amount.toLocaleString("en-US")} Securely`;
    };

    depositAmountInput.addEventListener("input", updateButtonText);
    // Initial call to set correct text
    updateButtonText();
  }

  if (confirmDepositBtn) {
    confirmDepositBtn.addEventListener("click", () => {
      const amount = parseFloat(depositAmountInput.value);
      if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid amount", "info");
        return;
      }

      const originalText = confirmDepositBtn.textContent;
      confirmDepositBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      `;
      confirmDepositBtn.disabled = true;
      confirmDepositBtn.classList.add("opacity-75", "cursor-not-allowed");

      const onPaymentSuccess = () => {
        confirmDepositBtn.textContent = originalText;
        confirmDepositBtn.disabled = false;
        confirmDepositBtn.classList.remove("opacity-75", "cursor-not-allowed");

        currentBalance += amount;

        if (availableBalanceEl) {
          availableBalanceEl.textContent =
            "$" +
            currentBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          availableBalanceEl.classList.add("text-green-500", "scale-105");
          setTimeout(
            () =>
              availableBalanceEl.classList.remove(
                "text-green-500",
                "scale-105",
              ),
            500,
          );
        }

        const msg =
          currentPaymentMethod === "crypto"
            ? `Successfully deposited $${amount.toLocaleString("en-US")} via Web3 Wallet`
            : `Successfully charged $${amount.toLocaleString("en-US")} to card`;
        showToast(msg, "success");
        closeDepositModal();

        if (amount >= 500 && typeof confetti !== "undefined") {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#34d399", "#fbbf24"],
          });
        }
      };

      if (currentPaymentMethod === "crypto") {
        confirmDepositBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Awaiting Wallet Approval...
        `;
        setTimeout(onPaymentSuccess, 2000); // Mock Web3 wallet delay
      } else {
        // Make request to backend Stripe API
        fetch("/api/deposit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("API request failed");
            return res.json();
          })
          .then((data) => {
            if (data.success) {
              onPaymentSuccess();
            } else {
              confirmDepositBtn.textContent = originalText;
              confirmDepositBtn.disabled = false;
              confirmDepositBtn.classList.remove(
                "opacity-75",
                "cursor-not-allowed",
              );
              showToast(data.error || "Payment failed", "error");
            }
          })
          .catch((err) => {
            console.error("Payment error:", err);
            confirmDepositBtn.textContent = originalText;
            confirmDepositBtn.disabled = false;
            confirmDepositBtn.classList.remove(
              "opacity-75",
              "cursor-not-allowed",
            );
            showToast("Failed to process payment. Please try again.", "error");
          });
      }
    });
  }

  // ---- Project Modal Tabs Logic ----
  const tabs = [
    {
      button: document.getElementById("tab-details"),
      content: document.getElementById("content-details"),
      isFlex: false,
    },
    {
      button: document.getElementById("tab-chat"),
      content: document.getElementById("content-chat"),
      isFlex: true,
    },
    {
      button: document.getElementById("tab-collaborators"),
      content: document.getElementById("content-collaborators"),
      isFlex: false,
    },
  ];

  const teamChatForm = document.getElementById("team-chat-form");
  const teamChatInput = document.getElementById("team-chat-input");
  const chatMessagesContainer = document.getElementById(
    "chat-messages-container",
  );

  tabs.forEach((tab) => {
    if (tab.button && tab.content) {
      tab.button.addEventListener("click", () => {
        tabs.forEach((t) => {
          if (t.button && t.content) {
            if (t === tab) {
              t.button.classList.add("border-primary", "text-primary");
              t.button.classList.remove(
                "border-transparent",
                "text-gray-500",
                "hover:text-gray-700",
                "dark:hover:text-gray-300",
              );
              t.content.classList.remove("hidden");
              if (t.isFlex) t.content.classList.add("flex");

              if (t.button.id === "tab-chat") {
                const chatMessagesContainer = document.getElementById(
                  "chat-messages-container",
                );
                if (chatMessagesContainer) {
                  chatMessagesContainer.scrollTop =
                    chatMessagesContainer.scrollHeight;
                }
              }
            } else {
              t.button.classList.remove("border-primary", "text-primary");
              t.button.classList.add(
                "border-transparent",
                "text-gray-500",
                "hover:text-gray-700",
                "dark:hover:text-gray-300",
              );
              t.content.classList.add("hidden");
              if (t.isFlex) t.content.classList.remove("flex");
            }
          }
        });
      });
    }
  });

  if (teamChatForm) {
    teamChatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = teamChatInput.value.trim();
      if (!message) return;

      const timeString = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const messageHTML = `
          <div class="flex flex-col space-y-1 items-end animate-fade-in-up">
            <div class="flex items-end gap-2 shrink-0 flex-row-reverse">
              <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                ME
              </div>
              <div class="bg-primary text-white p-3 rounded-2xl rounded-br-sm shadow-sm max-w-[85%] text-sm">
                <p class="font-bold text-xs text-primary-200 mb-1">You</p>
                ${message}
              </div>
            </div>
            <span class="text-[10px] text-gray-400 mr-10">${timeString}</span>
          </div>
        `;

      chatMessagesContainer.insertAdjacentHTML("beforeend", messageHTML);
      teamChatInput.value = "";
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    });
  }

  // Voice Input Logic
  const voiceInputBtn = document.getElementById("voice-input-btn");
  if (voiceInputBtn && teamChatInput) {
    let isRecording = false;
    let recognition = null;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        isRecording = true;
        voiceInputBtn.classList.add("text-primary", "animate-pulse");
        voiceInputBtn.classList.remove("text-gray-500", "dark:text-gray-400");
        teamChatInput.placeholder = "Listening...";
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          teamChatInput.value = (teamChatInput.value + " " + finalTranscript).trim();
        }
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        stopRecording();
        showToast("Voice input error: " + event.error, "error");
      };
      
      recognition.onend = () => {
        stopRecording();
      };
    } else {
      voiceInputBtn.addEventListener("click", () => {
        showToast("Voice input is not supported in this browser.", "error");
      });
    }

    function stopRecording() {
      if (isRecording && recognition) {
         try { recognition.stop(); } catch (e) {}
      }
      isRecording = false;
      voiceInputBtn.classList.remove("text-primary", "animate-pulse");
      voiceInputBtn.classList.add("text-gray-500", "dark:text-gray-400");
      teamChatInput.placeholder = "Type a message...";
    }

    if (recognition) {
        voiceInputBtn.addEventListener("click", () => {
          if (isRecording) {
            stopRecording();
          } else {
            try {
              recognition.start();
            } catch (e) {
              console.error(e);
            }
          }
        });
    }
  }

  // Keyboard accessibility for modals
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      chatModalBackdrop &&
      !chatModalBackdrop.classList.contains("hidden")
    ) {
      closeChatModal();
    }

    if (
      e.key === "Escape" &&
      depositModalBackdrop &&
      !depositModalBackdrop.classList.contains("hidden")
    ) {
      closeDepositModal();
    }
  });

  // ---- Download Report Logic ----
  const downloadReportBtn = document.getElementById("download-report-btn");
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", () => {
      const activeProjectsCount = document.querySelectorAll(
        ".js-project-card:not(.hidden)",
      ).length;
      const reportContent = `FREELANCE DASHBOARD SUMMARY REPORT
==================================
Date: ${new Date().toLocaleDateString()}

Total Budget Active: $2,000.00
Work in Progress: $3,400.00
Total Earnings: $14,200.00
Active Projects: ${activeProjectsCount}

Recent Milestones:
- FinTech MVP Dashboard: 65% (Urgent)
- Landing Page Redesign: 100% (Completed)

End of Report`;

      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Dashboard_Summary_Report.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Report download started", "success");
    });
  }

  // ---- D3 Earnings Trend Chart ----
  function renderEarningsChart() {
    const container = document.getElementById("earnings-chart-container");
    if (!container) return;

    // Clear previous
    container.innerHTML = "";

    const data = [
      { month: "Jan", earnings: 1200 },
      { month: "Feb", earnings: 1800 },
      { month: "Mar", earnings: 1500 },
      { month: "Apr", earnings: 2400 },
      { month: "May", earnings: 2100 },
      { month: "Jun", earnings: 3400 },
    ];

    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3
      .select("#earnings-chart-container")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Create scales
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.earnings)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const isDark = document.documentElement.classList.contains("dark");
    const axisColor = isDark ? "#64748b" : "#94a3b8"; // slate-500 : slate-400
    const lineColor = "#4f46e5"; // indigo-600

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").attr("stroke", axisColor))
      .call((g) => g.selectAll(".tick line").attr("stroke", axisColor))
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", axisColor)
          .attr("font-family", "Inter"),
      );

    // Y Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => "$" + d),
      )
      .call((g) => g.select(".domain").remove()) // remove y line
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", axisColor)
          .attr("opacity", 0.3)
          .attr("x2", width - margin.left - margin.right),
      ) // grid lines
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", axisColor)
          .attr("font-family", "Inter"),
      );

    // Line generator
    const line = d3
      .line()
      .x((d) => x(d.month))
      .y((d) => y(d.earnings))
      .curve(d3.curveMonotoneX);

    // Add the line path
    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 3)
      .attr("d", line);

    // Line animation
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Add dots
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.month))
      .attr("cy", (d) => y(d.earnings))
      .attr("r", 4)
      .attr("fill", lineColor)
      .attr("stroke", isDark ? "#1e293b" : "#ffffff")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .delay(1500)
      .duration(500)
      .style("opacity", 1);
  }

  // Render chart initially if dashboard is active
  if (!document.getElementById("view-dashboard").classList.contains("hidden")) {
    renderEarningsChart();
  }

  // Handle resizing for chart
  window.addEventListener("resize", () => {
    if (
      !document.getElementById("view-dashboard").classList.contains("hidden")
    ) {
      renderEarningsChart();
    }
  });

  // Hook into navigation to render chart when tab switches
  const navDashboardBtn = document.querySelectorAll(
    '[data-target="view-dashboard"]',
  );
  navDashboardBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(renderEarningsChart, 50); // small delay to let display:block apply
    });
  });

  // ---- AI Matchmaker Logic ----
  const aiMatchmakerBtn = document.getElementById("ai-matchmaker-btn");
  const aiModalBackdrop = document.getElementById("ai-modal-backdrop");
  const aiModal = document.getElementById("ai-modal");
  const closeAiModalBtn = document.getElementById("close-ai-modal-btn");
  const aiStartScanBtn = document.getElementById("ai-start-scan-btn");
  const aiScanBar = document.getElementById("ai-scan-bar");
  const aiScanPct = document.getElementById("ai-scan-pct");
  const aiResultsUi = document.getElementById("ai-results-ui");

  if (aiMatchmakerBtn && aiModalBackdrop) {
    const openAiModal = () => {
      aiModalBackdrop.classList.remove("hidden");
      void aiModalBackdrop.offsetWidth;
      aiModalBackdrop.classList.remove("opacity-0");
      aiModalBackdrop.classList.add("opacity-100");
      aiModal.classList.remove("scale-95");
      aiModal.classList.add("scale-100");

      // Reset state
      if (aiScanBar) aiScanBar.style.width = "0%";
      if (aiScanPct) aiScanPct.textContent = "0%";
      if (aiResultsUi) aiResultsUi.classList.add("hidden");
      if (aiStartScanBtn) {
        aiStartScanBtn.disabled = false;
        aiStartScanBtn.textContent = "Start Neural Scan";
        aiStartScanBtn.className =
          "w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity";
      }
    };

    const closeAiModal = () => {
      aiModalBackdrop.classList.remove("opacity-100");
      aiModalBackdrop.classList.add("opacity-0");
      aiModal.classList.remove("scale-100");
      aiModal.classList.add("scale-95");
      setTimeout(() => {
        aiModalBackdrop.classList.add("hidden");
      }, 300);
    };

    aiMatchmakerBtn.addEventListener("click", openAiModal);
    if (closeAiModalBtn)
      closeAiModalBtn.addEventListener("click", closeAiModal);

    aiModalBackdrop.addEventListener("click", (e) => {
      if (e.target === aiModalBackdrop) closeAiModal();
    });

    if (aiStartScanBtn) {
      aiStartScanBtn.addEventListener("click", () => {
        aiStartScanBtn.disabled = true;
        aiStartScanBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analyzing Data points...
        `;

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 5;
          if (progress > 100) progress = 100;

          if (aiScanBar) aiScanBar.style.width = `${progress}%`;
          if (aiScanPct) aiScanPct.textContent = `${progress}%`;

          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              aiStartScanBtn.textContent = "Scan Complete";
              aiStartScanBtn.className =
                "w-full bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all";
              if (aiResultsUi) aiResultsUi.classList.remove("hidden");

              if (typeof confetti !== "undefined") {
                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { y: 0.5 },
                  colors: ["#a855f7", "#6366f1"], // purple, indigo
                });
              }
            }, 500);
          }
        }, 300);
      });
    }
  }

  // ---- Export to CSV Logic ----
  const exportCsvBtn = document.getElementById("export-csv-btn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const visibleCards = Array.from(document.querySelectorAll(".js-project-card:not(.hidden)"));
      
      if (visibleCards.length === 0) {
        showToast("No projects available to export.", "info");
        return;
      }

      const headers = ["Title", "Category", "Type", "Budget", "Skills", "Applied", "Saved"];
      const csvRows = [headers.join(",")];

      visibleCards.forEach(card => {
        const title = (card.getAttribute("data-title") || "").replace(/"/g, '""');
        const category = (card.getAttribute("data-category") || "").replace(/"/g, '""');
        const type = (card.getAttribute("data-type") || "").replace(/"/g, '""');
        const budget = (card.getAttribute("data-budget") || "").replace(/"/g, '""');
        const skills = (card.getAttribute("data-skills") || "").replace(/"/g, '""');
        const isApplied = card.getAttribute("data-applied") === "true" ? "Yes" : "No";
        const isSaved = card.getAttribute("data-saved") === "true" ? "Yes" : "No";

        const row = [
          `"${title}"`,
          `"${category}"`,
          `"${type}"`,
          `"${budget}"`,
          `"${skills}"`,
          `"${isApplied}"`,
          `"${isSaved}"`
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `filtered_projects_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`Exported ${visibleCards.length} projects to CSV.`, "success");
    });
  }

  // ---- AI Cover Letter Logic ----
  const coverLetterModal = document.getElementById("ai-cover-letter-modal");
  const aiLoadingState = document.getElementById("ai-loading-state");
  const aiResultState = document.getElementById("ai-result-state");
  const aiTextarea = document.getElementById("ai-cover-letter-textarea");
  const closeAiModalBtns = document.querySelectorAll(".js-close-ai-modal");
  const copyAiBtn = document.getElementById("copy-ai-cover-letter");
  
  if (coverLetterModal) {
    const aiBidBtns = document.querySelectorAll(".js-ai-bid-btn");
    let currentGeneratingCard = null;
    
    closeAiModalBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        coverLetterModal.classList.add("hidden");
        coverLetterModal.classList.remove("flex");
      });
    });

    copyAiBtn.addEventListener("click", () => {
      aiTextarea.select();
      document.execCommand("copy");
      showToast("Proposal copied to clipboard!", "success");
      coverLetterModal.classList.add("hidden");
      coverLetterModal.classList.remove("flex");
    });
    
    const generateProposal = async (card, tone = "Professional") => {
      const projectDescEl = card.querySelector(".js-project-desc");
      const projectDesc = projectDescEl ? projectDescEl.textContent.trim() : card.getAttribute("data-desc");

      const profileSkillsInput = document.getElementById("profile-skills-input");
      const userMatchedSkillsStr = profileSkillsInput ? profileSkillsInput.value : "React.js, Node.js, Frontend";
      
      // Open modal if not already
      coverLetterModal.classList.remove("hidden");
      coverLetterModal.classList.add("flex");
      
      // Show loading state
      aiLoadingState.classList.remove("hidden");
      aiLoadingState.classList.add("flex");
      aiResultState.classList.add("hidden");
      aiResultState.classList.remove("flex");
      aiTextarea.value = "";

      try {
        const response = await fetch("/api/generate-cover-letter", {
          method: "POST",
          headers: {
             "Content-Type": "application/json"
          },
          body: JSON.stringify({
             projectDescription: projectDesc,
             userSkills: userMatchedSkillsStr,
             tone
          })
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to generate proposal");
        }

        if (data.simulated) {
           console.log("Returned simulated cover letter (no API key)");
        }

        aiTextarea.value = data.coverLetter;
        
        // Switch to result state
        aiLoadingState.classList.add("hidden");
        aiLoadingState.classList.remove("flex");
        aiResultState.classList.remove("hidden");
        aiResultState.classList.add("flex");
        
      } catch (error) {
        console.error("AI Error:", error);
        showToast("Could not generate AI proposal: " + error.message, "error");
        coverLetterModal.classList.add("hidden");
        coverLetterModal.classList.remove("flex");
      }
    };

    aiBidBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest(".js-project-card");
        if (!card) return;
        currentGeneratingCard = card;
        
        const toneSelect = document.getElementById("ai-tone-select");
        const tone = toneSelect ? toneSelect.value : "Professional";

        await generateProposal(card, tone);
      });
    });
    
    const regenerateBtn = document.getElementById("regenerate-proposal-btn");
    const toneSelect = document.getElementById("ai-tone-select");
    
    if (regenerateBtn) {
      regenerateBtn.addEventListener("click", async () => {
        if (!currentGeneratingCard) return;
        const tone = toneSelect ? toneSelect.value : "Professional";
        await generateProposal(currentGeneratingCard, tone);
      });
    }
  }

  // File upload logic handled by React in documents.jsx

  // Show More Feature Logic
  const showMoreBtns = document.querySelectorAll('.js-show-more-btn');
  showMoreBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const descPara = btn.parentElement.querySelector('.js-project-desc');
      if (descPara) {
        if (descPara.classList.contains('line-clamp-2')) {
          descPara.classList.remove('line-clamp-2');
          btn.textContent = 'Show less';
        } else {
          descPara.classList.add('line-clamp-2');
          btn.textContent = 'Show more';
        }
      }
    });
  });

  // Load More Projects Logic
  const loadMoreBtn = document.getElementById("load-more-projects-btn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      const spinner = document.getElementById("load-more-spinner");
      // Show spinner, disable button
      spinner.classList.remove("hidden");
      loadMoreBtn.disabled = true;
      loadMoreBtn.classList.add("opacity-75", "cursor-wait");

      // Simulate network request
      setTimeout(() => {
        // Hide spinner, enable button
        spinner.classList.add("hidden");
        loadMoreBtn.disabled = false;
        loadMoreBtn.classList.remove("opacity-75", "cursor-wait");

        // Clone and append projects
        const projectList = document.getElementById("available-projects-list");
        if (projectList) {
          const cards = projectList.querySelectorAll('.js-project-card:not(.hidden)');
          if (cards.length > 0) {
            // we will just clone the first 2 visible cards for demonstration
            for (let i = 0; i < Math.min(2, cards.length); i++) {
              const clone = cards[i].cloneNode(true);
              
              // Reset any animation states on the clone
              clone.classList.remove("opacity-100", "translate-y-0");
              clone.classList.add("opacity-0", "translate-y-4");
              // also remove the perfect match styling if it was cloned
              clone.classList.remove("border-emerald-500", "dark:border-emerald-500", "ring-2", "ring-emerald-500", "ring-opacity-50", "shadow-lg", "shadow-emerald-500/20", "scale-[1.02]", "-translate-y-1", "bg-emerald-50/50", "dark:bg-emerald-900/10");
              const oldBadge = clone.querySelector(".perfect-match-badge");
              if (oldBadge) oldBadge.remove();

              // maybe add a slight badge or change to show it's "new" 
              const titleEl = clone.querySelector('h3');
              if (titleEl) {
                // Change data-title so save functionality doesn't clash completely, or just append inside text
                const newTitle = titleEl.textContent + ' (New)';
                titleEl.textContent = newTitle;
                clone.setAttribute('data-title', newTitle);
              }
              
              // Bind card logic for new clone (apply, save, modal)
              setupCard(clone);
              
              projectList.appendChild(clone);
              
              // Observe the new clone for scroll animation
              if (window.projectCardObserver) {
                window.projectCardObserver.observe(clone);
              } else {
                // Fallback if observer isn't ready
                requestAnimationFrame(() => {
                  clone.classList.remove("opacity-0", "translate-y-4");
                  clone.classList.add("opacity-100", "translate-y-0", "transition-all", "duration-500", "ease-out");
                });
              }
            }
            showToast("Fetched 2 new projects from the server.", "success");
          }
        }
      }, 1000);
    });
  }

  // Profile Skills Auto-Matcher
  const scanSkillsBtn = document.getElementById("scan-skills-btn");
  const profileSkillsInput = document.getElementById("profile-skills-input");

  if (scanSkillsBtn && profileSkillsInput) {
    scanSkillsBtn.addEventListener("click", () => {
      const userSkills = profileSkillsInput.value
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      if (userSkills.length === 0) {
        if (typeof showToast === "function") {
          showToast("Please enter some skills to scan for matches.", "error");
        } else {
          alert("Please enter some skills to scan for matches.");
        }
        return;
      }

      // Simulate a small scanning delay
      scanSkillsBtn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Scanning...`;
      scanSkillsBtn.disabled = true;

      setTimeout(() => {
        scanSkillsBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Scan Match`;
        scanSkillsBtn.disabled = false;

        const projectList = document.getElementById("available-projects-list");
        if (!projectList) return;

        const projectCards = Array.from(projectList.querySelectorAll(".js-project-card"));
        let matchCount = 0;
        
        let headerRow = projectList.firstElementChild; // The header div with "Recommended Projects"

        projectCards.forEach(card => {
          // Reset previous match states
          const oldBadge = card.querySelector(".perfect-match-badge");
          if (oldBadge) {
            oldBadge.remove();
          }
          // Reset styles
          card.classList.remove("border-emerald-500", "dark:border-emerald-500", "ring-2", "ring-emerald-500", "ring-opacity-50", "shadow-lg", "shadow-emerald-500/20", "scale-[1.02]", "-translate-y-1", "bg-emerald-50/50", "dark:bg-emerald-900/10");

          const projectSkillsStr = card.getAttribute("data-skills") || "";
          const projectSkills = projectSkillsStr.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

          if (projectSkills.length === 0) return;

          const matchedSkills = projectSkills.filter(s => userSkills.includes(s));
          const matchRatio = matchedSkills.length / projectSkills.length;

          const isPerfectMatch = matchedSkills.length > 0 && matchRatio >= 0.51;

          if (isPerfectMatch) {
            matchCount++;
            card.classList.add("border-emerald-500", "dark:border-emerald-500", "ring-2", "ring-emerald-500", "ring-opacity-50", "shadow-lg", "shadow-emerald-500/20", "scale-[1.02]", "transition-all", "duration-300", "-translate-y-1", "bg-emerald-50/50", "dark:bg-emerald-900/10");
            
            // Add a badge at the top right of the card
            const badge = document.createElement("div");
            badge.className = "perfect-match-badge absolute -top-3 -right-3 z-10 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-white dark:border-slate-800 animate-bounce";
            badge.innerHTML = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Perfect Match`;
            
            card.style.position = "relative";
            card.appendChild(badge);

            // Move this card to the top (right after the header row)
            projectList.insertBefore(card, headerRow.nextSibling);
          }
        });

        if (typeof showToast === "function") {
          if (matchCount > 0) {
            showToast(`Found ${matchCount} Perfect Matches based on your skills!`, "success");
          } else {
            showToast("No perfect matches found. Try adding more skills.", "info");
          }
        } else {
          alert(`Found ${matchCount} Perfect Matches!`);
        }
      }, 800);
    });
  }

  // ---- Shop Logic ----
  let shopBalance = 250;
  const desktopBalanceDisplay = document.getElementById("shop-balance");
  const mobileBalanceDisplay = document.getElementById("shop-balance-mobile");
  const buyButtons = document.querySelectorAll(".buy-btn");

  function updateShopBalance() {
    if (desktopBalanceDisplay) desktopBalanceDisplay.textContent = shopBalance + " COINS";
    if (mobileBalanceDisplay) mobileBalanceDisplay.textContent = shopBalance;

    if (desktopBalanceDisplay) {
      desktopBalanceDisplay.parentElement.classList.add("scale-110", "transition-transform");
      setTimeout(
        () => desktopBalanceDisplay.parentElement.classList.remove("scale-110"),
        200
      );
    }
  }

  buyButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cost = parseInt(btn.dataset.cost);
      const itemName = btn.dataset.item;

      if (shopBalance >= cost) {
        const origHtml = btn.innerHTML;
        btn.innerHTML = `<svg class="w-5 h-5 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
        btn.disabled = true;

        setTimeout(() => {
          shopBalance -= cost;
          updateShopBalance();
          if (typeof showToast === "function") {
            showToast(`Purchased ${itemName}!`, "success");
          }

          btn.innerHTML = `<span class="text-green-600 dark:text-green-400 flex items-center justify-center gap-1"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Purchased</span>`;

          setTimeout(() => {
            btn.innerHTML = origHtml;
            btn.disabled = false;
          }, 2000);
        }, 800);
      } else {
        if (typeof showToast === "function") {
          showToast("Insufficient Funds: You do not have enough coins.", "error");
        }

        btn.classList.add("translate-x-[-4px]", "transition-transform");
        setTimeout(() => btn.classList.replace("translate-x-[-4px]", "translate-x-[4px]"), 100);
        setTimeout(() => btn.classList.replace("translate-x-[4px]", "translate-x-[-4px]"), 200);
        setTimeout(() => btn.classList.replace("translate-x-[-4px]", "translate-x-[4px]"), 300);
        setTimeout(() => btn.classList.remove("translate-x-[4px]"), 400);
      }
    });
  });
});
