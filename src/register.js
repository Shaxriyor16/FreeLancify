document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1;
  const maxSteps = 5;

  const form = document.getElementById("register-form");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const stepIndicator = document.getElementById("current-step-indicator");
  const stepTitle = document.getElementById("step-title");
  const stepDesc = document.getElementById("step-desc");

  const i18n = {
    en: {
      stepWord: "Step",
      ofWord: "of",
      nextBtn: "Continue",
      prevBtn: "Back",
      submitBtn: "Complete Registration",
      steps: {
        1: {
          title: "Select your Role",
          desc: "Are you joining as a Freelancer or looking to hire as a Client?",
        },
        2: {
          title: "Personal Information",
          desc: "Let's get your basic details and location sorted.",
        },
        3: {
          title: "Email Verification",
          desc: "We have sent a 6-digit code to your email. Please enter it below.",
        },
        4: {
          title: "Identity Verification",
          desc: "Comply with global KYC regulations. Upload your documents securely.",
        },
        5: {
          title: "Professional & Security",
          desc: "Set up your profile identity and secure your account credentials.",
        },
      },
    },
    uz: {
      stepWord: "Qadam",
      ofWord: "/",
      nextBtn: "Davom etish",
      prevBtn: "Orqaga",
      submitBtn: "Ro'yxatdan o'tishni yakunlash",
      steps: {
        1: {
          title: "Rolingizni tanlang",
          desc: "Siz Frilanser sifatida qo'shilyapsizmi yoki Mijoz sifatidami?",
        },
        2: {
          title: "Shaxsiy ma'lumotlar",
          desc: "Sizning asosiy ma'lumotlaringiz va joylashuvingiz.",
        },
        3: {
          title: "Pochta tasdiqlash",
          desc: "Pochtangizga 6 xonali kod yubordik. Pastga kiriting.",
        },
        4: {
          title: "Shaxsni tasdiqlash",
          desc: "Global KYC qoidalariga rioya qiling. Hujjatlaringizni xavfsiz yuklang.",
        },
        5: {
          title: "Kasb va Xavfsizlik",
          desc: "Profilingizni va akkaunt xavfsizligini sozlang.",
        },
      },
    },
    ru: {
      stepWord: "Шаг",
      ofWord: "из",
      nextBtn: "Продолжить",
      prevBtn: "Назад",
      submitBtn: "Завершить регистрацию",
      steps: {
        1: {
          title: "Выберите вашу роль",
          desc: "Вы присоединяетесь как фрилансер или как клиент?",
        },
        2: {
          title: "Личная информация",
          desc: "Давайте укажем ваши основные данные и местоположение.",
        },
        3: {
          title: "Подтверждение почты",
          desc: "Мы отправили 6-значный код на вашу почту. Введите его ниже.",
        },
        4: {
          title: "Подтверждение личности",
          desc: "Соблюдайте глобальные правила KYC. Безопасно загрузите документы.",
        },
        5: {
          title: "Профиль и безопасность",
          desc: "Настройте профиль и обеспечьте безопасность аккаунта.",
        },
      },
    },
  };

  let currentLang = "en";
  const langSwitcher = document.getElementById("lang-switcher");
  const stepWordEl = document.getElementById("step-word");
  const ofWordEl = document.getElementById("of-word");

  if (langSwitcher) {
    langSwitcher.addEventListener("change", (e) => {
      currentLang = e.target.value;
      updateStepUI();
    });
  }

  const stepInfo = i18n[currentLang].steps;

  const countrySelect = document.getElementById("country");
  const citySelect = document.getElementById("city");
  const countryLoader = document.getElementById("country-loader");
  const docLabelNumber = document.getElementById("doc-label-number");
  const docHint = document.getElementById("doc-hint");
  const docLabelUpload = document.getElementById("doc-label-upload");
  const passportNumber = document.getElementById("passport-number");

  let locationsData = [];
  let phoneCodesData = [];

  // Fetch world countries and cities
  if (countrySelect && citySelect) {
    Promise.all([
      fetch("https://countriesnow.space/api/v0.1/countries").then((res) =>
        res.json(),
      ),
      fetch("https://countriesnow.space/api/v0.1/countries/codes").then((res) =>
        res.json(),
      ),
    ])
      .then(([data, codesRes]) => {
        if (!data.error) {
          locationsData = data.data;
          if (!codesRes.error) {
            phoneCodesData = codesRes.data;
          }

          // Sort locations alphabetically
          locationsData.sort((a, b) => a.country.localeCompare(b.country));

          let optionsHtml =
            '<option value="" disabled selected>Select Country</option>';
          locationsData.forEach((loc) => {
            optionsHtml += `<option value="${loc.country}">${loc.country}</option>`;
          });

          countrySelect.innerHTML = optionsHtml;
          countrySelect.disabled = false;
          if (countryLoader) countryLoader.remove();
        }
      })
      .catch((err) => {
        console.error("Failed to load countries", err);
        countrySelect.innerHTML =
          '<option value="">Error loading countries</option>';
        if (countryLoader) countryLoader.remove();
      });

    countrySelect.addEventListener("change", (e) => {
      const selectedCountryName = e.target.value;

      // Update cities
      const countryData = locationsData.find(
        (c) => c.country === selectedCountryName,
      );
      if (countryData && countryData.cities.length > 0) {
        let cityOptionsHtml =
          '<option value="" disabled selected>Select City</option>';
        // Sort cities alphabetically
        countryData.cities.sort().forEach((city) => {
          cityOptionsHtml += `<option value="${city}">${city}</option>`;
        });
        citySelect.innerHTML = cityOptionsHtml;
        citySelect.disabled = false;
      } else {
        citySelect.innerHTML =
          '<option value="" disabled selected>No cities available</option>';
        citySelect.disabled = true;
      }

      // Update Phone Prefix
      const phonePrefixEl = document.getElementById("phone-prefix");
      const phoneInput = document.getElementById("phone");
      const codeMatch = phoneCodesData.find(
        (c) => c.name === selectedCountryName,
      );
      if (codeMatch && phonePrefixEl && phoneInput) {
        phonePrefixEl.textContent = codeMatch.dial_code;
        phonePrefixEl.classList.remove("opacity-50");
        phonePrefixEl.classList.add("text-gray-900", "dark:text-white");
        phoneInput.disabled = false;
        phoneInput.placeholder = "00 000 00 00";
        phoneInput.value = "";
      } else if (phoneInput && phonePrefixEl) {
        phonePrefixEl.textContent = "-";
        phonePrefixEl.classList.add("opacity-50");
        phonePrefixEl.classList.remove("text-gray-900", "dark:text-white");
        phoneInput.disabled = true;
        phoneInput.placeholder = "Select country first";
      }

      // Update Document Labels
      if (selectedCountryName === "Uzbekistan") {
        if (docLabelNumber) docLabelNumber.textContent = "JSHSHIR (PINFL)";
        if (docHint)
          docHint.textContent =
            "14 xonali raqam (O'zbekiston fuqarolari uchun)";
        if (docLabelUpload)
          docLabelUpload.textContent =
            "O'zbekiston fuqarolik pasporti yoki ID-karta (Old qismi)";
        if (passportNumber) passportNumber.placeholder = "e.g. 31234567890123";
      } else if (selectedCountryName === "United States") {
        if (docLabelNumber)
          docLabelNumber.textContent = "Social Security Number (SSN)";
        if (docHint) docHint.textContent = "Standard 9-digit SSN";
        if (docLabelUpload)
          docLabelUpload.textContent =
            "Upload Driver's License or Passport (Front)";
        if (passportNumber) passportNumber.placeholder = "XXX-XX-XXXX";
      } else {
        if (docLabelNumber)
          docLabelNumber.textContent = "Passport / National ID Number";
        if (docHint) docHint.textContent = "Standard Government-issued ID";
        if (docLabelUpload)
          docLabelUpload.textContent = "Upload Front of Document";
        if (passportNumber) passportNumber.placeholder = "e.g. AB1234567";
      }
    });
  }

  function updateStepUI() {
    const texts = i18n[currentLang];
    const stepsData = texts.steps;

    stepIndicator.textContent = currentStep;
    stepTitle.textContent = stepsData[currentStep].title;
    stepDesc.textContent = stepsData[currentStep].desc;

    if (stepWordEl) stepWordEl.textContent = texts.stepWord;
    if (ofWordEl) ofWordEl.textContent = texts.ofWord;

    if (nextBtn) nextBtn.textContent = texts.nextBtn;
    if (prevBtn) prevBtn.textContent = texts.prevBtn;
    if (submitBtn) {
      // if we are encrypting logic changes innerHTML, we should only set textContent if we are not loading.
      if (!submitBtn.disabled) submitBtn.textContent = texts.submitBtn;
    }

    // Update progress bars
    for (let i = 1; i <= maxSteps; i++) {
      const bar = document.getElementById(`progress-${i}`);
      if (bar) {
        if (i <= currentStep) {
          bar.classList.replace("bg-gray-200", "bg-primary");
          bar.classList.replace("dark:bg-slate-700", "bg-primary");
        } else {
          bar.classList.replace("bg-primary", "bg-gray-200");
          bar.classList.add("dark:bg-slate-700");
        }
      }
    }

    // Toggle content visibility
    for (let i = 1; i <= maxSteps; i++) {
      const content = document.getElementById(`step-${i}-content`);
      if (content) {
        if (i === currentStep) {
          content.classList.remove("hidden");
          setTimeout(() => {
            content.classList.remove("opacity-0");
          }, 10);
        } else {
          content.classList.add("hidden", "opacity-0");
        }
      }
    }

    if (currentStep === 1) {
      prevBtn.classList.add("hidden");
    } else {
      prevBtn.classList.remove("hidden");
    }

    if (currentStep === maxSteps) {
      nextBtn.classList.add("hidden");
      submitBtn.classList.remove("hidden");
    } else {
      nextBtn.classList.remove("hidden");
      submitBtn.classList.add("hidden");
    }
  }

  // init step
  updateStepUI();

  function validateStep() {
    const currentContent = document.getElementById(
      `step-${currentStep}-content`,
    );
    if (!currentContent) return true;

    const requiredInputs = currentContent.querySelectorAll(
      "input:not([type=hidden]):not([type=file]):not([type=radio]), select",
    );

    let isValid = true;

    if (currentStep === 2) {
      requiredInputs.forEach((input) => {
        if (!input.value) {
          input.classList.add("border-red-500", "dark:border-red-500");
          isValid = false;
        } else {
          input.classList.remove("border-red-500", "dark:border-red-500");
        }
      });
      
      if (isValid) {
        const regEmail = document.getElementById("reg-email");
        const displayRegEmail = document.getElementById("display-reg-email");
        if (regEmail && displayRegEmail) {
          displayRegEmail.textContent = regEmail.value;
        }
      }
    }

    if (currentStep === 3) {
      const codeInputs = currentContent.querySelectorAll("input");
      let codeValid = true;
      codeInputs.forEach((input) => {
        if (!input.value) {
          input.classList.add("border-red-500", "dark:border-red-500");
          codeValid = false;
        } else {
          input.classList.remove("border-red-500", "dark:border-red-500");
        }
      });
      if (!codeValid) isValid = false;
    }

    if (currentStep === 4) {
      if (!passportNumber.value) {
        passportNumber.classList.add("border-red-500", "dark:border-red-500");
        isValid = false;
      } else {
        const val = passportNumber.value.trim().toUpperCase();
        let docValid = false;
        const country = countrySelect ? countrySelect.value : "";

        // Define some popular country formats, fallback to generic
        const regexes = {
          Uzbekistan: /^(?:[A-Z]{2}[0-9]{7}|[0-9]{14})$/,
          "United States": /^(?:[0-9]{9}|[0-9]{3}-[0-9]{2}-[0-9]{4})$/,
          "United Kingdom": /^[0-9]{9}$/,
          default: /^[A-Z0-9-]{5,20}$/,
        };

        let activeRegex = regexes[country] || regexes["default"];

        // As a special dynamic check requested: "pasport da esa AE bo'lsa faqat 2 ta harf"
        // Generalized: If the document starts with letters, ensure letters and numbers match expected fallback rules.
        if (country === "Uzbekistan" && !activeRegex.test(val)) {
          // We explicitly allow either 14 numbers (PINFL) or 2 letters + 7 digits (Passport)
          docValid = false;
        } else if (activeRegex.test(val)) {
          docValid = true;
        }

        if (!docValid) {
          passportNumber.classList.add("border-red-500", "dark:border-red-500");
          if (verificationStatus) {
            verificationStatus.textContent =
              "Invalid Document Format for the selected country.";
            verificationStatus.className =
              "text-xs font-semibold text-center h-4 text-red-500 mt-2 block w-full";
          }
          isValid = false;
        } else {
          passportNumber.classList.remove(
            "border-red-500",
            "dark:border-red-500",
          );
        }
      }

      if (isValid && !hasPassport) {
        verificationStatus.textContent = "Please upload your ID document.";
        verificationStatus.className =
          "text-xs font-semibold text-center h-4 text-red-500 mt-2 block w-full";
        isValid = false;
      }
      if (isValid && faceVerifiedInput && faceVerifiedInput.value !== "true") {
        verificationStatus.textContent =
          "You must complete the facial scan to proceed.";
        verificationStatus.className =
          "text-xs font-semibold text-center h-4 text-red-500 mt-2 block w-full";
        isValid = false;
      }
    }

    return isValid;
  }

  nextBtn.addEventListener("click", () => {
    if (validateStep()) {
      if (verificationStatus) verificationStatus.textContent = "";
      currentStep++;
      updateStepUI();
    }
  });

  prevBtn.addEventListener("click", () => {
    currentStep--;
    updateStepUI();
  });

  // --- Document Upload Logic ---
  const passportUpload = document.getElementById("passport-upload");
  const passportPreview = document.getElementById("passport-preview");
  const passportSuccessOverlay = document.getElementById(
    "passport-success-overlay",
  );
  let hasPassport = false;

  if (passportUpload) {
    passportUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          if (passportPreview) {
            passportPreview.src = evt.target.result;
            passportPreview.classList.remove("hidden");
          }

          // Simulate a quick AI validation of the document
          setTimeout(() => {
            if (passportSuccessOverlay)
              passportSuccessOverlay.classList.remove("hidden");
            hasPassport = true;
            if (
              verificationStatus &&
              verificationStatus.textContent.includes("upload")
            ) {
              verificationStatus.textContent = "";
            }
          }, 1200);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- Pro Face Scan Logic ---
  const scanPlaceholder = document.getElementById("scan-placeholder");
  const scanActive = document.getElementById("scan-active");
  const scanSuccess = document.getElementById("scan-success");
  const scanError = document.getElementById("scan-error");
  const startScanBtn = document.getElementById("start-scan-btn");
  const retryScanBtn = document.getElementById("retry-scan-btn");
  const faceVerifiedInput = document.getElementById("face-verified");
  const verificationStatus = document.getElementById("verification-status");
  const scanProgressBar = document.getElementById("scan-progress-bar");
  const scanStatusText = document.getElementById("scan-status-text");

  function startScanningSimulation() {
    if (scanPlaceholder) scanPlaceholder.classList.add("hidden");
    if (scanError) scanError.classList.add("hidden");
    if (scanSuccess) scanSuccess.classList.add("hidden");
    if (scanActive) scanActive.classList.remove("hidden");

    if (verificationStatus) {
      verificationStatus.textContent = "Initializing biometric tracking...";
      verificationStatus.className =
        "text-xs font-semibold text-center h-4 text-blue-500 animate-pulse mt-2 block w-full";
    }

    if (scanProgressBar) scanProgressBar.style.width = "0%";

    let progress = 0;
    const stages = [
      "Identifying Landmarks...",
      "Checking Depth...",
      "Matching Records...",
      "Finalizing Hash...",
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 2;

      if (progress > 100) progress = 100;
      if (scanProgressBar) scanProgressBar.style.width = `${progress}%`;

      const stageIdx = Math.floor((progress / 100) * stages.length);
      if (stageIdx < stages.length && scanStatusText) {
        scanStatusText.textContent = stages[stageIdx];
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          completeScan();
        }, 500);
      }
    }, 250);
  }

  function completeScan() {
    if (scanActive) scanActive.classList.add("hidden");

    // We do a 95% success rate for simulation realism
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      if (scanSuccess) scanSuccess.classList.remove("hidden");
      const matchScore = (Math.random() * 5 + 94).toFixed(1);
      if (verificationStatus) {
        verificationStatus.textContent = `Biometric Identity Verified. (Match: ${matchScore}%)`;
        verificationStatus.className =
          "text-xs font-semibold text-center h-4 text-emerald-500 mt-2 block w-full";
      }
      if (faceVerifiedInput) faceVerifiedInput.value = "true";
    } else {
      if (scanError) scanError.classList.remove("hidden");
      if (verificationStatus) {
        verificationStatus.textContent =
          "Biometric match failed. Please ensure clear lighting.";
        verificationStatus.className =
          "text-xs font-semibold text-center h-4 text-red-500 mt-2 block w-full";
      }
    }
  }

  if (startScanBtn) {
    startScanBtn.addEventListener("click", () => {
      if (!hasPassport) {
        if (verificationStatus) {
          verificationStatus.textContent =
            "Please upload an ID document first for comparison.";
          verificationStatus.className =
            "text-xs font-semibold text-center h-4 text-red-500 mt-2 block w-full";
        }
        return;
      }
      startScanningSimulation();
    });
  }

  if (retryScanBtn) {
    retryScanBtn.addEventListener("click", () => {
      startScanningSimulation();
    });
  }

  // Form Submission
  
  // URL validation / OTP inputs logic
  const verifyCodeInputs = document.querySelectorAll("#verify-code-inputs input");
  if (verifyCodeInputs.length > 0) {
    verifyCodeInputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        // Ensure only numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.value !== "") {
          if (index < verifyCodeInputs.length - 1) {
            verifyCodeInputs[index + 1].focus();
          }
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && e.target.value === "") {
          if (index > 0) {
            verifyCodeInputs[index - 1].focus();
          }
        }
      });
      // Handle paste
      input.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.originalEvent || e).clipboardData.getData("text/plain").replace(/[^0-9]/g, '');
        for (let i = 0; i < text.length && index + i < verifyCodeInputs.length; i++) {
          verifyCodeInputs[index + i].value = text[i];
          if (index + i < verifyCodeInputs.length - 1) {
            verifyCodeInputs[index + i + 1].focus();
          }
        }
      });
    });
  }

  const resendCodeBtn = document.getElementById("resend-code-btn");
  if (resendCodeBtn) {
    resendCodeBtn.addEventListener("click", () => {
      resendCodeBtn.textContent = "Code Sent!";
      resendCodeBtn.classList.add("text-emerald-500");
      resendCodeBtn.classList.remove("text-primary");
      setTimeout(() => {
        resendCodeBtn.textContent = "Resend Code";
        resendCodeBtn.classList.remove("text-emerald-500");
        resendCodeBtn.classList.add("text-primary");
      }, 3000);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const currentContent = document.getElementById("step-5-content");
      if (currentContent) {
        const requiredInputs = currentContent.querySelectorAll(
          "input:not([type=hidden]):not([type=checkbox])",
        );
        let isValid = true;
        requiredInputs.forEach((input) => {
          if (!input.value) {
            input.classList.add("border-red-500", "dark:border-red-500");
            isValid = false;
          } else {
            input.classList.remove("border-red-500", "dark:border-red-500");
          }
        });

        const termsCheck = document.getElementById("terms-check");
        if (termsCheck && !termsCheck.checked) {
          isValid = false;
          // Optionally highlight terms
        }

        if (!isValid) return;
      }

      // Proceed
      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Encrypting & Registering...
        `;
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
    });
  }
});
