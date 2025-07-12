// upload.js
let selectedProjectImage = null;

document.addEventListener('DOMContentLoaded', function() {
    setupTagsInput();
    setupFormSubmission();
    setupPhotoUpload();
});

// Tags input functionality
function setupTagsInput() {
    const tagsInput = document.getElementById('tags-input');
    const tagsPreview = document.getElementById('tags-preview');
    
    tagsInput.addEventListener('input', function() {
        updateTagsPreview();
    });
    
    tagsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateTagsPreview();
        }
    });
}

function updateTagsPreview() {
    const tagsInput = document.getElementById('tags-input');
    const tagsPreview = document.getElementById('tags-preview');
    const tagsValue = tagsInput.value.trim();
    
    tagsPreview.innerHTML = '';
    
    if (tagsValue) {
        const tags = tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-preview';
            tagElement.style.cssText = `
                background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                color: #1976d2;
                border-radius: 12px;
                padding: 4px 12px;
                font-size: 0.9rem;
                font-weight: 500;
                display: inline-block;
            `;
            tagElement.textContent = tag;
            tagsPreview.appendChild(tagElement);
        });
    }
}

// Form submission functionality
function setupFormSubmission() {
    const uploadButton = document.querySelector('.upload-project-button');
    
    // Remove the href and add click handler
    uploadButton.removeAttribute('href');
    uploadButton.style.cursor = 'pointer';
    uploadButton.addEventListener('click', handleUpload);
}

async function handleUpload(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    const uploadButton = e.target;
    const originalText = uploadButton.textContent;
    uploadButton.textContent = 'Uploading...';
    uploadButton.style.pointerEvents = 'none';
    uploadButton.style.opacity = '0.7';
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        // Send to backend
        const response = await fetch('http://127.0.0.1/backend/api/upload_project.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Project uploaded successfully!');
            // Clear form
            clearForm();
            // Redirect to gallery or project detail page
            if (result.project_id) {
                window.location.href = `detail_page.html?id=${result.project_id}`;
            } else {
                window.location.href = 'gallery.html';
            }
        } else {
            alert('Error uploading project: ' + (result.message || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading project. Please try again.');
    } finally {
        // Reset button state
        uploadButton.textContent = originalText;
        uploadButton.style.pointerEvents = 'auto';
        uploadButton.style.opacity = '1';
    }
}

function validateForm() {
    const requiredFields = [
        { id: 'project-title', name: 'Project Title' },
        { id: 'project-desc', name: 'Project Description' },
        { id: 'department', name: 'Department' },
        { id: 'year', name: 'Year' }
    ];
    
    let isValid = true;
    let firstInvalidField = null;
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        
        // Remove previous error styling
        element.style.borderColor = '';
        
        if (!value || (field.id === 'department' && value === 'Select-your-department')) {
            element.style.borderColor = '#e53935';
            isValid = false;
            
            if (!firstInvalidField) {
                firstInvalidField = element;
            }
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields (marked with *)');
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
    }
    
    // Validate URLs if provided
    const githubUrl = document.getElementById('git-repo-name').value.trim();
    const demoUrl = document.getElementById('demo-url').value.trim();
    
    if (githubUrl && !isValidUrl(githubUrl)) {
        alert('Please enter a valid GitHub URL');
        document.getElementById('git-repo-name').focus();
        return false;
    }
    
    if (demoUrl && !isValidUrl(demoUrl)) {
        alert('Please enter a valid Demo URL');
        document.getElementById('demo-url').focus();
        return false;
    }
    
    return isValid;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function collectFormData() {
    const formData = new FormData();
    
    // Basic project information
    formData.append('title', document.getElementById('project-title').value.trim());
    formData.append('category', document.getElementById('project-category').value.trim());
    formData.append('description', document.getElementById('project-desc').value.trim());
    formData.append('department', document.getElementById('department').value);
    formData.append('year', document.getElementById('year').value.trim());
    
    // Tags
    const tagsValue = document.getElementById('tags-input').value.trim();
    formData.append('tags', tagsValue);
    
    // Additional information
    formData.append('abstract', document.getElementById('project-abstract').value.trim());
    formData.append('github_link', document.getElementById('git-repo-name').value.trim());
    formData.append('demo_url', document.getElementById('demo-url').value.trim());
    
    // Project image
    if (selectedProjectImage) {
        formData.append('project_image', selectedProjectImage);
    }
    
    return formData;
}

function clearForm() {
    // Clear text inputs
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '';
    });
    
    // Reset select
    document.getElementById('department').value = 'Select-your-department';
    
    // Clear tags preview
    document.getElementById('tags-preview').innerHTML = '';
}

// Real-time validation feedback
document.addEventListener('DOMContentLoaded', function() {
    const requiredFields = ['project-title', 'project-desc', 'department', 'year'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(229, 57, 53)') {
                    validateField(this);
                }
            });
        }
    });
});

function validateField(field) {
    const value = field.value.trim();
    const isValid = value && (field.id !== 'department' || value !== 'Select-your-department');
    
    if (isValid) {
        field.style.borderColor = '#4caf50';
        setTimeout(() => {
            field.style.borderColor = '';
        }, 2000);
    } else {
        field.style.borderColor = '#e53935';
    }
}

// Auto-save draft functionality (optional)
let autoSaveTimer;

function setupAutoSave() {
    const formElements = document.querySelectorAll('input, textarea, select');
    
    formElements.forEach(element => {
        element.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveDraft, 2000); // Save after 2 seconds of inactivity
        });
    });
}

function saveDraft() {
    const draftData = {
        title: document.getElementById('project-title').value.trim(),
        category: document.getElementById('project-category').value.trim(),
        description: document.getElementById('project-desc').value.trim(),
        department: document.getElementById('department').value,
        year: document.getElementById('year').value.trim(),
        tags: document.getElementById('tags-input').value.trim(),
        abstract: document.getElementById('project-abstract').value.trim(),
        github_link: document.getElementById('git-repo-name').value.trim(),
        demo_url: document.getElementById('demo-url').value.trim(),
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('project_draft', JSON.stringify(draftData));
    
    // Show brief save indicator
    showSaveIndicator();
}

function loadDraft() {
    const draftData = localStorage.getItem('project_draft');
    if (draftData) {
        try {
            const data = JSON.parse(draftData);
            
            // Ask user if they want to restore the draft
            if (confirm('Found a saved draft. Would you like to restore it?')) {
                document.getElementById('project-title').value = data.title || '';
                document.getElementById('project-category').value = data.category || '';
                document.getElementById('project-desc').value = data.description || '';
                document.getElementById('department').value = data.department || 'Select-your-department';
                document.getElementById('year').value = data.year || '';
                document.getElementById('tags-input').value = data.tags || '';
                document.getElementById('project-abstract').value = data.abstract || '';
                document.getElementById('git-repo-name').value = data.github_link || '';
                document.getElementById('demo-url').value = data.demo_url || '';
                
                // Update tags preview
                updateTagsPreview();
            }
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
}

function clearDraft() {
    localStorage.removeItem('project_draft');
}

function showSaveIndicator() {
    // Create or update save indicator
    let indicator = document.getElementById('save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        indicator.textContent = 'Draft saved';
        document.body.appendChild(indicator);
    }
    
    indicator.style.opacity = '1';
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Initialize auto-save and load draft on page load
document.addEventListener('DOMContentLoaded', function() {
    setupAutoSave();
    loadDraft();
});

// Clear draft on successful upload
function handleSuccessfulUpload() {
    clearDraft();
}

// Photo Upload Functionality
function setupPhotoUpload() {
    const photoInput = document.getElementById('project-image-input');
    const uploadArea = document.getElementById('photo-upload-area');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    
    // Click to upload
    uploadPlaceholder.addEventListener('click', function() {
        photoInput.click();
    });
    
    // File input change
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
}

function handleImageFile(file) {
    // Validate file
    if (!validateImageFile(file)) {
        return;
    }
    
    // Show loading state
    const uploadArea = document.getElementById('photo-upload-area');
    uploadArea.classList.add('image-uploading');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedProjectImage = file;
        showImagePreview(e.target.result);
        uploadArea.classList.remove('image-uploading');
    };
    
    reader.onerror = function() {
        alert('Error reading image file');
        uploadArea.classList.remove('image-uploading');
    };
    
    reader.readAsDataURL(file);
}

function validateImageFile(file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, JPG, or PNG)');
        return false;
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Image file is too large. Maximum size is 10MB.');
        return false;
    }
    
    return true;
}

function showImagePreview(imageSrc) {
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    
    uploadPlaceholder.style.display = 'none';
    imagePreview.style.display = 'block';
    previewImg.src = imageSrc;
}

function changeImage() {
    document.getElementById('project-image-input').click();
}

function removeImage() {
    selectedProjectImage = null;
    
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const imagePreview = document.getElementById('image-preview');
    const photoInput = document.getElementById('project-image-input');
    
    uploadPlaceholder.style.display = 'block';
    imagePreview.style.display = 'none';
    photoInput.value = '';
}