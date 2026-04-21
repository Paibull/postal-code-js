const REGION_API_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";
const POSTAL_API_BASE = "https://kodepos.vercel.app";

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
].map(toNameCase);

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

const state = {
  studentNamePool: [...fallbackStudentNames],
  suggestions: [],
  activeSuggestionIndex: -1,
  regionSelection: {
    provinceId: "",
    regencyId: "",
    districtId: "",
    provinceName: "",
    regencyName: "",
    districtName: ""
  },
  regionCache: {
    regencies: new Map(),
    districts: new Map()
  }
};

const refs = {
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
  postalResult: document.getElementById("postal-result"),
  productTypeSelect: document.getElementById("product-type-select"),
  brandSelect: document.getElementById("brand-select")
};

function initApp() {
  initTabs();
  hydrateAcademicOptions();
  initRegistrationForm();
  initDynamicDropdown();
  initRegionSearch();
}

function initTabs() {
  if (!refs.tabButtons.length || !refs.tabPanels.length) {
    return;
  }

  refs.tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tabTarget, true);
    });

    button.addEventListener("keydown", (event) => {
      handleTabKeyboard(event, index);
    });
  });

  const defaultTab = refs.tabButtons.find((button) => button.classList.contains("active")) || refs.tabButtons[0];
  activateTab(defaultTab.dataset.tabTarget, false);
}

function handleTabKeyboard(event, currentIndex) {
  const lastIndex = refs.tabButtons.length - 1;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    const nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    refs.tabButtons[nextIndex].focus();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    const nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    refs.tabButtons[nextIndex].focus();
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    refs.tabButtons[0].focus();
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    refs.tabButtons[lastIndex].focus();
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activateTab(refs.tabButtons[currentIndex].dataset.tabTarget, true);
  }
}

function activateTab(targetSelector, keepFocus) {
  if (!targetSelector) {
    return;
  }

  const targetId = targetSelector.startsWith("#") ? targetSelector.slice(1) : targetSelector;

  refs.tabButtons.forEach((button) => {
    const buttonTarget = (button.dataset.tabTarget || "").replace("#", "");
    const isActive = buttonTarget === targetId;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");

    if (isActive && keepFocus) {
      button.focus();
    }
  });

  refs.tabPanels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function hydrateAcademicOptions() {
  fillSelectOptions(refs.courseInput, fallbackCourseNames, "Pilih Mata Kuliah");
  fillSelectOptions(refs.lecturerInput, fallbackLecturerNames, "Pilih Nama Dosen");
  refs.courseInput.disabled = false;
  refs.lecturerInput.disabled = false;
}

function mergeUniqueNames(names) {
  const seen = new Set();
  const result = [];

  names.forEach((rawName) => {
    const normalized = normalizeSpaces(String(rawName || ""));
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(normalized);
  });

  return result;
}

function initRegistrationForm() {
  if (!refs.registrationForm || !refs.nameInput || !refs.nameSuggestions) {
    return;
  }

  refs.nameInput.addEventListener("input", handleNameInput);
  refs.nameInput.addEventListener("focus", handleNameFocus);
  refs.nameInput.addEventListener("keydown", handleSuggestionKeyboard);
  refs.nrpInput.addEventListener("input", handleNrpInput);

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".autocomplete")) {
      hideSuggestions();
    }
  });

  refs.registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearRegistrationErrors();

    const payload = {
      studentName: toNameCase(refs.nameInput.value),
      studentNrp: refs.nrpInput.value.trim(),
      courseName: normalizeSpaces(refs.courseInput.value),
      lecturerName: normalizeSpaces(refs.lecturerInput.value)
    };

    const isValid = validateRegistrationForm(payload);
    if (!isValid) {
      showRegistrationResult("Periksa kembali data form. Beberapa field masih tidak valid.", "error");
      return;
    }

    showRegistrationResult(
      "Registrasi berhasil disimpan untuk " +
        payload.studentName +
        " (NRP " +
        payload.studentNrp +
        ") pada mata kuliah " +
        payload.courseName +
        ".",
      "success"
    );

    refs.registrationForm.reset();
    hideSuggestions();
    refs.nrpInput.value = "";
  });
}

function handleNrpInput() {
  refs.nrpInput.value = refs.nrpInput.value.replace(/\D/g, "").slice(0, 10);
}

function handleNameFocus() {
  const currentValue = normalizeSpaces(refs.nameInput.value);
  if (currentValue) {
    handleNameInput();
    return;
  }

  const namePool = state.studentNamePool.length ? state.studentNamePool : fallbackStudentNames;
  state.activeSuggestionIndex = -1;
  state.suggestions = namePool.slice(0, 8);
  renderSuggestions();
}

function handleNameInput() {
  const query = normalizeSpaces(refs.nameInput.value).toLowerCase();
  state.activeSuggestionIndex = -1;

  if (!query) {
    hideSuggestions();
    return;
  }

  const namePool = state.studentNamePool.length ? state.studentNamePool : fallbackStudentNames;
  state.suggestions = findNameSuggestions(namePool, query, 8);

  renderSuggestions();
}

function findNameSuggestions(namePool, query, limit) {
  const queryTokens = query.split(" ").filter(Boolean);

  const scored = namePool
    .map((name) => {
      const lowerName = name.toLowerCase();
      const nameTokens = lowerName.split(" ").filter(Boolean);

      const matchesAllTokens = queryTokens.every((token) =>
        nameTokens.some((nameToken) => nameToken.startsWith(token) || nameToken.includes(token))
      );

      if (!matchesAllTokens) {
        return null;
      }

      let score = 0;
      if (lowerName.startsWith(query)) {
        score += 4;
      }

      const wordStartHits = queryTokens.filter((token) =>
        nameTokens.some((nameToken) => nameToken.startsWith(token))
      ).length;
      score += wordStartHits * 2;

      const directHits = queryTokens.filter((token) => lowerName.includes(token)).length;
      score += directHits;

      return { name, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((entry) => entry.name);

  return scored;
}

function renderSuggestions() {
  refs.nameSuggestions.innerHTML = "";

  if (!state.suggestions.length) {
    hideSuggestions();
    return;
  }

  const fragment = document.createDocumentFragment();

  state.suggestions.forEach((name, index) => {
    const item = document.createElement("li");
    item.textContent = name;
    item.setAttribute("role", "option");

    if (index === state.activeSuggestionIndex) {
      item.classList.add("active");
    }

    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      selectSuggestion(name);
    });

    fragment.appendChild(item);
  });

  refs.nameSuggestions.appendChild(fragment);
  refs.nameSuggestions.classList.remove("hidden");
}

function handleSuggestionKeyboard(event) {
  if (refs.nameSuggestions.classList.contains("hidden")) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.activeSuggestionIndex = (state.activeSuggestionIndex + 1) % state.suggestions.length;
    renderSuggestions();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    state.activeSuggestionIndex =
      (state.activeSuggestionIndex - 1 + state.suggestions.length) % state.suggestions.length;
    renderSuggestions();
    return;
  }

  if (event.key === "Enter") {
    if (state.activeSuggestionIndex >= 0) {
      event.preventDefault();
      selectSuggestion(state.suggestions[state.activeSuggestionIndex]);
    }
    return;
  }

  if (event.key === "Escape") {
    hideSuggestions();
  }
}

function selectSuggestion(name) {
  refs.nameInput.value = toNameCase(name);
  hideSuggestions();
}

function hideSuggestions() {
  state.suggestions = [];
  state.activeSuggestionIndex = -1;
  refs.nameSuggestions.classList.add("hidden");
  refs.nameSuggestions.innerHTML = "";
}

function normalizeSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function toNameCase(value) {
  const normalized = normalizeSpaces(value).toLowerCase();
  return normalized.replace(/(^|[\s\-'.`])([a-z])/g, (match, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });
}

function setRegistrationError(fieldId, message) {
  const node = document.getElementById(fieldId + "-error");
  if (node) {
    node.textContent = message;
  }
}

function clearRegistrationErrors() {
  ["student-name", "student-nrp", "course-name", "lecturer-name"].forEach((fieldId) => {
    setRegistrationError(fieldId, "");
  });
}

function validateRegistrationForm(payload) {
  let valid = true;

  if (!payload.studentName) {
    setRegistrationError("student-name", "Nama mahasiswa wajib diisi.");
    valid = false;
  } else if (!/^[A-Za-z'.`\-\s]+$/.test(payload.studentName)) {
    setRegistrationError("student-name", "Nama hanya boleh huruf, spasi, titik, apostrof, atau tanda hubung.");
    valid = false;
  }

  if (!payload.studentNrp) {
    setRegistrationError("student-nrp", "NRP wajib diisi.");
    valid = false;
  } else if (!/^\d{10}$/.test(payload.studentNrp)) {
    setRegistrationError("student-nrp", "NRP harus 10 digit angka.");
    valid = false;
  }

  if (!payload.courseName) {
    setRegistrationError("course-name", "Mata kuliah wajib diisi.");
    valid = false;
  }

  if (!payload.lecturerName) {
    setRegistrationError("lecturer-name", "Nama dosen wajib diisi.");
    valid = false;
  }

  return valid;
}

function showRegistrationResult(message, type) {
  refs.registrationResult.textContent = message;
  refs.registrationResult.classList.remove("hidden", "error", "success");
  refs.registrationResult.classList.add(type);
}

function initDynamicDropdown() {
  fillSelectOptions(refs.productTypeSelect, Object.keys(productBrandMap), "Pilih Brand Kamera");

  refs.productTypeSelect.addEventListener("change", () => {
    const selectedType = refs.productTypeSelect.value;

    if (!selectedType) {
      refs.brandSelect.disabled = true;
      fillSelectOptions(refs.brandSelect, [], "Pilih Model Kamera");
      return;
    }

    refs.brandSelect.disabled = false;
    fillSelectOptions(refs.brandSelect, productBrandMap[selectedType], "Pilih Model Kamera");
  });
}

function fillSelectOptions(selectElement, values, placeholder) {
  const options = ["<option value=\"\">" + placeholder + "</option>"];

  values.forEach((value) => {
    options.push("<option value=\"" + value + "\">" + value + "</option>");
  });

  selectElement.innerHTML = options.join("");
}

async function initRegionSearch() {
  bindRegionEvents();

  try {
    setPostalMessage("Memuat daftar provinsi...", "");
    const provinces = await fetchAreaList(REGION_API_BASE + "/provinces.json");
    fillAreaSelect(refs.provinceSelect, provinces, "Pilih Provinsi");
    refs.provinceSelect.disabled = false;
    setPostalMessage("Pilih provinsi untuk memulai pencarian kode pos.", "");
  } catch (error) {
    refs.provinceSelect.disabled = true;
    setPostalMessage("Gagal memuat provinsi. Periksa koneksi internet lalu refresh halaman.", "error");
  }
}

function bindRegionEvents() {
  refs.provinceSelect.addEventListener("change", async () => {
    resetRegencyAndDistrict();

    const provinceId = refs.provinceSelect.value;
    const provinceName = refs.provinceSelect.selectedOptions[0]?.textContent || "";

    state.regionSelection.provinceId = provinceId;
    state.regionSelection.provinceName = provinceName;

    if (!provinceId) {
      setPostalMessage("Pilih provinsi untuk memulai pencarian kode pos.", "");
      return;
    }

    try {
      setPostalMessage("Memuat kabupaten/kota...", "");
      const regencies = await getRegencies(provinceId);
      fillAreaSelect(refs.regencySelect, regencies, "Pilih Kabupaten/Kota");
      refs.regencySelect.disabled = false;
      setPostalMessage("Lanjut pilih kabupaten/kota.", "");
    } catch (error) {
      setPostalMessage("Gagal memuat kabupaten/kota. Silakan pilih ulang provinsi.", "error");
    }
  });

  refs.regencySelect.addEventListener("change", async () => {
    resetDistrictOnly();

    const regencyId = refs.regencySelect.value;
    const regencyName = refs.regencySelect.selectedOptions[0]?.textContent || "";

    state.regionSelection.regencyId = regencyId;
    state.regionSelection.regencyName = regencyName;

    if (!regencyId) {
      setPostalMessage("Pilih kabupaten/kota untuk melanjutkan.", "");
      return;
    }

    try {
      setPostalMessage("Memuat kecamatan...", "");
      const districts = await getDistricts(regencyId);
      fillAreaSelect(refs.districtSelect, districts, "Pilih Kecamatan");
      refs.districtSelect.disabled = false;
      setPostalMessage("Pilih kecamatan untuk menampilkan kode pos.", "");
    } catch (error) {
      setPostalMessage("Gagal memuat kecamatan. Silakan pilih ulang kabupaten/kota.", "error");
    }
  });

  refs.districtSelect.addEventListener("change", async () => {
    const districtId = refs.districtSelect.value;
    const districtName = refs.districtSelect.selectedOptions[0]?.textContent || "";

    state.regionSelection.districtId = districtId;
    state.regionSelection.districtName = districtName;

    if (!districtId) {
      setPostalMessage("Pilih kecamatan untuk menampilkan kode pos.", "");
      return;
    }

    await lookupPostalCode();
  });
}

function resetRegencyAndDistrict() {
  refs.regencySelect.disabled = true;
  refs.districtSelect.disabled = true;
  fillAreaSelect(refs.regencySelect, [], "Pilih provinsi terlebih dahulu");
  fillAreaSelect(refs.districtSelect, [], "Pilih kabupaten/kota terlebih dahulu");

  state.regionSelection.regencyId = "";
  state.regionSelection.regencyName = "";
  state.regionSelection.districtId = "";
  state.regionSelection.districtName = "";
}

function resetDistrictOnly() {
  refs.districtSelect.disabled = true;
  fillAreaSelect(refs.districtSelect, [], "Pilih kabupaten/kota terlebih dahulu");

  state.regionSelection.districtId = "";
  state.regionSelection.districtName = "";
}

function fillAreaSelect(selectElement, list, placeholder) {
  const optionItems = ["<option value=\"\">" + placeholder + "</option>"];
  list.forEach((item) => {
    optionItems.push("<option value=\"" + item.id + "\">" + item.name + "</option>");
  });
  selectElement.innerHTML = optionItems.join("");
}

async function getRegencies(provinceId) {
  if (state.regionCache.regencies.has(provinceId)) {
    return state.regionCache.regencies.get(provinceId);
  }

  const list = await fetchAreaList(REGION_API_BASE + "/regencies/" + provinceId + ".json");
  state.regionCache.regencies.set(provinceId, list);
  return list;
}

async function getDistricts(regencyId) {
  if (state.regionCache.districts.has(regencyId)) {
    return state.regionCache.districts.get(regencyId);
  }

  const list = await fetchAreaList(REGION_API_BASE + "/districts/" + regencyId + ".json");
  state.regionCache.districts.set(regencyId, list);
  return list;
}

async function fetchAreaList(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  return response.json();
}

async function lookupPostalCode() {
  const selected = state.regionSelection;
  const queryCandidates = [
    selected.districtName + " " + selected.regencyName + " " + selected.provinceName,
    selected.districtName + " " + selected.regencyName,
    selected.districtName
  ];

  setPostalMessage("Mencari kode pos...", "");

  try {
    let matches = [];

    for (const query of queryCandidates) {
      const cleaned = normalizeSpaces(query);
      if (!cleaned) {
        continue;
      }

      const response = await fetch(POSTAL_API_BASE + "/search/?q=" + encodeURIComponent(cleaned));
      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      const rows = Array.isArray(payload.data) ? payload.data : [];

      if (rows.length) {
        matches = rows;
        break;
      }
    }

    if (!matches.length) {
      setPostalMessage("Kode pos belum ditemukan untuk kombinasi area ini. Coba pilih kecamatan lain.", "error");
      return;
    }

    const chosen = pickBestPostalMatch(matches, selected);
    renderPostalResult(chosen, selected);
  } catch (error) {
    setPostalMessage("Gagal menghubungi API kode pos. Coba lagi beberapa saat.", "error");
  }
}

function pickBestPostalMatch(matches, selected) {
  const normalizedProvince = normalizeRegionText(selected.provinceName);
  const normalizedRegency = normalizeRegionText(selected.regencyName);
  const normalizedDistrict = normalizeRegionText(selected.districtName);

  const exact = matches.find((row) => {
    return (
      normalizeRegionText(row.province) === normalizedProvince &&
      normalizeRegionText(row.regency) === normalizedRegency &&
      normalizeRegionText(row.district) === normalizedDistrict
    );
  });

  if (exact) {
    return exact;
  }

  const districtAndRegency = matches.find((row) => {
    return (
      normalizeRegionText(row.regency) === normalizedRegency &&
      normalizeRegionText(row.district) === normalizedDistrict
    );
  });

  return districtAndRegency || matches[0];
}

function normalizeRegionText(value) {
  return normalizeSpaces(String(value || "")).toLowerCase();
}

function renderPostalResult(postal, selected) {
  const timezone = postal.timezone || "-";

  const html = [
    "<strong>Kode Pos:</strong> <span class=\"postal-code-value\">" + postal.code + "</span>",
    "<br><strong>Provinsi:</strong> " + selected.provinceName,
    "<br><strong>Kabupaten/Kota:</strong> " + selected.regencyName,
    "<br><strong>Kecamatan:</strong> " + selected.districtName,
    "<br><strong>Zona Waktu:</strong> " + timezone
  ].join("");

  refs.postalResult.innerHTML = html;
  refs.postalResult.classList.remove("error");
}

function setPostalMessage(message, type) {
  refs.postalResult.textContent = message;
  refs.postalResult.classList.remove("error", "success");

  if (type) {
    refs.postalResult.classList.add(type);
  }
}

initApp();
