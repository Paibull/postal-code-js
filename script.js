const fallbackStudentNames = [
  "USTU BINA SYAHDIBA",
  "TUTI PURWANINGSIH",
  "SYAHRI BANUN",
  "MUHAMMAD ADITYA NUGRAHA",
  "FA`IZ AKBAR HIZBULLAH",
  "MUHAMMAD HISYAM AL ARBY",
  "MUHAMMAD FATIH AL FAWWAZ",
  "ARDHIAN JUNIOR CAESAR",
  "SHABRINA SARAYATI",
  "CHELSEA",
  "BELVANY VIRGINIA KENETTA SETIAWAN",
  "JEREMY MATTATHIAS MBOE",
  "SULTAN HAMDI JAILANI DAULAY",
  "JONATHAN ANDERSON MANURUNG",
  "UMAR AL FARIS",
  "MUHAMMAD HADIDAN NURHAUNAN",
  "TRI ISMUNHADI JULIK CAKRA WIBAWA",
  "MUHAMMAD FARHAN",
  "FERRI ADI PRASETYA",
  "FAZLE MAWLA WAHYUHANDA",
  "IZZAH NAUFALIA ADILA",
  "ROYAN HARITS YUSTANTO",
  "BERLIANA SARLITA RAHAJENG",
  "MOCHAMMAD HENRY ALIFIAN",
  "RAFLI DJANUAR ANANGSYAH",
  "ARYA PRATAMA RHAMA PUTRA",
  "RADITYA AKMAL",
  "KAYLA RIZA PUTRI IRJAYANTO",
  "WAYAN RADITYA PUTRA",
  "MUHAMMAD ROBITUL JAKSY",
  "JYLAN ANNISA MUMTAZA SYIDANA",
  "SEIFELDEIN AKBAR",
  "MUHAMMAD NABIL DHIYAULHAQ",
  "RASYA AUDREA BRAMANTYA WIJAYA",
  "NAZHIF BERLIAN NASHRULLAH",
  "MUHAMMAD DAYYAN GHAZANFAR LATIEF",
  "GHIFFARY ABDUL HAKIM",
  "AHMAD NAUFAL FARRAS",
  "KEVIN NICHOLAS NATHANAEL",
  "SYAUQI NABIL TASRI",
  "SITTI AMINAH",
  "INDRA PRASETYA MAHESWARA",
  "MUHAMMAD FATHUR AZIZ",
  "WIJDAN RAZEFI AL HAWWARI",
  "MOHAMMAD AKMAL FAYYAZI",
  "ARVITO RAJAPANDYA NATLYSANDRO",
  "MARVEL MAHANARA"
].map(formatNameCase);

const fallbackCourseNames = [
  "Dasar Pemrograman",
  "Struktur Data",
  "Basis Data",
  "Matematika Diskrit",
  "Aljabar Linier",
  "Sistem Operasi",
  "Jaringan Komputer",
  "Konsep Pengembangan dan Perancangan Perangkat Lunak",
  "Pemrograman Web",
  "Interaksi Manusia dan Komputer",
  "Machine Learning",
  "Data Mining",
  "Deep Learning",
  "Natural Language Processing",
  "Pengolahan Citra Digital",
  "Grafika Komputer"
];

const fallbackLecturerNames = [
  "Fajar Baskoro, S.Kom., M.T.",
  "Dr. Sarwosri, S.Kom., M.T.",
  "Prof. Ir. Tohari Ahmad, S.Kom., M.IT., Ph.D.",
  "Prof. Dr. Eng. Nanik Suciati, S.Kom., M.Kom.",
  "Prof. Dr. Eng. Chastine Fatichah, S.Kom., M.Kom.",
  "Dr. Baskoro Adi P., S.Kom., M.Kom.",
  "Prof. Dr. Diana Purwitasari, S.Kom., M.Sc.",
  "Dr. Adhatus Solichah Ahmadiyah, S.Kom., M.Sc."
];

const productBrandMap = {
  Sony: ["Sony A7 IV", "Sony A7C II", "Sony A6700", "Sony ZV-E10 II", "Sony FX30"],
  Canon: ["Canon EOS R6 Mark II", "Canon EOS R8", "Canon EOS R50", "Canon EOS R10", "Canon EOS RP"],
  Fujifilm: ["Fujifilm X-T5", "Fujifilm X-S20", "Fujifilm X100VI", "Fujifilm X-T30 II", "Fujifilm X-H2"],
  Nikon: ["Nikon Zf", "Nikon Z6 II", "Nikon Z5", "Nikon Z50", "Nikon Z8"],
  Panasonic: ["Lumix S5 II", "Lumix GH6", "Lumix G9 II", "Lumix S9", "Lumix GX9"],
  "OM System": ["OM-1 Mark II", "OM-5", "OM-1", "E-M10 Mark IV", "PEN E-P7"]
};

const POSTAL_PREVIEW_LIMIT = 80;

const wilayahStore = {
  provinces: [],
  regenciesByProvince: new Map(),
  districtsByRegency: new Map(),
  villagesByDistrict: new Map(),
  pendingRequests: new Map()
};

const applicationState = {
  studentNamePool: [...fallbackStudentNames],
  suggestions: [],
  activeSuggestionIndex: -1,
  postalFeatureInitialized: false,
  postalFeatureInitPromise: null,
  postalSelection: {
    province: "",
    regency: "",
    district: "",
    village: ""
  },
  postalPreview: {
    districtCode: "",
    expanded: false
  }
};

let domReferences;

async function initializeApplication() {
  domReferences = {
    tabButtons: Array.from(document.querySelectorAll(".tab-button")),
    tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
    registrationForm: document.getElementById("registration-form"),
    nameInput: document.getElementById("student-name"),
    nrpInput: document.getElementById("student-nrp"),
    courseInput: document.getElementById("course-name"),
    lecturerInput: document.getElementById("lecturer-name"),
    nameSuggestions: document.getElementById("name-suggestions"),
    registrationResult: document.getElementById("registration-result"),
    provinceSelect: document.getElementById("province-select"),
    regencySelect: document.getElementById("regency-select"),
    districtSelect: document.getElementById("district-select"),
    villageSelect: document.getElementById("village-select"),
    postalResult: document.getElementById("postal-result"),
    cameraBrandSelect: document.getElementById("camera-brand-select"),
    cameraModelSelect: document.getElementById("camera-model-select")
  };

  initializeTabSystem();
  populateAcademicOptions();
  setupRegistrationForm();
  configureCameraDropdown();
  postalScheduleWarmup();
}

function initializeTabSystem() {
  if (!domReferences.tabButtons.length || !domReferences.tabPanels.length) return;

  domReferences.tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => activateTab(button.dataset.tabTarget, true));
    button.addEventListener("keydown", (event) => handleTabNavigation(event, index));
  });

  const defaultTab = domReferences.tabButtons.find(button => button.classList.contains("active")) || domReferences.tabButtons[0];
  activateTab(defaultTab.dataset.tabTarget, false);
}

function handleTabNavigation(event, currentIndex) {
  const lastIndex = domReferences.tabButtons.length - 1;

  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      domReferences.tabButtons[currentIndex === lastIndex ? 0 : currentIndex + 1].focus();
      break;
    case "ArrowLeft":
      event.preventDefault();
      domReferences.tabButtons[currentIndex === 0 ? lastIndex : currentIndex - 1].focus();
      break;
    case "Home":
      event.preventDefault();
      domReferences.tabButtons[0].focus();
      break;
    case "End":
      event.preventDefault();
      domReferences.tabButtons[lastIndex].focus();
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      activateTab(domReferences.tabButtons[currentIndex].dataset.tabTarget, true);
      break;
  }
}

function activateTab(targetSelector, maintainFocus) {
  if (!targetSelector) return;

  const targetId = targetSelector.startsWith("#") ? targetSelector.slice(1) : targetSelector;

  domReferences.tabButtons.forEach(button => {
    const buttonTarget = (button.dataset.tabTarget || "").replace("#", "");
    const isActive = buttonTarget === targetId;
    
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");
    
    if (isActive && maintainFocus) button.focus();
  });

  domReferences.tabPanels.forEach(panel => {
    const isActive = panel.id === targetId;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });

  if (targetId === "panel-kodepos") {
    postalEnsureFeatureReady(false).catch(error => {
      console.error("Gagal memuat database wilayah", error);
      postalRenderMessage("Gagal memuat database wilayah", "error");
    });
  }
}

function populateAcademicOptions() {
  populateSelectOptions(domReferences.courseInput, fallbackCourseNames, "Pilih Mata Kuliah");
  populateSelectOptions(domReferences.lecturerInput, fallbackLecturerNames, "Pilih Dosen");
  domReferences.courseInput.disabled = false;
  domReferences.lecturerInput.disabled = false;
}

function getUniqueNames(names) {
  const seen = new Set();
  const result = [];

  names.forEach(rawName => {
    const normalized = normalizeSpaces(String(rawName || ""));
    if (!normalized) return;

    const key = normalized.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    result.push(normalized);
  });

  return result;
}

function setupRegistrationForm() {
  if (!domReferences.registrationForm || !domReferences.nameInput || !domReferences.nameSuggestions) return;

  domReferences.nameInput.addEventListener("input", handleNameInput);
  domReferences.nameInput.addEventListener("focus", handleNameFocus);
  domReferences.nameInput.addEventListener("keydown", handleSuggestionNavigation);
  domReferences.nrpInput.addEventListener("input", handleNumericInput);

  document.addEventListener("click", event => {
    if (!event.target.closest(".autocomplete")) hideSuggestions();
  });

  domReferences.registrationForm.addEventListener("submit", event => {
    event.preventDefault();
    clearValidationErrors();

    const formData = {
      studentName: formatNameCase(domReferences.nameInput.value),
      studentNrp: domReferences.nrpInput.value.trim(),
      courseName: normalizeSpaces(domReferences.courseInput.value),
      lecturerName: normalizeSpaces(domReferences.lecturerInput.value)
    };

    if (!validateRegistrationData(formData)) {
      showRegistrationMessage("Periksa kembali data form. Beberapa field masih tidak valid.", "error");
      return;
    }

    showRegistrationMessage(
      `Registrasi berhasil disimpan untuk ${formData.studentName} (NRP ${formData.studentNrp}) pada mata kuliah ${formData.courseName}.`,
      "success"
    );

    domReferences.registrationForm.reset();
    hideSuggestions();
    domReferences.nrpInput.value = "";
  });
}

function handleNumericInput() {
  domReferences.nrpInput.value = domReferences.nrpInput.value.replace(/\D/g, "").slice(0, 10);
}

function handleNameFocus() {
  const currentValue = normalizeSpaces(domReferences.nameInput.value);
  if (currentValue) {
    handleNameInput();
    return;
  }

  const namePool = applicationState.studentNamePool.length ? applicationState.studentNamePool : fallbackStudentNames;
  applicationState.activeSuggestionIndex = -1;
  applicationState.suggestions = namePool.slice(0, 8);
  renderSuggestions();
}

function handleNameInput() {
  const query = normalizeSpaces(domReferences.nameInput.value).toLowerCase();
  applicationState.activeSuggestionIndex = -1;

  if (!query) {
    hideSuggestions();
    return;
  }

  const namePool = applicationState.studentNamePool.length ? applicationState.studentNamePool : fallbackStudentNames;
  applicationState.suggestions = findNameSuggestions(namePool, query, 8);
  renderSuggestions();
}

function findNameSuggestions(namePool, query, limit) {
  const queryTokens = query.split(" ").filter(Boolean);

  return namePool
    .map(name => {
      const lowerName = name.toLowerCase();
      const nameTokens = lowerName.split(" ").filter(Boolean);

      const matchesAllTokens = queryTokens.every(token =>
        nameTokens.some(nameToken => nameToken.startsWith(token) || nameToken.includes(token))
      );

      if (!matchesAllTokens) return null;

      let score = 0;
      if (lowerName.startsWith(query)) score += 4;
      
      const wordStartMatches = queryTokens.filter(token =>
        nameTokens.some(nameToken => nameToken.startsWith(token))
      ).length;
      score += wordStartMatches * 2;

      const directMatches = queryTokens.filter(token => lowerName.includes(token)).length;
      score += directMatches;

      return { name, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(entry => entry.name);
}

function renderSuggestions() {
  domReferences.nameSuggestions.innerHTML = "";

  if (!applicationState.suggestions.length) {
    hideSuggestions();
    return;
  }

  const fragment = document.createDocumentFragment();

  applicationState.suggestions.forEach((name, index) => {
    const item = document.createElement("li");
    item.textContent = name;
    item.setAttribute("role", "option");

    if (index === applicationState.activeSuggestionIndex) item.classList.add("active");

    item.addEventListener("mousedown", event => {
      event.preventDefault();
      selectSuggestion(name);
    });

    fragment.appendChild(item);
  });

  domReferences.nameSuggestions.appendChild(fragment);
  domReferences.nameSuggestions.classList.remove("hidden");
}

function handleSuggestionNavigation(event) {
  if (domReferences.nameSuggestions.classList.contains("hidden")) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      applicationState.activeSuggestionIndex = (applicationState.activeSuggestionIndex + 1) % applicationState.suggestions.length;
      renderSuggestions();
      break;
    case "ArrowUp":
      event.preventDefault();
      applicationState.activeSuggestionIndex = 
        (applicationState.activeSuggestionIndex - 1 + applicationState.suggestions.length) % applicationState.suggestions.length;
      renderSuggestions();
      break;
    case "Enter":
      if (applicationState.activeSuggestionIndex >= 0) {
        event.preventDefault();
        selectSuggestion(applicationState.suggestions[applicationState.activeSuggestionIndex]);
      }
      break;
    case "Escape":
      hideSuggestions();
      break;
  }
}

function selectSuggestion(name) {
  domReferences.nameInput.value = formatNameCase(name);
  hideSuggestions();
}

function hideSuggestions() {
  applicationState.suggestions = [];
  applicationState.activeSuggestionIndex = -1;
  domReferences.nameSuggestions.classList.add("hidden");
  domReferences.nameSuggestions.innerHTML = "";
}

function normalizeSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function formatNameCase(value) {
  const normalized = normalizeSpaces(value).toLowerCase();
  return normalized.replace(/(^|[\s\-'.`])([a-z])/g, (match, prefix, letter) => prefix + letter.toUpperCase());
}

function setValidationError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + "-error");
  if (errorElement) errorElement.textContent = message;
}

function clearValidationErrors() {
  ["student-name", "student-nrp", "course-name", "lecturer-name"].forEach(fieldId => {
    setValidationError(fieldId, "");
  });
}

function validateRegistrationData(data) {
  let isValid = true;

  if (!data.studentName) {
    setValidationError("student-name", "Nama mahasiswa wajib diisi.");
    isValid = false;
  } else if (!/^[A-Za-z'.`\-\s]+$/.test(data.studentName)) {
    setValidationError("student-name", "Nama hanya boleh huruf, spasi, titik, apostrof, atau tanda hubung.");
    isValid = false;
  }

  if (!data.studentNrp) {
    setValidationError("student-nrp", "NRP wajib diisi.");
    isValid = false;
  } else if (!/^\d{10}$/.test(data.studentNrp)) {
    setValidationError("student-nrp", "NRP harus 10 digit angka.");
    isValid = false;
  }

  if (!data.courseName) {
    setValidationError("course-name", "Mata kuliah wajib diisi.");
    isValid = false;
  }

  if (!data.lecturerName) {
    setValidationError("lecturer-name", "Nama dosen wajib diisi.");
    isValid = false;
  }

  return isValid;
}

function showRegistrationMessage(message, type) {
  domReferences.registrationResult.textContent = message;
  domReferences.registrationResult.classList.remove("hidden", "error", "success");
  domReferences.registrationResult.classList.add(type);
}

function toUiTitleCase(value) {
  const normalized = normalizeSpaces(value).toLowerCase();
  return normalized.replace(/(^|[\s\-'.`/()])([a-z])/g, (match, prefix, letter) => prefix + letter.toUpperCase());
}

async function loadJsonFile(path) {
  if (wilayahStore.pendingRequests.has(path)) {
    return wilayahStore.pendingRequests.get(path);
  }

  const requestPromise = (async () => {
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Gagal membaca ${path} (status ${response.status}).`);
    }

    return response.json();
  })();

  wilayahStore.pendingRequests.set(path, requestPromise);

  try {
    return await requestPromise;
  } finally {
    wilayahStore.pendingRequests.delete(path);
  }
}

function validateProvinceIndexSchema(payload) {
  if (!payload || !Array.isArray(payload.provinces)) {
    throw new Error("Schema provinces index tidak valid.");
  }

  payload.provinces.forEach(item => {
    if (!item || typeof item.province_code !== "string" || typeof item.province !== "string") {
      throw new Error("Schema province item tidak valid.");
    }
  });
}

function validateRegenciesSchema(payload, provinceCode) {
  if (!payload || payload.province_code !== provinceCode || !Array.isArray(payload.regencies)) {
    throw new Error("Schema regencies tidak valid.");
  }

  payload.regencies.forEach(item => {
    if (
      !item ||
      typeof item.regency_code !== "string" ||
      typeof item.province_code !== "string" ||
      typeof item.regency !== "string"
    ) {
      throw new Error("Schema regency item tidak valid.");
    }
  });
}

function validateDistrictsSchema(payload, regencyCode) {
  if (!payload || payload.regency_code !== regencyCode || !Array.isArray(payload.districts)) {
    throw new Error("Schema districts tidak valid.");
  }

  payload.districts.forEach(item => {
    if (
      !item ||
      typeof item.district_code !== "string" ||
      typeof item.regency_code !== "string" ||
      typeof item.district !== "string"
    ) {
      throw new Error("Schema district item tidak valid.");
    }
  });
}

function validateVillagesSchema(payload, districtCode) {
  if (!payload || payload.district_code !== districtCode || !Array.isArray(payload.villages)) {
    throw new Error("Schema villages tidak valid.");
  }

  payload.villages.forEach(item => {
    if (
      !item ||
      typeof item.village_code !== "string" ||
      typeof item.district_code !== "string" ||
      typeof item.village !== "string" ||
      !Array.isArray(item.postal_code)
    ) {
      throw new Error("Schema village item tidak valid.");
    }
  });
}

async function postalLoadProvinceIndex() {
  if (wilayahStore.provinces.length) return wilayahStore.provinces;

  const payload = await loadJsonFile("./data/wilayah/provinces/index.json");
  validateProvinceIndexSchema(payload);
  wilayahStore.provinces = payload.provinces.slice();
  return wilayahStore.provinces;
}

async function postalLoadRegenciesByProvince(provinceCode) {
  if (wilayahStore.regenciesByProvince.has(provinceCode)) {
    return wilayahStore.regenciesByProvince.get(provinceCode);
  }

  const payload = await loadJsonFile(`./data/wilayah/regencies/${provinceCode}.json`);
  validateRegenciesSchema(payload, provinceCode);
  wilayahStore.regenciesByProvince.set(provinceCode, payload.regencies.slice());
  return wilayahStore.regenciesByProvince.get(provinceCode);
}

async function postalLoadDistrictsByRegency(regencyCode) {
  if (wilayahStore.districtsByRegency.has(regencyCode)) {
    return wilayahStore.districtsByRegency.get(regencyCode);
  }

  const payload = await loadJsonFile(`./data/wilayah/districts/${regencyCode}.json`);
  validateDistrictsSchema(payload, regencyCode);
  wilayahStore.districtsByRegency.set(regencyCode, payload.districts.slice());
  return wilayahStore.districtsByRegency.get(regencyCode);
}

async function postalLoadVillagesByDistrict(districtCode) {
  if (wilayahStore.villagesByDistrict.has(districtCode)) {
    return wilayahStore.villagesByDistrict.get(districtCode);
  }

  const payload = await loadJsonFile(`./data/wilayah/villages/${districtCode}.json`);
  validateVillagesSchema(payload, districtCode);
  wilayahStore.villagesByDistrict.set(districtCode, payload.villages.slice());
  return wilayahStore.villagesByDistrict.get(districtCode);
}

function postalGetProvinceByCode(provinceCode) {
  return wilayahStore.provinces.find(item => item.province_code === provinceCode) || null;
}

function postalGetRegencyByCode(provinceCode, regencyCode) {
  const regencies = wilayahStore.regenciesByProvince.get(provinceCode) || [];
  return regencies.find(item => item.regency_code === regencyCode) || null;
}

function postalGetDistrictByCode(regencyCode, districtCode) {
  const districts = wilayahStore.districtsByRegency.get(regencyCode) || [];
  return districts.find(item => item.district_code === districtCode) || null;
}

function postalGetVillageByCode(districtCode, villageCode) {
  const villages = wilayahStore.villagesByDistrict.get(districtCode) || [];
  return villages.find(item => item.village_code === villageCode) || null;
}

async function postalInitializeFinder() {
  const hasRequiredElements = domReferences.provinceSelect &&
    domReferences.regencySelect &&
    domReferences.districtSelect &&
    domReferences.villageSelect &&
    domReferences.postalResult;

  if (!hasRequiredElements) return;

  const provinces = await postalLoadProvinceIndex();

  populateSelectOptionsByItems(
    domReferences.provinceSelect,
    provinces.map(item => ({
      value: item.province_code,
      label: toUiTitleCase(item.province)
    })),
    "Pilih Provinsi"
  );

  postalResetRegencySelect();
  postalResetDistrictSelect();
  postalResetVillageSelect();
  postalRenderMessage("Silakan pilih daerah terlebih dahulu.", "default");

  domReferences.provinceSelect.addEventListener("change", () => {
    postalHandleProvinceChange().catch(error => {
      console.error("Gagal memuat data kabupaten/kota:", error);
      postalRenderMessage("Gagal memuat data kabupaten/kota.", "error");
    });
  });
  domReferences.regencySelect.addEventListener("change", () => {
    postalHandleRegencyChange().catch(error => {
      console.error("Gagal memuat data kecamatan:", error);
      postalRenderMessage("Gagal memuat data kecamatan.", "error");
    });
  });
  domReferences.districtSelect.addEventListener("change", () => {
    postalHandleDistrictChange().catch(error => {
      console.error("Gagal memuat data desa/kelurahan:", error);
      postalRenderMessage("Gagal memuat data desa/kelurahan.", "error");
    });
  });
  domReferences.villageSelect.addEventListener("change", postalHandleVillageChange);
  domReferences.postalResult.addEventListener("click", postalHandleResultClick);
}

async function postalEnsureFeatureReady(isWarmup) {
  if (applicationState.postalFeatureInitialized) return;
  if (applicationState.postalFeatureInitPromise) {
    await applicationState.postalFeatureInitPromise;
    return;
  }

  if (!isWarmup) {
    postalRenderLoading("Menyiapkan database wilayah...");
  }

  applicationState.postalFeatureInitPromise = postalInitializeFinder();
  try {
    await applicationState.postalFeatureInitPromise;
    applicationState.postalFeatureInitialized = true;
  } finally {
    applicationState.postalFeatureInitPromise = null;
  }
}

function postalScheduleWarmup() {
  const warmup = () => {
    postalEnsureFeatureReady(true).catch(() => {});
  };

  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => warmup(), { timeout: 1500 });
    return;
  }

  setTimeout(warmup, 400);
}

function postalResetRegencySelect() {
  domReferences.regencySelect.disabled = true;
  populateSelectOptionsByItems(domReferences.regencySelect, [], "Pilih provinsi");
  applicationState.postalSelection.regency = "";
}

function postalResetDistrictSelect() {
  domReferences.districtSelect.disabled = true;
  populateSelectOptionsByItems(domReferences.districtSelect, [], "Pilih kabupaten/kota");
  applicationState.postalSelection.district = "";
}

function postalResetVillageSelect() {
  domReferences.villageSelect.disabled = true;
  populateSelectOptionsByItems(domReferences.villageSelect, [], "Pilih kecamatan");
  applicationState.postalSelection.village = "";
  applicationState.postalPreview.districtCode = "";
  applicationState.postalPreview.expanded = false;
}

async function postalHandleProvinceChange() {
  const selectedProvinceCode = domReferences.provinceSelect.value;
  applicationState.postalSelection.province = selectedProvinceCode;

  postalResetRegencySelect();
  postalResetDistrictSelect();
  postalResetVillageSelect();

  if (!selectedProvinceCode) {
    postalRenderMessage("Silakan pilih daerah terlebih dahulu.", "default");
    return;
  }

  const provinceNode = postalGetProvinceByCode(selectedProvinceCode);
  if (!provinceNode) {
    postalRenderMessage("Provinsi tidak ditemukan di database lokal.", "error");
    return;
  }

  postalRenderLoading("Memuat data kabupaten/kota...");
  const regencies = await postalLoadRegenciesByProvince(selectedProvinceCode);

  populateSelectOptionsByItems(
    domReferences.regencySelect,
    regencies.map(item => ({
      value: item.regency_code,
      label: toUiTitleCase(item.regency)
    })),
    "Pilih Kabupaten/Kota"
  );
  domReferences.regencySelect.disabled = false;
  postalRenderMessage("Pilih kabupaten/kota untuk melanjutkan pencarian kode pos.", "default");

  const firstRegency = regencies[0];
  if (firstRegency) {
    postalPrefetchDistrictsByRegency(firstRegency.regency_code);
  }
}

async function postalHandleRegencyChange() {
  const selectedProvinceCode = domReferences.provinceSelect.value;
  const selectedRegencyCode = domReferences.regencySelect.value;
  applicationState.postalSelection.regency = selectedRegencyCode;

  postalResetDistrictSelect();
  postalResetVillageSelect();

  if (!selectedRegencyCode) {
    postalRenderMessage("Pilih kabupaten/kota untuk melanjutkan pencarian kode pos.", "default");
    return;
  }

  const regencyNode = postalGetRegencyByCode(selectedProvinceCode, selectedRegencyCode);
  if (!regencyNode) {
    postalRenderMessage("Kabupaten/kota tidak ditemukan di database lokal.", "error");
    return;
  }

  postalRenderLoading("Memuat data kecamatan...");
  const districts = await postalLoadDistrictsByRegency(selectedRegencyCode);

  populateSelectOptionsByItems(
    domReferences.districtSelect,
    districts.map(item => ({
      value: item.district_code,
      label: toUiTitleCase(item.district)
    })),
    "Pilih Kecamatan"
  );
  domReferences.districtSelect.disabled = false;
  postalRenderMessage("Pilih kecamatan untuk menampilkan daftar kelurahan/desa.", "default");

  const firstDistrict = districts[0];
  if (firstDistrict) {
    postalPrefetchVillagesByDistrict(firstDistrict.district_code);
  }
}

async function postalHandleDistrictChange() {
  const selectedProvinceCode = domReferences.provinceSelect.value;
  const selectedRegencyCode = domReferences.regencySelect.value;
  const selectedDistrictCode = domReferences.districtSelect.value;
  applicationState.postalSelection.district = selectedDistrictCode;

  postalResetVillageSelect();

  if (!selectedDistrictCode) {
    postalRenderMessage("Pilih kecamatan untuk menampilkan daftar kelurahan/desa.", "default");
    return;
  }

  const districtNode = postalGetDistrictByCode(selectedRegencyCode, selectedDistrictCode);
  if (!districtNode) {
    postalRenderMessage("Kecamatan tidak ditemukan di database lokal.", "error");
    return;
  }

  const provinceNode = postalGetProvinceByCode(selectedProvinceCode);
  const regencyNode = postalGetRegencyByCode(selectedProvinceCode, selectedRegencyCode);
  if (!provinceNode || !regencyNode) {
    postalRenderMessage("Referensi wilayah tidak ditemukan di database lokal.", "error");
    return;
  }

  postalRenderLoading("Memuat data desa/kelurahan dan kode pos...");
  const villages = await postalLoadVillagesByDistrict(selectedDistrictCode);
  if (!villages.length) {
    postalRenderMessage("Belum ada data desa/kelurahan untuk kecamatan ini.", "error");
    return;
  }

  populateSelectOptionsByItems(
    domReferences.villageSelect,
    villages.map(item => ({
      value: item.village_code,
      label: toUiTitleCase(item.village)
    })),
    "Semua desa/kelurahan (opsional)"
  );
  domReferences.villageSelect.disabled = false;
  applicationState.postalPreview.districtCode = selectedDistrictCode;
  applicationState.postalPreview.expanded = false;
  postalRenderDistrictPreview(provinceNode, regencyNode, districtNode, villages, false);
}

function postalHandleVillageChange() {
  const selectedProvinceCode = domReferences.provinceSelect.value;
  const selectedRegencyCode = domReferences.regencySelect.value;
  const selectedDistrictCode = domReferences.districtSelect.value;
  const selectedVillageCode = domReferences.villageSelect.value;
  applicationState.postalSelection.village = selectedVillageCode;

  if (!selectedVillageCode) {
    const provinceNode = postalGetProvinceByCode(selectedProvinceCode);
    const regencyNode = postalGetRegencyByCode(selectedProvinceCode, selectedRegencyCode);
    const districtNode = postalGetDistrictByCode(selectedRegencyCode, selectedDistrictCode);
    const villages = wilayahStore.villagesByDistrict.get(selectedDistrictCode) || [];
    if (provinceNode && regencyNode && districtNode && villages.length) {
      postalRenderDistrictPreview(
        provinceNode,
        regencyNode,
        districtNode,
        villages,
        applicationState.postalPreview.expanded
      );
      return;
    }
    postalRenderMessage("Pilih desa/kelurahan untuk melihat kode pos.", "default");
    return;
  }

  const provinceNode = postalGetProvinceByCode(selectedProvinceCode);
  const regencyNode = postalGetRegencyByCode(selectedProvinceCode, selectedRegencyCode);
  const districtNode = postalGetDistrictByCode(selectedRegencyCode, selectedDistrictCode);
  const villageNode = postalGetVillageByCode(selectedDistrictCode, selectedVillageCode);
  if (!provinceNode || !regencyNode || !districtNode || !villageNode || !villageNode.postal_code.length) {
    postalRenderMessage("Kode pos tidak ditemukan untuk wilayah yang dipilih.", "error");
    return;
  }

  const postalCodesText = villageNode.postal_code.join(", ");
  domReferences.postalResult.classList.remove("error", "success");
  domReferences.postalResult.classList.add("success");
  domReferences.postalResult.innerHTML =
    "Kode pos untuk <strong>" +
    escapeHtml(toUiTitleCase(villageNode.village)) +
    "</strong>, " +
    escapeHtml(toUiTitleCase(districtNode.district)) +
    ", " +
    escapeHtml(toUiTitleCase(regencyNode.regency)) +
    ", " +
    escapeHtml(toUiTitleCase(provinceNode.province)) +
    " adalah <span class=\"postal-code-value\">" +
    escapeHtml(postalCodesText) +
    "</span>.";
}

function postalRenderDistrictPreview(provinceNode, regencyNode, districtNode, villages, isExpandedOverride) {
  const isExpanded = typeof isExpandedOverride === "boolean"
    ? isExpandedOverride
    : applicationState.postalPreview.expanded;
  const visibleVillages = isExpanded ? villages : villages.slice(0, POSTAL_PREVIEW_LIMIT);
  const hiddenCount = villages.length - visibleVillages.length;

  const entries = visibleVillages
    .map(item => {
      const codeText = Array.isArray(item.postal_code) && item.postal_code.length
        ? item.postal_code.join(", ")
        : "-";
      return (
        "<div class=\"postal-entry-card\">" +
        "<p class=\"postal-entry-title\"><strong>" +
        escapeHtml(toUiTitleCase(item.village)) +
        "</strong> - " +
        escapeHtml(codeText) +
        "</p>" +
        "</div>"
      );
    })
    .join("");

  const showAllButton = hiddenCount > 0
    ? (
      "<button type=\"button\" class=\"btn\" data-action=\"postal-show-all\" style=\"margin-top:10px;\">" +
      "Tampilkan " + escapeHtml(String(hiddenCount)) + " desa/kelurahan lainnya" +
      "</button>"
    )
    : "";

  domReferences.postalResult.classList.remove("error");
  domReferences.postalResult.innerHTML =
    "Daftar kode pos di <strong>" +
    escapeHtml(toUiTitleCase(districtNode.district)) +
    "</strong>, " +
    escapeHtml(toUiTitleCase(regencyNode.regency)) +
    ", " +
    escapeHtml(toUiTitleCase(provinceNode.province)) +
    " (" + escapeHtml(String(villages.length)) + " desa/kelurahan)" +
    ":<div class=\"postal-entry-list\">" +
    entries +
    "</div>" +
    showAllButton;
}

function postalRenderMessage(message, state) {
  domReferences.postalResult.textContent = message;
  domReferences.postalResult.classList.remove("error", "success");
  if (state === "error") {
    domReferences.postalResult.classList.add("error");
  }
}

function postalRenderLoading(message) {
  domReferences.postalResult.textContent = message;
  domReferences.postalResult.classList.remove("error", "success");
}

function postalPrefetchDistrictsByRegency(regencyCode) {
  postalLoadDistrictsByRegency(regencyCode).catch(() => {});
}

function postalPrefetchVillagesByDistrict(districtCode) {
  postalLoadVillagesByDistrict(districtCode).catch(() => {});
}

function postalHandleResultClick(event) {
  const trigger = event.target.closest("[data-action='postal-show-all']");
  if (!trigger) return;

  const selectedProvinceCode = domReferences.provinceSelect.value;
  const selectedRegencyCode = domReferences.regencySelect.value;
  const selectedDistrictCode = domReferences.districtSelect.value;
  const provinceNode = postalGetProvinceByCode(selectedProvinceCode);
  const regencyNode = postalGetRegencyByCode(selectedProvinceCode, selectedRegencyCode);
  const districtNode = postalGetDistrictByCode(selectedRegencyCode, selectedDistrictCode);
  const villages = wilayahStore.villagesByDistrict.get(selectedDistrictCode) || [];
  if (!provinceNode || !regencyNode || !districtNode || !villages.length) return;

  applicationState.postalPreview.districtCode = selectedDistrictCode;
  applicationState.postalPreview.expanded = true;
  postalRenderDistrictPreview(provinceNode, regencyNode, districtNode, villages, true);
}

function configureCameraDropdown() {
  populateSelectOptions(domReferences.cameraBrandSelect, Object.keys(productBrandMap), "Pilih Brand Kamera");

  domReferences.cameraBrandSelect.addEventListener("change", () => {
    const selectedBrand = domReferences.cameraBrandSelect.value;

    if (!selectedBrand) {
      domReferences.cameraModelSelect.disabled = true;
      populateSelectOptions(domReferences.cameraModelSelect, [], "Pilih Model Kamera");
      return;
    }

    domReferences.cameraModelSelect.disabled = false;
    populateSelectOptions(domReferences.cameraModelSelect, productBrandMap[selectedBrand], "Pilih Model Kamera");
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function populateSelectOptions(selectElement, values, placeholder, labelFormatter) {
  const options = [`<option value="">${escapeHtml(placeholder)}</option>`];

  values.forEach(value => {
    const label = typeof labelFormatter === "function" ? labelFormatter(value) : value;
    options.push(`<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`);
  });

  selectElement.innerHTML = options.join("");
}

function populateSelectOptionsByItems(selectElement, items, placeholder) {
  const options = [`<option value="">${escapeHtml(placeholder)}</option>`];

  items.forEach(item => {
    options.push(`<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`);
  });

  selectElement.innerHTML = options.join("");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeSpaces,
    formatNameCase,
    getUniqueNames,
    findNameSuggestions,
    validateRegistrationData
  };
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeApplication().catch(error => {
      console.error("Gagal memuat database wilayah:", error);
      const postalResultElement = document.getElementById("postal-result");
      if (postalResultElement) {
        postalResultElement.textContent = "Gagal memuat database wilayah.";
        postalResultElement.classList.add("error");
      }
    });
  });
}
