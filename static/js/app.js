// State management
let familyMembers = [];
let relationships = [];
let events = [];
let membersById = new Map();
let renderedMemberIds = new Set();
let zoomLevel = 1;
let selectedMemberId = null;
let selectedEventId = null;

// DOM elements - will be initialized after DOM loads
let familyTreeTab, timelineTab, addMemberTab, addEventTab;
let familyTreeSection, timelineSection, addMemberSection, addEventSection;
let treeContainer, memberDetails, eventDetails;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Application initializing...');
    console.log('DOM ready, checking elements...');
    
    // Initialize DOM elements after DOM is loaded
    familyTreeTab = document.getElementById('family-tree-tab');
    timelineTab = document.getElementById('timeline-tab');
    addMemberTab = document.getElementById('add-member-tab');
    addEventTab = document.getElementById('add-event-tab');
    
    familyTreeSection = document.getElementById('family-tree-section');
    timelineSection = document.getElementById('timeline-section');
    addMemberSection = document.getElementById('add-member-section');
    addEventSection = document.getElementById('add-event-section');
    
    treeContainer = document.getElementById('tree');
    memberDetails = document.getElementById('member-details');
    eventDetails = document.getElementById('event-details');
    
    // Debug: Check if elements are found
    console.log('DOM Elements Found:');
    console.log('- familyTreeTab:', !!familyTreeTab);
    console.log('- timelineTab:', !!timelineTab);
    console.log('- familyTreeSection:', !!familyTreeSection);
    console.log('- timelineSection:', !!timelineSection);
    console.log('- treeContainer:', !!treeContainer);
    console.log('- memberDetails:', !!memberDetails);
    console.log('- eventDetails:', !!eventDetails);    // Hide modal on startup and set default state
    const modal = document.getElementById('relationship-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        modal.classList.remove('active');
    }
    
    // Setup event listeners first
    setupEventListeners();
    
    // Load data first, then show family tree
    console.log('🔄 Starting data loading...');
    
    // New, robust data loading sequence
    Promise.all([loadStatistics(), loadFamilyData()])
        .then(() => {
            console.log('✅ All initial data loaded successfully');
            // Show the family tree by default after all data is loaded
            showSection('family-tree');
        })
        .catch(error => {
            console.error('❌ Failed to load initial data:', error);
            // Still show the UI, which will likely display an error message from the failed function
            showSection('family-tree');
        });
    
    console.log('✅ Application initialized successfully');
});

// Add escape key handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeRelationshipModal();
    }
});

function setupEventListeners() {
    // Tab navigation - with null checks
    if (familyTreeTab) familyTreeTab.addEventListener('click', () => showSection('family-tree'));
    if (timelineTab) timelineTab.addEventListener('click', () => showSection('timeline'));
    if (addMemberTab) addMemberTab.addEventListener('click', () => showSection('add-member'));
    if (addEventTab) addEventTab.addEventListener('click', () => showSection('add-event'));

    // Tree controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const centerBtn = document.getElementById('center-tree');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            zoomLevel += 0.1;
            updateTreeZoom();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (zoomLevel > 0.2) {
                zoomLevel -= 0.1;
                updateTreeZoom();
            }
        });
    }
    
    if (centerBtn) centerBtn.addEventListener('click', centerTree);

    // Forms
    const addMemberForm = document.getElementById('add-member-form');
    const addEventForm = document.getElementById('add-event-form');
    const addRelationshipForm = document.getElementById('add-relationship-form');
    
    if (addMemberForm) addMemberForm.addEventListener('submit', handleAddMember);
    if (addEventForm) addEventForm.addEventListener('submit', handleAddEvent);
    if (addRelationshipForm) addRelationshipForm.addEventListener('submit', handleAddRelationship);

    // Modal controls - dengan null checks dan error prevention
    const cancelRelationshipBtn = document.getElementById('cancel-relationship');
    const closeRelationshipBtn = document.getElementById('close-relationship-modal');
    const relationshipModal = document.getElementById('relationship-modal');
    
    if (cancelRelationshipBtn) {
        cancelRelationshipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeRelationshipModal();
        });
    }
    if (closeRelationshipBtn) {
        closeRelationshipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeRelationshipModal();
        });
    }
    
    // Close modal when clicking outside
    if (relationshipModal) {
        relationshipModal.addEventListener('click', (e) => {
            if (e.target.id === 'relationship-modal') {
                closeRelationshipModal();
            }
        });
    }

    // Member action buttons
    const editMemberBtn = document.getElementById('edit-member-btn');
    const deleteMemberBtn = document.getElementById('delete-member-btn');
    const editEventBtn = document.getElementById('edit-event-btn');
    const deleteEventBtn = document.getElementById('delete-event-btn');
    
    if (editMemberBtn) editMemberBtn.addEventListener('click', handleEditMember);
    if (deleteMemberBtn) deleteMemberBtn.addEventListener('click', handleDeleteMember);
    if (editEventBtn) editEventBtn.addEventListener('click', handleEditEvent);
    if (deleteEventBtn) deleteEventBtn.addEventListener('click', handleDeleteEvent);
}

function showSection(section) {
    console.log('🔄 showSection called with:', section);
    
    // Reset all tabs - with null checks
    [familyTreeTab, timelineTab, addMemberTab, addEventTab].forEach(tab => {
        if (tab) {
            tab.classList.remove('bg-indigo-600', 'text-white');
            tab.classList.add('bg-gray-200', 'text-gray-700');
        }
    });

    // Hide all sections - with null checks
    [familyTreeSection, timelineSection, addMemberSection, addEventSection].forEach(sec => {
        if (sec) {
            sec.classList.add('hidden');
        }
    });

    // Show selected section and update active tab
    switch (section) {
        case 'family-tree':
            console.log('📋 Showing family tree section');
            console.log('📋 familyTreeSection element:', familyTreeSection);
            if (familyTreeSection) {
                familyTreeSection.classList.remove('hidden');
                console.log('📋 Removed hidden class from family tree section');
            }
            if (familyTreeTab) {
                familyTreeTab.classList.remove('bg-gray-200', 'text-gray-700');
                familyTreeTab.classList.add('bg-indigo-600', 'text-white');
                console.log('📋 Updated family tree tab styling');
            }
            console.log('📋 About to call renderFamilyTree from showSection');
            renderFamilyTree();
            break;
        case 'timeline':
            if (timelineSection) timelineSection.classList.remove('hidden');
            if (timelineTab) {
                timelineTab.classList.remove('bg-gray-200', 'text-gray-700');
                timelineTab.classList.add('bg-indigo-600', 'text-white');
            }
            renderTimeline();
            break;
        case 'add-member':
            if (addMemberSection) addMemberSection.classList.remove('hidden');
            if (addMemberTab) {
                addMemberTab.classList.remove('bg-gray-200', 'text-gray-700');
                addMemberTab.classList.add('bg-indigo-600', 'text-white');
            }
            break;
        case 'add-event':
            if (addEventSection) addEventSection.classList.remove('hidden');
            if (addEventTab) {
                addEventTab.classList.remove('bg-gray-200', 'text-gray-700');
                addEventTab.classList.add('bg-indigo-600', 'text-white');
            }
            populatePeopleCheckboxes();
            break;
    }
}

// API Functions
async function loadStatistics() {
    try {
        console.log('📊 Loading statistics...');
        
        // Test if server is reachable first
        const response = await axios.get('/api/statistics', {
            timeout: 5000,
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        });
        
        const stats = response.data;
        console.log('📊 Loaded statistics:', stats);
        
        // Update UI with null checks
        const totalPeopleEl = document.getElementById('total-people');
        const totalRelationshipsEl = document.getElementById('total-relationships');
        const totalEventsEl = document.getElementById('total-events');
        const genderStatsEl = document.getElementById('gender-stats');
        
        console.log('📊 Updating statistics in UI...');
        if (totalPeopleEl) {
            totalPeopleEl.textContent = stats.total_people || 0;
            console.log('✅ Updated total people:', stats.total_people);
        } else {
            console.warn('⚠️ total-people element not found');
        }
        
        if (totalRelationshipsEl) {
            totalRelationshipsEl.textContent = stats.total_relationships || 0;
            console.log('✅ Updated total relationships:', stats.total_relationships);
        } else {
            console.warn('⚠️ total-relationships element not found');
        }
        
        if (totalEventsEl) {
            totalEventsEl.textContent = stats.total_events || 0;
            console.log('✅ Updated total events:', stats.total_events);
        } else {
            console.warn('⚠️ total-events element not found');
        }
        
        if (genderStatsEl) {
            const maleCount = stats.gender_distribution?.male || 0;
            const femaleCount = stats.gender_distribution?.female || 0;
            genderStatsEl.textContent = `L: ${maleCount}, P: ${femaleCount}`;
            console.log('✅ Updated gender stats:', maleCount, femaleCount);
        } else {
            console.warn('⚠️ gender-stats element not found');
        }
        
        console.log('✅ Statistics loaded and displayed successfully');
        return stats;
        
    } catch (error) {
        console.error('❌ Error loading statistics:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Show error notification
        showNotification('❌ Error loading statistics: ' + error.message, 'error');
        
        // Set default values
        const defaultStats = { total_people: 0, total_relationships: 0, total_events: 0 };
        return defaultStats;
    }
}

async function loadFamilyData() {
    console.log('🔄 Loading family data...');
    try {
        const [peopleRes, relationshipsRes, eventsRes] = await Promise.all([
            axios.get('/api/people'),
            axios.get('/api/relationships'),
            axios.get('/api/events')
        ]);

        familyMembers = peopleRes.data;
        relationships = relationshipsRes.data;
        events = eventsRes.data;

        console.log('✅ Data fetched successfully:', {
            people: familyMembers.length,
            relationships: relationships.length,
            events: events.length
        });
        
        // Process data into a tree structure
        membersById.clear();
        const allMembers = familyMembers.map(m => ({ ...m, children: [], spouses: [], parents: [], siblings: [] }));
        allMembers.forEach(m => membersById.set(m._id, m));

        relationships.forEach(r => {
            const p1 = membersById.get(r.person_id_1);
            const p2 = membersById.get(r.person_id_2);
            if (!p1 || !p2) {
                console.warn('Could not find person for relationship:', r);
                return;
            }

            switch (r.type) {
                case 'spouse':
                    p1.spouses.push(p2);
                    p2.spouses.push(p1);
                    break;
                case 'parent_of': // p1 is parent of p2
                    p1.children.push(p2);
                    p2.parents.push(p1);
                    break;
                case 'child': // p1 is child of p2
                    p2.children.push(p1);
                    p1.parents.push(p2);
                    break;
                case 'sibling':
                    // Although the rendering logic doesn't explicitly use this yet,
                    // it's good practice to process the relationship.
                    if (!p1.siblings) p1.siblings = [];
                    if (!p2.siblings) p2.siblings = [];
                    p1.siblings.push(p2);
                    p2.siblings.push(p1);
                    break;
            }
        });
        
        for (const member of membersById.values()) {
            if (member.spouses.length > 0) {
                const allChildren = new Set(member.children.map(c => c._id));
                member.spouses.forEach(spouse => {
                    spouse.children.forEach(child => allChildren.add(child._id));
                });
                
                const sharedChildren = Array.from(allChildren)
                    .map(id => membersById.get(id))
                    .filter(Boolean);
                
                member.children = sharedChildren;
                member.spouses.forEach(spouse => {
                    spouse.children = sharedChildren;
                });
            }
        }
        
        console.log('🌳 Tree data processed:', membersById);

    } catch (error) {
        console.error('❌ Error loading family data:', error);
        showNotification('Gagal memuat data keluarga. Silakan coba lagi.', 'error');
    }
}

// Family Tree Functions
function renderFamilyTree() {
    console.log('🌳 renderFamilyTree called');
    const currentTreeContainer = treeContainer || document.getElementById('tree');
    if (!currentTreeContainer) {
        console.error('Tree container not found!');
        return;
    }
    // Clear previous content and set up for positioning
    currentTreeContainer.innerHTML = '';
    currentTreeContainer.style.position = 'relative';

    // SVG layer for relationship lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'relationship-svg';
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    
    // Define markers for arrows
    svg.innerHTML = `
        <defs>
            <marker id="arrow-parent_of" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" class="fill-current text-blue-500">
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
    `;
    currentTreeContainer.appendChild(svg);

    const visited = new Set();
    familyMembers.forEach(startMember => {
        if (visited.has(startMember._id)) {
            return;
        }

        // 1. Find all members of the group using BFS
        const groupMemberIds = new Set();
        const queue = [startMember._id];
        const groupVisited = new Set([startMember._id]);
        
        while (queue.length > 0) {
            const currentMemberId = queue.shift();
            visited.add(currentMemberId);
            groupMemberIds.add(currentMemberId);

            const memberNode = membersById.get(currentMemberId);
            if (!memberNode) continue;

            const connections = [
                ...memberNode.parents,
                ...memberNode.children,
                ...memberNode.spouses,
                ...memberNode.siblings
            ];

            connections.forEach(relatedMember => {
                if (relatedMember && !groupVisited.has(relatedMember._id)) {
                    groupVisited.add(relatedMember._id);
                    queue.push(relatedMember._id);
                }
            });
        }

        // 2. Assign generation levels within the group
        const memberLevels = new Map();
        const levelQueue = [];

        // Find roots (nodes with no parents within the group)
        groupMemberIds.forEach(memberId => {
            const node = membersById.get(memberId);
            if (!node) return;
            const hasParentsInGroup = node.parents.some(p => groupMemberIds.has(p._id));
            if (!hasParentsInGroup) {
                levelQueue.push({ id: memberId, level: 0 });
                memberLevels.set(memberId, 0);
            }
        });

        // Fallback if no root is found (e.g., a cycle or isolated group of siblings)
        if (levelQueue.length === 0 && groupMemberIds.size > 0) {
            const firstMemberId = groupMemberIds.values().next().value;
            levelQueue.push({ id: firstMemberId, level: 0 });
            memberLevels.set(firstMemberId, 0);
        }

        let head = 0;
        while(head < levelQueue.length) {
            const { id, level } = levelQueue[head++];
            const node = membersById.get(id);
            if (!node) continue;

            // Assign same level to spouses
            node.spouses.forEach(spouse => {
                if (groupMemberIds.has(spouse._id) && !memberLevels.has(spouse._id)) {
                    memberLevels.set(spouse._id, level);
                }
            });

            // Queue children for the next level
            node.children.forEach(child => {
                if (groupMemberIds.has(child._id) && !memberLevels.has(child._id)) {
                    memberLevels.set(child._id, level + 1);
                    levelQueue.push({ id: child._id, level: level + 1 });
                }
            });
        }
        
        // Assign a default level to any unreached nodes
        groupMemberIds.forEach(id => {
            if (!memberLevels.has(id)) {
                memberLevels.set(id, 0);
            }
        });

        // 3. Render the group by levels
        const groupContainer = document.createElement('div');
        groupContainer.className = 'family-group flex flex-col items-center border-2 border-dashed border-gray-300 p-8 mb-8 rounded-lg';
        currentTreeContainer.appendChild(groupContainer);

        const levels = new Map();
        memberLevels.forEach((level, memberId) => {
            if (!levels.has(level)) levels.set(level, []);
            levels.get(level).push(memberId);
        });

        const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b);

        sortedLevels.forEach(level => {
            const levelContainer = document.createElement('div');
            levelContainer.className = 'generation-level flex flex-wrap justify-center items-start gap-x-12 gap-y-8 my-10 relative';
            
            const membersInLevel = levels.get(level);
            const renderedInLevel = new Set();

            membersInLevel.forEach(memberId => {
                if (renderedInLevel.has(memberId)) return;

                const memberData = membersById.get(memberId);
                if (!memberData) return;

                const coupleUnit = document.createElement('div');
                coupleUnit.className = 'couple-unit flex items-start gap-x-4';

                const card = createMemberCard(memberData);
                card.id = `member-card-${memberData._id}`;
                coupleUnit.appendChild(card);
                renderedInLevel.add(memberId);

                // Group spouses together
                memberData.spouses.forEach(spouse => {
                    if (membersInLevel.includes(spouse._id) && !renderedInLevel.has(spouse._id)) {
                        const spouseCard = createMemberCard(spouse);
                        spouseCard.id = `member-card-${spouse._id}`;
                        coupleUnit.appendChild(spouseCard);
                        renderedInLevel.add(spouse._id);
                    }
                });
                levelContainer.appendChild(coupleUnit);
            });
            groupContainer.appendChild(levelContainer);
        });
    });

    // Use a debounce function for performance on resize/scroll
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Function to draw lines, can be called on load and resize
    const drawLines = () => {
        const svg = document.getElementById('relationship-svg');
        if (!svg) return;

        // Clear previous lines
        const lines = svg.querySelectorAll('g.relationship-line');
        lines.forEach(line => line.remove());

        const containerRect = currentTreeContainer.getBoundingClientRect();
        
        // Adjust SVG size to match container size
        svg.setAttribute('width', currentTreeContainer.scrollWidth);
        svg.setAttribute('height', currentTreeContainer.scrollHeight);

        relationships.forEach(r => {
            const p1Card = document.getElementById(`member-card-${r.person_id_1}`);
            const p2Card = document.getElementById(`member-card-${r.person_id_2}`);

            if (!p1Card || !p2Card) return;

            const p1Rect = p1Card.getBoundingClientRect();
            const p2Rect = p2Card.getBoundingClientRect();

            // Connection points for different relationship types
            let startX, startY, endX, endY;

            if (r.type === 'spouse') {
                // Connect sides for spouses
                startX = p1Rect.right - containerRect.left + currentTreeContainer.scrollLeft;
                startY = p1Rect.top + p1Rect.height / 2 - containerRect.top + currentTreeContainer.scrollTop;
                endX = p2Rect.left - containerRect.left + currentTreeContainer.scrollLeft;
                endY = p2Rect.top + p2Rect.height / 2 - containerRect.top + currentTreeContainer.scrollTop;
            } else if (r.type === 'parent_of') {
                // Connect bottom of parent to top of child
                startX = p1Rect.left + p1Rect.width / 2 - containerRect.left + currentTreeContainer.scrollLeft;
                startY = p1Rect.bottom - containerRect.top + currentTreeContainer.scrollTop;
                endX = p2Rect.left + p2Rect.width / 2 - containerRect.left + currentTreeContainer.scrollLeft;
                endY = p2Rect.top - containerRect.top + currentTreeContainer.scrollTop;
            } else {
                // Default: connect centers
                startX = p1Rect.left + p1Rect.width / 2 - containerRect.left + currentTreeContainer.scrollLeft;
                startY = p1Rect.top + p1Rect.height / 2 - containerRect.top + currentTreeContainer.scrollTop;
                endX = p2Rect.left + p2Rect.width / 2 - containerRect.left + currentTreeContainer.scrollLeft;
                endY = p2Rect.top + p2Rect.height / 2 - containerRect.top + currentTreeContainer.scrollTop;
            }


            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'relationship-line');

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Create a smooth curve for the line
            const d = `M ${startX} ${startY} C ${startX} ${(startY + endY) / 2}, ${endX} ${(startY + endY) / 2}, ${endX} ${endY}`;
            line.setAttribute('d', d);
            line.setAttribute('stroke-width', '2');
            line.setAttribute('fill', 'none');


            let strokeColor = '#9ca3af'; // gray-400
            let relationshipText = r.type;
            let strokeDasharray = '0';

            switch (r.type) {
                case 'spouse':
                    strokeColor = '#ec4899'; // pink-500
                    relationshipText = 'Pasangan';
                    strokeDasharray = '5, 5';
                    break;
                case 'parent_of':
                    strokeColor = '#3b82f6'; // blue-500
                    relationshipText = ''; // No text for parent lines, the hierarchy is clear
                    line.setAttribute('marker-end', 'url(#arrow-parent_of)');
                    break;
                case 'sibling':
                    strokeColor = '#22c55e'; // green-500
                    relationshipText = 'Saudara';
                    strokeDasharray = '2, 4';
                    break;
            }

            line.setAttribute('stroke', strokeColor);
            line.setAttribute('stroke-dasharray', strokeDasharray);
            g.appendChild(line);

            if (relationshipText) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('fill', strokeColor);
                text.setAttribute('font-size', '12');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('text-anchor', 'middle');
                
                const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${r._id}`);
                textPath.setAttribute('startOffset', '50%');
                textPath.textContent = relationshipText;
                text.appendChild(textPath);

                // Path for text needs an ID
                line.id = r._id;
                g.appendChild(text);
            }

            svg.appendChild(g);
        });
    };

    const debouncedDrawLines = debounce(drawLines, 100);

    // Draw lines after a short delay to ensure DOM is ready
    setTimeout(() => {
        drawLines();
        // Add observers to redraw lines when layout shifts
        const resizeObserver = new ResizeObserver(debouncedDrawLines);
        resizeObserver.observe(currentTreeContainer);
    }, 300);
    
    // Redraw on window resize and scroll
    window.addEventListener('resize', debouncedDrawLines);
    currentTreeContainer.addEventListener('scroll', debouncedDrawLines);
}

function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'family-member bg-white rounded-lg p-4 cursor-pointer border border-gray-200 w-64';
    card.dataset.memberId = member._id;

    const genderColor = member.gender === 'male' ? 'bg-blue-100 text-blue-800' : 
                       member.gender === 'female' ? 'bg-pink-100 text-pink-800' : 
                       'bg-gray-100 text-gray-800';

    card.innerHTML = `
        <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-full ${genderColor} flex items-center justify-center">
                <i class="fas fa-user text-3xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-lg">${member.full_name}</h3>
                <p class="text-sm text-gray-600">${member.native_name || ''}</p>
                <p class="text-xs text-gray-500">${formatDate(member.birth_date)} - ${member.death_date ? formatDate(member.death_date) : 'Sekarang'}</p>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showMemberDetails(member._id));
    return card;
}

function showMemberDetails(memberId) {
    const member = familyMembers.find(m => m._id === memberId);
    if (!member) {
        console.error('❌ Member not found:', memberId);
        return;
    }
    
    console.log('👤 Showing details for member:', member);
    
    // Update member details UI
    memberDetails.innerHTML = `
        <div class="p-4">
            <h2 class="text-xl font-semibold mb-2">${member.full_name}</h2>
            ${member.native_name ? `<p class="text-md text-gray-700 mb-2">${member.native_name}</p>` : ''}
            <p class="text-sm text-gray-500 mb-4">${member.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
            <div class="text-sm text-gray-600">
                ${member.birth_date ? `<p>Lahir: ${formatDate(member.birth_date)}</p>` : ''}
                ${member.death_date ? `<p>Meninggal: ${formatDate(member.death_date)}</p>` : ''}}
                ${member.suku ? `<p>Suku: ${member.suku}</p>` : ''}}
                ${member.kota ? `<p>Kota: ${member.kota}</p>` : ''}}
                ${member.provinsi ? `<p>Provinsi: ${member.provinsi}</p>` : ''}}
                ${member.negara ? `<p>Negara: ${member.negara}</p>` : ''}}
            </div>
        </div>
    `;
    
    // Fetch and display relationships
    fetchMemberRelationships(memberId);
    
    // Open the member details modal
    openMemberDetailsModal();
}

function fetchMemberRelationships(memberId) {
    console.log('🔄 Fetching relationships for member:', memberId);
    
    // Clear existing relationships
    const relationshipsContainer = document.getElementById('member-relationships');
    if (relationshipsContainer) {
        relationshipsContainer.innerHTML = '';
    }
    
    // Find relationships for the selected member
    const memberRelationships = relationships.filter(rel => rel.person1 === memberId || rel.person2 === memberId);
    console.log('📚 Found', memberRelationships.length, 'relationships for member:', memberId);
    
    if (memberRelationships.length === 0) {
        console.log('📭 No relationships found for this member');
        if (relationshipsContainer) {
            relationshipsContainer.innerHTML = '<p class="text-center text-gray-500 py-4">Tidak ada hubungan yang ditemukan untuk anggota ini.</p>';
        }
        return;
    }

    // Display each relationship
    memberRelationships.forEach(rel => {
        const isPerson1 = rel.person1 === memberId;
        const relatedMemberId = isPerson1 ? rel.person2 : rel.person1;
        const relationshipType = isPerson1 ? rel.relationship_type : rel.reverse_relationship_type;
        
        const relatedMember = familyMembers.find(m => m._id === relatedMemberId);
        if (!relatedMember) {
            console.warn('⚠️ Related member not found:', relatedMemberId);
            return;
        }
        
        console.log('👫 Relationship found:', relationshipType, 'with', relatedMember.full_name);
        
        const relationshipEl = document.createElement('div');
        relationshipEl.className = 'flex items-center justify-between p-2 border-b border-gray-200';
        relationshipEl.innerHTML = `
            <div class="flex items-center">
                <div class="rounded-full w-10 h-10 flex items-center justify-center ${relatedMember.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'} mr-3">
                    <i class="${relatedMember.gender === 'male' ? 'fas fa-male' : 'fas fa-female'} text-indigo-700"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900">${relatedMember.full_name}</p>
                    ${relatedMember.native_name ? `<p class="text-xs text-gray-500">${relatedMember.native_name}</p>` : ''}
                </div>
            </div>
            <div class="text-xs text-gray-600">
                ${relationshipType}
            </div>
        `;
        
        if (relationshipsContainer) {
            relationshipsContainer.appendChild(relationshipEl);
        }
    });
}

// Relationship Modal Functions
function addRelationship(memberId) {
    console.log('➕ Adding relationship for member:', memberId);
    
    // Reset form and errors
    const form = document.getElementById('add-relationship-form');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
    
    // Set hidden member ID fields
    setHiddenMemberId('member1-id', memberId);
    setHiddenMemberId('member2-id', null);
    
    // Open modal
    openRelationshipModal();
}

function setHiddenMemberId(fieldId, memberId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = memberId;
        console.log('✅ Set', fieldId, 'to', memberId);
    } else {
        console.warn('⚠️ Field not found:', fieldId);
    }
}

function openRelationshipModal() {
    const modal = document.getElementById('relationship-modal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
        modal.classList.remove('hidden');
        console.log('🔓 Relationship modal opened');
    } else {
        console.error('❌ Modal element not found!');
    }
}

function closeRelationshipModal() {
    const modal = document.getElementById('relationship-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        modal.classList.remove('active');
        console.log('🔒 Relationship modal closed');
    } else {
        console.error('❌ Modal element not found!');
    }
}

// Form Handling Functions
async function handleAddMember(event) {
    event.preventDefault();
    
    const form = event.target;
    console.log('📤 Adding new member with data:', new FormData(form));
    
    try {
        // Validate form data
        const validationErrors = validateMemberForm(form);
        if (validationErrors.length > 0) {
            console.warn('⚠️ Validation errors:', validationErrors);
            showFormErrors(form, validationErrors);
            return;
        } else {
            clearFormErrors(form);
        }
        
        // Prepare data
        const formData = new FormData(form);
        const memberData = Object.fromEntries(formData.entries());
        console.log('📦 Member data:', memberData);
        
        // Send request to server
        const response = await axios.post('/api/people', memberData);
        console.log('✅ Member added successfully:', response.data);
        
        // Update UI
        familyMembers.push(response.data);
        renderFamilyTree();
        
        // Close modal
        closeMemberModal();
        
        // Show success notification
        showNotification('✅ Anggota keluarga berhasil ditambahkan!', 'success');
        
    } catch (error) {
        console.error('❌ Error adding member:', error);
        showNotification('❌ Gagal menambahkan anggota keluarga: ' + error.message, 'error');
    }
}

async function handleEditMember(event) {
    event.preventDefault();
    
    const form = event.target;
    console.log('✏️ Editing member with data:', new FormData(form));
    
    try {
        // Validate form data
        const validationErrors = validateMemberForm(form);
        if (validationErrors.length > 0) {
            console.warn('⚠️ Validation errors:', validationErrors);
            showFormErrors(form, validationErrors);
            return;
        } else {
            clearFormErrors(form);
        }
        
        // Prepare data
        const formData = new FormData(form);
        const memberData = Object.fromEntries(formData.entries());
        console.log('📦 Member data:', memberData);
        
        // Send request to server
        const response = await axios.put(`/api/people/${memberData.id}`, memberData);
        console.log('✅ Member updated successfully:', response.data);
        
        // Update UI
        const index = familyMembers.findIndex(m => m._id === memberData.id);
        if (index !== -1) {
            familyMembers[index] = response.data;
            renderFamilyTree();
        }
        
        // Close modal
        closeMemberModal();
        
        // Show success notification
        showNotification('✅ Anggota keluarga berhasil diperbarui!', 'success');
        
    } catch (error) {
        console.error('❌ Error updating member:', error);
        showNotification('❌ Gagal memperbarui anggota keluarga: ' + error.message, 'error');
    }
}

async function handleDeleteMember() {
    const memberId = selectedMemberId;
    if (!memberId) {
        console.error('❌ No member selected for deletion');
        return;
    }
    
    console.log('🗑️ Deleting member:', memberId);
    
    try {
        // Send request to server
        await axios.delete(`/api/people/${memberId}`);
        console.log('✅ Member deleted successfully');
        
        // Update UI
        familyMembers = familyMembers.filter(m => m._id !== memberId);
        renderFamilyTree();
        
        // Close modal
        closeMemberModal();
        
        // Show success notification
        showNotification('✅ Anggota keluarga berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting member:', error);
        showNotification('❌ Gagal menghapus anggota keluarga: ' + error.message, 'error');
    }
}

async function handleAddEvent(event) {
    event.preventDefault();
    
    const form = event.target;
    console.log('📅 Adding new event with data:', new FormData(form));
    
    try {
        // Validate form data
        const validationErrors = validateEventForm(form);
        if (validationErrors.length > 0) {
            console.warn('⚠️ Validation errors:', validationErrors);
            showFormErrors(form, validationErrors);
            return;
        } else {
            clearFormErrors(form);
        }
        
        // Prepare data
        const formData = new FormData(form);
        const eventData = Object.fromEntries(formData.entries());
        console.log('📦 Event data:', eventData);
        
        // Send request to server
        const response = await axios.post('/api/events', eventData);
        console.log('✅ Event added successfully:', response.data);
        
        // Update UI
        events.push(response.data);
        renderTimeline();
        
        // Close modal
        closeEventModal();
        
        // Show success notification
        showNotification('✅ Acara berhasil ditambahkan!', 'success');
        
    } catch (error) {
        console.error('❌ Error adding event:', error);
        showNotification('❌ Gagal menambahkan acara: ' + error.message, 'error');
    }
}

async function handleEditEvent(event) {
    event.preventDefault();
    
    const form = event.target;
    console.log('✏️ Editing event with data:', new FormData(form));
    
    try {
        // Validate form data
        const validationErrors = validateEventForm(form);
        if (validationErrors.length > 0) {
            console.warn('⚠️ Validation errors:', validationErrors);
            showFormErrors(form, validationErrors);
            return;
        } else {
            clearFormErrors(form);
        }
        
        // Prepare data
        const formData = new FormData(form);
        const eventData = Object.fromEntries(formData.entries());
        console.log('📦 Event data:', eventData);
        
        // Send request to server
        const response = await axios.put(`/api/events/${eventData.id}`, eventData);
        console.log('✅ Event updated successfully:', response.data);
        
        // Update UI
        const index = events.findIndex(e => e._id === eventData.id);
        if (index !== -1) {
            events[index] = response.data;
            renderTimeline();
        }
        
        // Close modal
        closeEventModal();
        
        // Show success notification
        showNotification('✅ Acara berhasil diperbarui!', 'success');
        
    } catch (error) {
        console.error('❌ Error updating event:', error);
        showNotification('❌ Gagal memperbarui acara: ' + error.message, 'error');
    }
}

async function handleDeleteEvent() {
    const eventId = selectedEventId;
    if (!eventId) {
        console.error('❌ No event selected for deletion');
        return;
    }
    
    console.log('🗑️ Deleting event:', eventId);
    
    try {
        // Send request to server
        await axios.delete(`/api/events/${eventId}`);
        console.log('✅ Event deleted successfully');
        
        // Update UI
        events = events.filter(e => e._id !== eventId);
        renderTimeline();
        
        // Close modal
        closeEventModal();
        
        // Show success notification
        showNotification('✅ Acara berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting event:', error);
        showNotification('❌ Gagal menghapus acara: ' + error.message, 'error');
    }
}

// Validation Functions
function validateMemberForm(form) {
    const errors = [];
    
    const fullName = form.full_name.value.trim();
    if (!fullName) {
        errors.push({ field: 'full_name', message: 'Nama lengkap harus diisi' });
    }
    
    const gender = form.gender.value;
    if (!gender) {
        errors.push({ field: 'gender', message: 'Jenis kelamin harus dipilih' });
    }
    
    const birthDate = form.birth_date.value;
    if (!birthDate) {
        errors.push({ field: 'birth_date', message: 'Tanggal lahir harus diisi' });
    }
    
    return errors;
}

function validateEventForm(form) {
    const errors = [];
    
    const title = form.title.value.trim();
    if (!title) {
        errors.push({ field: 'title', message: 'Judul acara harus diisi' });
    }
    
    const eventDate = form.event_date.value;
    if (!eventDate) {
        errors.push({ field: 'event_date', message: 'Tanggal acara harus diisi' });
    }
    
    return errors;
}

// Error Handling Functions
function showFormErrors(form, errors) {
    console.log('🚨 Showing form errors:', errors);
    
    // Clear existing errors
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    // Show new errors
    errors.forEach(error => {
        const field = form.querySelector(`[name="${error.field}"]`);
        if (field) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message text-red-500 text-xs mt-1';
            errorMessage.textContent = error.message;
            field.parentNode.appendChild(errorMessage);
        }
    });
}

function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
}

// Notification Function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} p-4 rounded-lg shadow-md mb-4`;
    notification.textContent = message;
    
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Tree and Timeline Update Functions
function updateTreeZoom() {
    const tree = document.getElementById('tree');
    if (!tree) return;
    
    tree.style.transform = `scale(${zoomLevel})`;
    tree.style.transformOrigin = 'top left';
    
    console.log('🔍 Tree zoom updated to level:', zoomLevel);
}

function centerTree() {
    const tree = document.getElementById('tree');
    if (!tree) return;
    
    // Calculate bounding box of the tree
    const rect = tree.getBoundingClientRect();
    const offsetX = -rect.left + window.innerWidth / 2 - rect.width / 2;
    const offsetY = -rect.top + window.innerHeight / 2 - rect.height / 2;
    
    // Apply translation to center the tree
    tree.style.transition = 'transform 0.5s ease';
    tree.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomLevel})`;
    
    console.log('📍 Tree centered');
}

// Timeline rendering (stub for now)
function renderTimeline() {
    console.log('📅 renderTimeline called, events.length:', events.length);
    
    const timelineContainer = document.getElementById('timeline');
    if (!timelineContainer) {
        console.error('❌ Timeline container not found!');
        return;
    }
    
    if (events.length === 0) {
        console.log('📭 No events to display');
        timelineContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Belum ada acara. Tambahkan acara untuk memulai!</p>';
        return;
    }

    console.log('🔨 Rendering', events.length, 'events...');
    timelineContainer.innerHTML = '';

    events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'timeline-event bg-white rounded-lg p-4 shadow-md mb-4';
        eventEl.dataset.eventId = event._id;

        eventEl.innerHTML = `
            <div class="font-semibold text-gray-900">${event.title}</div>
            <div class="text-xs text-gray-500 mb-2">${formatDate(event.event_date)}</div>
            <div class="text-sm text-gray-700">${event.description || ''}</div>
        `;

        timelineContainer.appendChild(eventEl);
    });
    
    console.log('✅ renderTimeline completed successfully');
}

// Date formatting function
function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', timezone: 'UTC' };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date(dateString));
}

// Debugging helper function
function forceReload() {
    console.log('🔄 Forcing data reload...');
    Promise.all([loadStatistics(), loadFamilyData()])
        .then(() => {
            console.log('✅ Data reloaded successfully');
            showSection('family-tree');
        })
        .catch(error => {
            console.error('❌ Failed to reload data:', error);
        });
}
