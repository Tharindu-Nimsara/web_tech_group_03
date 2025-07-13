// detail_page.js - Complete functionality for project detail page

// API Configuration
const API_BASE_URL = 'http://127.0.0.1/backend';

document.addEventListener('DOMContentLoaded', function() {
    loadProjectDetails();
});

async function loadProjectDetails() {
    try {
        // Get project ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            showError('Project ID not found in URL');
            return;
        }

        console.log('Loading project details for ID:', projectId); // Debug log

        // Show loading state
        showLoading();

        // Fetch project details
        const response = await fetch(`${API_BASE_URL}/api/project_details.php?id=${projectId}`, {
            credentials: 'include'
        });

        console.log('Response status:', response.status); // Debug log
        
        const result = await response.json();
        console.log('API Result:', result); // Debug log
        
        if (result.status === 'success') {
            populateProjectDetails(result.project);
        } else {
            showError('Project not found: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showError('Failed to load project details. Please check your connection.');
    }
}

function showLoading() {
    document.getElementById('project-title').textContent = 'Loading project...';
    document.getElementById('project-description').textContent = 'Please wait while we load the project details.';
}

function showError(message) {
    document.getElementById('project-title').textContent = 'Error Loading Project';
    document.getElementById('project-description').innerHTML = `
        <div style="color: #e53935; padding: 20px; background: #ffebee; border-radius: 8px; margin: 10px 0;">
            <strong>Error:</strong> ${message}
            <br><br>
            <button onclick="window.history.back()" style="
                padding: 8px 16px; 
                background: #1976d2; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
            ">
                Go Back
            </button>
        </div>
    `;
}


function populateProjectDetails(project) {
    // Update project title and description
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-description').textContent = project.description;
    
    // Update project tags
    updateProjectTags(project.tags_array);
    
    // Update project actions (GitHub and Demo links)
    updateProjectActions(project.github_link, project.demo_url);
    
    // Update abstract
    updateAbstract(project.abstract);
    
    // Update author information
    updateAuthorInfo(project);
    
    // Update project image
    updateProjectImage(project.project_image);
    
    // Update page title
    document.title = `${project.title} - USJ Projects`;
}


function updateProjectTags(tagsArray) {
    const tagsContainer = document.getElementById('project-tags');
    tagsContainer.innerHTML = '';
    
    if (tagsArray && tagsArray.length > 0) {
        tagsArray.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.className = 'bttn';
            tagButton.textContent = tag.trim();
            tagsContainer.appendChild(tagButton);
        });
    }
}

function updateProjectActions(githubLink, demoUrl) {
    const githubBtn = document.getElementById('github-btn');
    const demoBtn = document.getElementById('demo-btn');
    const shareBtn = document.getElementById('share-btn');
    
    // GitHub link
    if (githubLink && githubLink.trim()) {
        githubBtn.href = githubLink;
        githubBtn.target = '_blank';
        githubBtn.style.display = 'inline-flex';
    } else {
        githubBtn.style.display = 'none';
    }
    
    // Demo link
    if (demoUrl && demoUrl.trim()) {
        demoBtn.href = demoUrl;
        demoBtn.target = '_blank';
        demoBtn.style.display = 'inline-flex';
    } else {
        demoBtn.style.display = 'none';
    }
    
    // Share functionality
    shareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        shareProject();
    });
}

function updateAbstract(abstract) {
    const abstractSection = document.getElementById('abstract-section');
    const abstractText = document.getElementById('project-abstract');
    
    if (abstract && abstract.trim()) {
        abstractText.textContent = abstract;
        abstractSection.style.display = 'block';
    } else {
        abstractSection.style.display = 'none';
    }
}

function updateProjectFiles(filePaths) {
    const filesSection = document.getElementById('project-files-section');
    const fileList = document.getElementById('file-list');
    
    if (filePaths && filePaths.length > 0) {
        fileList.innerHTML = '';
        
        filePaths.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'label-style';
            fileItem.innerHTML = `
                <label>${file.filename}</label>
                <button onclick="downloadFile('${file.path}', '${file.filename}')">
                    <img src="Images/download-icon.png" alt="" height="25px"> Download
                </button>
            `;
            fileList.appendChild(fileItem);
        });
        
        filesSection.style.display = 'block';
    } else {
        filesSection.style.display = 'none';
    }
}

function updateAuthorInfo(project) {
    // Update author name and email
    const authorName = document.getElementById('author-name');
    const authorEmail = document.getElementById('author-email');
    
    authorName.textContent = project.author_name;
    authorEmail.textContent = project.author_email;
    authorEmail.href = `mailto:${project.author_email}`;
    
    // Update author photo if available
    const authorImage = document.getElementById('author-image');
    if (project.author_photo) {
        authorImage.src = `${API_BASE_URL}/${project.author_photo}`;
    }
    
    // Update department and year
    document.getElementById('author-department').textContent = project.author_department;
    document.getElementById('author-year').textContent = project.author_year;
}

function updateProjectImage(projectImagePath) {
    const projectImageBox = document.querySelector('.box');
    
    if (projectImagePath) {
        // Create image element if project has an image
        const img = document.createElement('img');
        img.src = `${API_BASE_URL}/${projectImagePath}`;
        img.alt = 'Project Image';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 16px;
        `;
        img.onerror = function() {
            // If image fails to load, keep the default box
            this.style.display = 'none';
        };
        
        // Clear box and add image
        projectImageBox.innerHTML = '';
        projectImageBox.appendChild(img);
    } else {
        // Keep the default empty box styling if no image
        projectImageBox.style.background = '#e3f2fd';
    }
}

function downloadFile(filePath, filename) {
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/${filePath}`;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareProject() {
    if (navigator.share) {
        navigator.share({
            title: document.getElementById('project-title').textContent,
            text: document.getElementById('project-description').textContent,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Project link copied to clipboard!');
        }).catch(() => {
            // If clipboard API fails, show the URL in a prompt
            prompt('Copy this link:', window.location.href);
        });
    }
}