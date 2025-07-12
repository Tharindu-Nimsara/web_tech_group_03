// gallery.js - Complete version for dynamic project loading
let currentPage = 1;
const projectsPerPage = 6;
let totalProjects = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    setupFilters();
    setupSearch();
});

async function loadProjects(page = 1, filters = {}) {
    try {
        // Show loading state
        showLoadingState();
        
        const params = new URLSearchParams({
            limit: projectsPerPage,
            offset: (page - 1) * projectsPerPage,
            ...filters
        });
        
        const response = await fetch(`http://127.0.0.1/backend/api/get_projects.php?${params}`, {
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            displayProjects(result.projects);
            updateProjectCount(result.total, page);
            updatePagination(page, result.total);
            totalProjects = result.total;
            currentPage = page;
        } else {
            showErrorState('Error loading projects: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showErrorState('Failed to load projects. Please check your connection and try again.');
    }
}

function showLoadingState() {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = `
        <div class="loading-placeholder" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
            <div style="font-size: 2rem; margin-bottom: 16px;">📚</div>
            <h3>Loading Projects...</h3>
            <p>Please wait while we fetch the latest projects.</p>
        </div>
    `;
}

function showErrorState(message) {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = `
        <div class="error-placeholder" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #e53935;">
            <div style="font-size: 2rem; margin-bottom: 16px;">⚠️</div>
            <h3>Error Loading Projects</h3>
            <p>${message}</p>
            <button onclick="loadProjects()" style="
                margin-top: 20px; 
                padding: 10px 20px; 
                background: #1976d2; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer;
            ">
                Try Again
            </button>
        </div>
    `;
}

function displayProjects(projects) {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    
    if (projects.length === 0) {
        galleryGrid.innerHTML = `
            <div class="no-projects-placeholder" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 16px;">🔍</div>
                <h3>No Projects Found</h3>
                <p>No projects match your current search criteria.</p>
                <button onclick="clearFilters()" style="
                    margin-top: 20px; 
                    padding: 10px 20px; 
                    background: #1976d2; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer;
                ">
                    Clear Filters
                </button>
            </div>
        `;
        return;
    }
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        galleryGrid.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Determine card header class based on category or department
    let headerClass = 'AI'; // default
    if (project.category) {
        if (project.category.toLowerCase().includes('iot')) headerClass = 'Iot';
        else if (project.category.toLowerCase().includes('commerce') || 
                 project.category.toLowerCase().includes('business')) headerClass = 'e-comm';
    }
    
    // Get first few tags for display
    const displayTags = project.tags_array ? project.tags_array.slice(0, 3) : [];
    
    // Use project image if available, otherwise use default
    const projectImageSrc = project.project_image ? 
        `http://127.0.0.1/backend/${project.project_image}` : 
        'Images/home.jpg';
    
    card.innerHTML = `
        <div class="card-header ${headerClass}">
            <img src="${projectImageSrc}" alt="Project Image" class="card-header-img" 
                 onerror="this.src='Images/home.jpg'" />
            <h2>${project.category || 'Project'}</h2>
            <span>${project.department}</span>
        </div>
        <div class="card-content">
            <div class="card-meta">
                <span class="year">${project.year}</span>
                <span class="tag">${project.department}</span>
            </div>
            <div class="card-title">${project.title}</div>
            <div class="card-desc">
                ${project.description.length > 150 ? 
                  project.description.substring(0, 150) + '...' : 
                  project.description}
            </div>
            <div class="card-stack">
                ${displayTags.map(tag => `<span class="stack">${tag.trim()}</span>`).join('')}
            </div>
            <div class="card-footer">
                <span>${project.author_name}<br /><small>${project.year}, ${project.department}</small></span>
                <span class="view-details" onclick="viewProject(${project.project_id})">&#128065; View Details</span>
            </div>
        </div>
    `;
    
    return card;
}

function viewProject(projectId) {
    window.location.href = `detail_page.html?id=${projectId}`;
}

function updateProjectCount(total, page) {
    const startIndex = (page - 1) * projectsPerPage + 1;
    const endIndex = Math.min(page * projectsPerPage, total);
    
    const countElement = document.getElementById('projects-count');
    if (total === 0) {
        countElement.textContent = 'No projects found';
    } else {
        countElement.textContent = `Showing ${startIndex}-${endIndex} of ${total} projects`;
    }
}

function updatePagination(currentPage, totalProjects) {
    const totalPages = Math.ceil(totalProjects / projectsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    if (currentPage > 1) {
        pagination.innerHTML += `<a href="#" class="page" onclick="changePage(${currentPage - 1})">&laquo; Prev</a>`;
    }
    
    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Show first page if not in range
    if (startPage > 1) {
        pagination.innerHTML += `<a href="#" class="page" onclick="changePage(1)">1</a>`;
        if (startPage > 2) {
            pagination.innerHTML += '<span class="dots">...</span>';
        }
    }
    
    // Page numbers in range
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        pagination.innerHTML += `<a href="#" class="page ${activeClass}" onclick="changePage(${i})">${i}</a>`;
    }
    
    // Show last page if not in range
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.innerHTML += '<span class="dots">...</span>';
        }
        pagination.innerHTML += `<a href="#" class="page" onclick="changePage(${totalPages})">${totalPages}</a>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        pagination.innerHTML += `<a href="#" class="page" onclick="changePage(${currentPage + 1})">Next &raquo;</a>`;
    }
}

function changePage(page) {
    const filters = getCurrentFilters();
    loadProjects(page, filters);
    
    // Scroll to top of gallery
    document.querySelector('.gallery-headings').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function setupFilters() {
    // Load departments dynamically
    loadDepartments();
    
    // Add event listeners
    document.getElementById('departments').addEventListener('change', applyFilters);
    document.getElementById('years').addEventListener('change', applyFilters);
    document.getElementById('tags').addEventListener('change', applyFilters);
}

async function loadDepartments() {
    try {
        // For now, add common departments manually since we don't have the distinct API
        const departments = ['Computer Science', 'Software Engineering', 'Information Systems', 'Engineering', 'Business Studies'];
        const departmentSelect = document.getElementById('departments');
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-project');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300); // Debounce search
    });
    
    // Add search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

function applyFilters() {
    const filters = getCurrentFilters();
    loadProjects(1, filters);
}

function getCurrentFilters() {
    const filters = {};
    
    const search = document.getElementById('search-project').value.trim();
    if (search) filters.search = search;
    
    const department = document.getElementById('departments').value;
    if (department && department !== 'All-Departments') filters.department = department;
    
    const year = document.getElementById('years').value;
    if (year && year !== 'All-Years') filters.year = year;
    
    const category = document.getElementById('tags').value;
    if (category && category !== 'All-tags') filters.category = category;
    
    return filters;
}

function clearFilters() {
    document.getElementById('search-project').value = '';
    document.getElementById('departments').value = 'All-Departments';
    document.getElementById('years').value = 'All-Years';
    document.getElementById('tags').value = 'All-tags';
    
    loadProjects(1, {});
}