/**
 * HACCP-CMR CRM Database Helper Functions
 * Comprehensive Client Risk Assessment Form
 * Based on CRM_database.json structure
 */

// ==================== CRM DATA STRUCTURE ====================

const CRM_STRUCTURE = {
    "risk_assessment_form_fields": {
        "I_general_information": {
            "title_hu": "I. Általános Információk",
            "company_data": {
                "title_hu": "Cégadatok",
                "fields": [
                    {"key": "company_name", "label_hu": "Cégnév", "type": "text"},
                    {"key": "headquarters_address", "label_hu": "Székhely cím", "type": "text"},
                    {"key": "tax_number", "label_hu": "Adószám", "type": "text"},
                    {"key": "branch_name", "label_hu": "Vállalkozás neve (Telephely)", "type": "text"},
                    {"key": "branch_address", "label_hu": "Telephely címe", "type": "text"}
                ]
            },
            "responsible_person_data": {
                "title_hu": "Felelős Adatai",
                "fields": [
                    {"key": "responsible_manager_name", "label_hu": "Felelős vezető név", "type": "text"},
                    {"key": "appointed_contact_person_name", "label_hu": "Megbízott kapcsolattartó neve", "type": "text"},
                    {"key": "phone_number", "label_hu": "Telefonszám", "type": "text"},
                    {"key": "email", "label_hu": "Email", "type": "text"}
                ]
            }
        },
        "II_basic_data_and_work_environment": {
            "title_hu": "II. Alapadatok és Munkakörnyezet",
            "quantitative_data": {
                "title_hu": "Alapadatok",
                "fields": [
                    {"key": "number_of_employees", "label_hu": "Munkavállalók száma", "unit_hu": "fő", "type": "number"},
                    {"key": "ceiling_height", "label_hu": "Belmagasság", "unit_hu": "m", "type": "number"},
                    {"key": "floor_area", "label_hu": "Alapterület", "unit_hu": "m²", "type": "number"}
                ]
            },
            "job_roles": {
                "title_hu": "Munkakörök",
                "options_hu": [
                    "Ügyvezető", "Szakács", "Recepciós", "Mosogató", "Adminisztrátor",
                    "Konyhai kisegítő", "Raktáros", "Takarító", "Pultos", "Felszolgáló",
                    "Külsős takarító cég", "Egyéb"
                ],
                "type": "checkbox_list"
            },
            "employee_age_grouping": {
                "title_hu": "Alkalmazottak Életkori Behatárolása",
                "categories": [
                    {"key": "screen_work_over_4h_daily", "label_hu": "Képernyő előtti munkavégzés /Napi 4 óránál több/"},
                    {"key": "physical_work_manual_handling", "label_hu": "Fizikai munkakörök /Kézi anyagmozgatás/"}
                ],
                "age_groups_hu": ["18-40 éves kor között", "40-50 éves kor között", "50 éves kor felett"],
                "type": "matrix_checkbox"
            },
            "key_roles_and_activities": {
                "title_hu": "Kiemelt Munkakörök és Tevékenységek",
                "options_hu": [
                    "Vezetők (pszichés terhelés)", "Járványügyi érdekből kiemelt munkakörök",
                    "Külföldi munkavégzés", "Takarítás", "Fiatalkorú / 18. életévét be nem töltött",
                    "Idősödő / nyugdíjas"
                ],
                "type": "checkbox_list"
            },
            "chemicals": {
                "title_hu": "Vegyszerek",
                "note_hu": "Kérjük, név szerint írja be a használt vegyszereket, és küldje el a biztonságtechnikai adatlapot (MSDS) emailen.",
                "options_hu": ["Domestos", "Hypo", "Clin", "Cif", "Ultra sol", "Innosept", "Egyéb"],
                "type": "checkbox_list_with_text_input"
            }
        }
    }
};

// ==================== FORM GENERATION FUNCTIONS ====================

/**
 * Generate comprehensive CRM form
 * @param {string} containerId - Container element ID
 * @param {Object} existingData - Existing client data for editing
 */
function generateComprehensiveCRMForm(containerId, existingData = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    container.innerHTML = ''; // Clear existing content
    
    // Section I: General Information
    const sectionI = generateSectionI(existingData);
    container.appendChild(sectionI);
    
    // Section II: Basic Data and Work Environment
    const sectionII = generateSectionII(existingData);
    container.appendChild(sectionII);
    
    // Progress Bar
    const progressBar = createProgressBar();
    container.appendChild(progressBar);
    
    // Setup auto-save and event listeners
    setupFormAutoSave();
    updateFormProgress();
}

/**
 * Generate Section I: General Information
 */
function generateSectionI(existingData) {
    const section = document.createElement('div');
    section.className = 'form-section';
    section.id = 'section-I';
    
    // Section Header (Collapsible)
    const header = document.createElement('div');
    header.className = 'section-header';
    header.onclick = () => toggleSection('section-I-content');
    header.innerHTML = `
        <h3>I. Általános Információk</h3>
        <span class="toggle-icon">▼</span>
    `;
    section.appendChild(header);
    
    // Section Content
    const content = document.createElement('div');
    content.className = 'section-content';
    content.id = 'section-I-content';
    
    const structure = CRM_STRUCTURE.risk_assessment_form_fields.I_general_information;
    
    // Company Data Subsection
    const companyDataHTML = generateSubsection(
        'Cégadatok',
        structure.company_data.fields,
        existingData?.risk_assessment?.I_general_information?.company_data
    );
    content.innerHTML += companyDataHTML;
    
    // Responsible Person Data Subsection
    const responsibleDataHTML = generateSubsection(
        'Felelős Adatai',
        structure.responsible_person_data.fields,
        existingData?.risk_assessment?.I_general_information?.responsible_person_data
    );
    content.innerHTML += responsibleDataHTML;
    
    section.appendChild(content);
    return section;
}

/**
 * Generate Section II: Basic Data and Work Environment
 */
function generateSectionII(existingData) {
    const section = document.createElement('div');
    section.className = 'form-section';
    section.id = 'section-II';
    
    // Section Header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.onclick = () => toggleSection('section-II-content');
    header.innerHTML = `
        <h3>II. Alapadatok és Munkakörnyezet</h3>
        <span class="toggle-icon">▼</span>
    `;
    section.appendChild(header);
    
    // Section Content
    const content = document.createElement('div');
    content.className = 'section-content';
    content.id = 'section-II-content';
    
    const structure = CRM_STRUCTURE.risk_assessment_form_fields.II_basic_data_and_work_environment;
    
    // Quantitative Data
    const quantitativeHTML = generateSubsection(
        'Alapadatok',
        structure.quantitative_data.fields,
        existingData?.risk_assessment?.II_basic_data_and_work_environment?.quantitative_data
    );
    content.innerHTML += quantitativeHTML;
    
    // Job Roles (Checkbox List)
    const jobRolesHTML = generateCheckboxList(
        'job_roles',
        structure.job_roles.title_hu,
        structure.job_roles.options_hu,
        existingData?.risk_assessment?.II_basic_data_and_work_environment?.job_roles || []
    );
    content.innerHTML += jobRolesHTML;
    
    // Employee Age Grouping (Matrix)
    const ageMatrixHTML = generateAgeMatrix(
        structure.employee_age_grouping,
        existingData?.risk_assessment?.II_basic_data_and_work_environment?.employee_age_grouping
    );
    content.innerHTML += ageMatrixHTML;
    
    // Key Roles and Activities
    const keyRolesHTML = generateCheckboxList(
        'key_roles',
        structure.key_roles_and_activities.title_hu,
        structure.key_roles_and_activities.options_hu,
        existingData?.risk_assessment?.II_basic_data_and_work_environment?.key_roles_and_activities || []
    );
    content.innerHTML += keyRolesHTML;
    
    // Chemicals (Checkbox List with Text Input)
    const chemicalsHTML = generateCheckboxListWithText(
        'chemicals',
        structure.chemicals.title_hu,
        structure.chemicals.options_hu,
        structure.chemicals.note_hu,
        existingData?.risk_assessment?.II_basic_data_and_work_environment?.chemicals || []
    );
    content.innerHTML += chemicalsHTML;
    
    section.appendChild(content);
    return section;
}

/**
 * Generate subsection with text/number fields
 */
function generateSubsection(title, fields, existingData = {}) {
    let html = `<div class="form-subsection">
        <h4>${title}</h4>`;
    
    fields.forEach(field => {
        const value = existingData?.[field.key] || '';
        const unit = field.unit_hu ? ` (${field.unit_hu})` : '';
        
        html += `
            <div class="form-group">
                <label for="${field.key}">${field.label_hu}${unit}</label>
                <input type="${field.type}" 
                       id="${field.key}" 
                       name="${field.key}" 
                       class="form-input" 
                       value="${value}"
                       placeholder="${field.label_hu}">
            </div>
        `;
    });
    
    html += `</div>`;
    return html;
}

/**
 * Generate checkbox list
 */
function generateCheckboxList(name, title, options, selectedValues = []) {
    let html = `<div class="form-subsection">
        <h4>${title}</h4>
        <div class="checkbox-grid">`;
    
    options.forEach((option, index) => {
        const checked = selectedValues.includes(option) ? 'checked' : '';
        const id = `${name}_${index}`;
        
        html += `
            <div class="checkbox-item">
                <input type="checkbox" 
                       id="${id}" 
                       name="${name}" 
                       value="${option}"
                       ${checked}>
                <label for="${id}">${option}</label>
            </div>
        `;
    });
    
    html += `</div></div>`;
    return html;
}

/**
 * Generate age matrix (matrix checkbox)
 */
function generateAgeMatrix(config, existingData = {}) {
    let html = `<div class="form-subsection">
        <h4>${config.title_hu}</h4>
        <table class="matrix-table">
            <tr>
                <th></th>`;
    
    // Header row with age groups
    config.age_groups_hu.forEach(group => {
        html += `<th>${group}</th>`;
    });
    html += `</tr>`;
    
    // Data rows
    config.categories.forEach(category => {
        html += `<tr><td>${category.label_hu}</td>`;
        
        config.age_groups_hu.forEach(group => {
            const checked = existingData?.[category.key]?.[group] ? 'checked' : '';
            const id = `age_${category.key}_${group.replace(/\s+/g, '_')}`;
            
            html += `
                <td>
                    <input type="checkbox" 
                           id="${id}"
                           name="age_matrix_${category.key}"
                           value="${group}"
                           ${checked}>
                </td>
            `;
        });
        
        html += `</tr>`;
    });
    
    html += `</table></div>`;
    return html;
}

/**
 * Generate checkbox list with text input for "Egyéb"
 */
function generateCheckboxListWithText(name, title, options, note, selectedValues = []) {
    let html = `<div class="form-subsection">
        <h4>${title}</h4>
        <p class="form-note">${note}</p>
        <div class="checkbox-grid">`;
    
    options.forEach((option, index) => {
        const checked = selectedValues.includes(option) || (selectedValues.some && selectedValues.some(v => v.startsWith(option))) ? 'checked' : '';
        const id = `${name}_${index}`;
        
        html += `<div class="checkbox-with-input">
            <div class="checkbox-item">
                <input type="checkbox" 
                       id="${id}" 
                       name="${name}" 
                       value="${option}"
                       ${checked}>
                <label for="${id}">${option}</label>
            </div>`;
        
        // Add text input for "Egyéb"
        if (option === 'Egyéb') {
            const otherValue = selectedValues.find(v => v.startsWith('Egyéb:'))?.replace('Egyéb:', '').trim() || '';
            html += `
                <input type="text" 
                       class="form-input inline-input" 
                       id="${name}_other_text"
                       placeholder="Egyéb vegyszer neve..."
                       value="${otherValue}">
            `;
        }
        
        html += `</div>`;
    });
    
    html += `</div></div>`;
    return html;
}

/**
 * Create progress bar
 */
function createProgressBar() {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'form-progress';
    progressDiv.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" id="form-progress-fill" style="width: 0%"></div>
        </div>
        <div id="form-progress-text">Kitöltöttség: 0%</div>
    `;
    return progressDiv;
}

/**
 * Toggle section collapse/expand
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const icon = section.previousElementSibling.querySelector('.toggle-icon');
    
    if (section.style.display === 'none') {
        section.style.display = 'block';
        icon.textContent = '▼';
    } else {
        section.style.display = 'none';
        icon.textContent = '▶';
    }
}

/**
 * Setup form auto-save
 */
let formAutoSaveTimeout = null;

function setupFormAutoSave() {
    const form = document.getElementById('comprehensive-crm-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            clearTimeout(formAutoSaveTimeout);
            formAutoSaveTimeout = setTimeout(() => {
                saveComprehensiveClientData();
                updateFormProgress();
            }, 1000); // 1 second debounce
        });
    });
}

/**
 * Save comprehensive client data
 */
function saveComprehensiveClientData() {
    if (!window.editingClientId) {
        console.log('No client being edited - skipping auto-save');
        return;
    }
    
    const clientData = collectComprehensiveCRMData();
    
    // Update client in global clients object
    window.clients[window.editingClientId] = {
        ...window.clients[window.editingClientId],
        ...clientData,
        updatedAt: Date.now()
    };
    
    // Save to localStorage
    window.saveToStorage('clients', window.clients);
    
    console.log('✅ Comprehensive client data auto-saved');
}

/**
 * Collect all CRM form data
 */
function collectComprehensiveCRMData() {
    const data = {
        risk_assessment: {
            I_general_information: {
                company_data: {},
                responsible_person_data: {}
            },
            II_basic_data_and_work_environment: {
                quantitative_data: {},
                job_roles: [],
                employee_age_grouping: {},
                key_roles_and_activities: [],
                chemicals: []
            }
        }
    };
    
    // Collect Section I data
    const section1Structure = CRM_STRUCTURE.risk_assessment_form_fields.I_general_information;
    
    section1Structure.company_data.fields.forEach(field => {
        const input = document.getElementById(field.key);
        if (input) {
            data.risk_assessment.I_general_information.company_data[field.key] = input.value;
        }
    });
    
    section1Structure.responsible_person_data.fields.forEach(field => {
        const input = document.getElementById(field.key);
        if (input) {
            data.risk_assessment.I_general_information.responsible_person_data[field.key] = input.value;
        }
    });
    
    // Collect Section II data
    const section2Structure = CRM_STRUCTURE.risk_assessment_form_fields.II_basic_data_and_work_environment;
    
    // Quantitative data
    section2Structure.quantitative_data.fields.forEach(field => {
        const input = document.getElementById(field.key);
        if (input) {
            data.risk_assessment.II_basic_data_and_work_environment.quantitative_data[field.key] = 
                field.type === 'number' ? parseFloat(input.value) || null : input.value;
        }
    });
    
    // Job roles
    data.risk_assessment.II_basic_data_and_work_environment.job_roles = 
        getCheckedValues('job_roles');
    
    // Age matrix
    data.risk_assessment.II_basic_data_and_work_environment.employee_age_grouping = 
        getMatrixValues();
    
    // Key roles
    data.risk_assessment.II_basic_data_and_work_environment.key_roles_and_activities = 
        getCheckedValues('key_roles');
    
    // Chemicals
    data.risk_assessment.II_basic_data_and_work_environment.chemicals = 
        getCheckedValuesWithText('chemicals');
    
    return data;
}

/**
 * Get checked checkbox values
 */
function getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Get checked values with text input (for "Egyéb")
 */
function getCheckedValuesWithText(name) {
    const values = [];
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    
    checkboxes.forEach(cb => {
        if (cb.value === 'Egyéb') {
            const textInput = document.getElementById(`${name}_other_text`);
            if (textInput && textInput.value.trim()) {
                values.push('Egyéb: ' + textInput.value.trim());
            } else {
                values.push('Egyéb');
            }
        } else {
            values.push(cb.value);
        }
    });
    
    return values;
}

/**
 * Get matrix checkbox values
 */
function getMatrixValues() {
    const matrix = {};
    const categories = CRM_STRUCTURE.risk_assessment_form_fields.II_basic_data_and_work_environment.employee_age_grouping.categories;
    
    categories.forEach(category => {
        const checkboxes = document.querySelectorAll(`input[name="age_matrix_${category.key}"]:checked`);
        matrix[category.key] = Array.from(checkboxes).map(cb => cb.value);
    });
    
    return matrix;
}

/**
 * Update form progress
 */
function updateFormProgress() {
    const clientData = collectComprehensiveCRMData();
    const completion = calculateCompletionPercentage(clientData);
    
    const progressFill = document.getElementById('form-progress-fill');
    const progressText = document.getElementById('form-progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = completion + '%';
        progressText.textContent = 'Kitöltöttség: ' + completion + '%';
    }
}

/**
 * Calculate completion percentage
 */
function calculateCompletionPercentage(data) {
    let totalFields = 0;
    let filledFields = 0;
    
    function countFields(obj) {
        for (let key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                countFields(obj[key]);
            } else {
                totalFields++;
                if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
                    if (Array.isArray(obj[key]) && obj[key].length > 0) {
                        filledFields++;
                    } else if (!Array.isArray(obj[key])) {
                        filledFields++;
                    }
                }
            }
        }
    }
    
    countFields(data);
    
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.generateComprehensiveCRMForm = generateComprehensiveCRMForm;
    window.toggleSection = toggleSection;
    window.setupFormAutoSave = setupFormAutoSave;
    window.saveComprehensiveClientData = saveComprehensiveClientData;
    window.updateFormProgress = updateFormProgress;
    window.CRM_STRUCTURE = CRM_STRUCTURE;
}

console.log('✅ CRM Form Helper Functions Loaded');
