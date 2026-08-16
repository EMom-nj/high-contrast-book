// DOM Elements
const inputName = document.getElementById('input-name');
const checkPictureBook = document.getElementById('check-picture-book');
const selectLayout = document.getElementById('select-layout');
const selectTheme = document.getElementById('select-theme');
const selectBorder = document.getElementById('select-border');
const btnAddShapes = document.getElementById('btn-add-shapes');
const btnDownload = document.getElementById('btn-download');
const pdfDocument = document.getElementById('pdf-document');

// State
let numSlots = 4; // Default based on layout-4
let currentLayoutClass = 'layout-4';
let currentThemeClass = 'theme-none';

// Available shapes for empty slots
const shapes = ['shape-circle', 'shape-checker'];

// Theme Icons Mapping (Expanded pools)
const themeIcons = {
    'theme-bear': ['emoji-🧸', 'emoji-🐻', 'emoji-🐼', 'emoji-🐨'],
    'theme-paw': ['fa-solid fa-paw', 'fa-solid fa-bone'],
    'theme-nature': ['fa-solid fa-leaf', 'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-clover', 'fa-solid fa-bug', 'fa-solid fa-mountain', 'fa-solid fa-water', 'fa-solid fa-campground'],
    'theme-space': ['fa-solid fa-star', 'fa-solid fa-moon', 'fa-solid fa-meteor', 'fa-solid fa-rocket', 'fa-solid fa-satellite', 'fa-solid fa-globe', 'fa-solid fa-sun', 'fa-solid fa-cloud'],
    'theme-zoo': ['fa-solid fa-hippo', 'fa-solid fa-frog', 'fa-solid fa-cat', 'fa-solid fa-dog', 'fa-solid fa-horse', 'fa-solid fa-spider', 'fa-solid fa-crow', 'fa-solid fa-dove', 'fa-solid fa-dragon', 'fa-solid fa-kiwi-bird', 'fa-solid fa-worm', 'fa-solid fa-fish', 'fa-solid fa-otter']
};

// Handle Layout Change
const updateLayout = () => {
    numSlots = parseInt(selectLayout.value);
    currentLayoutClass = `layout-${numSlots}`;
    renderCards();
};

// Handle Theme Change
const updateTheme = () => {
    currentThemeClass = selectTheme.value;
    renderCards();
};

// Render the grid
const renderCards = (forceShapes = false) => {
    pdfDocument.innerHTML = ''; // Clear existing pages
    
    const isPictureBookMode = checkPictureBook.checked;
    const text = inputName.value.trim();
    const currentBorderClass = selectBorder.value;
    
    let items = [];
    if (isPictureBookMode) {
        // Classic picture book sequence from the user's screenshot
        items = [
            { type: 'text', content: 'HELLO\nMY\nBABY' },
            { type: 'icon', content: 'emoji-🐇' }, // Rabbit
            { type: 'icon', content: 'emoji-🐋' }, // Whale
            { type: 'icon', content: 'emoji-🐘' }, // Elephant
            { type: 'icon', content: 'emoji-🎠' }, // Rocking Horse (Carousel)
            { type: 'icon', content: 'emoji-🐑' }  // Sheep
        ];
    } else {
        const chars = text.split('');
        items = chars.map(c => ({ type: 'char', content: c }));
    }
    
    // Calculate how many total slots we need (must be a multiple of numSlots to complete the page)
    let totalSlots = Math.ceil(items.length / numSlots) * numSlots;
    if (totalSlots === 0) totalSlots = numSlots; // Ensure at least 1 page

    let currentPage = null;
    
    for (let i = 0; i < totalSlots; i++) {
        // Create a new page wrapper if we are at the start of a new chunk
        if (i % numSlots === 0) {
            currentPage = document.createElement('div');
            currentPage.className = `pdf-page ${currentLayoutClass}`;
            pdfDocument.appendChild(currentPage);
        }

        const card = document.createElement('div');
        // Alternate dark and light for high contrast
        const theme = i % 2 === 0 ? 'dark' : 'light';
        card.className = `hc-card ${theme} ${currentBorderClass}`;
        
        // Determine font size based on layout
        if (numSlots === 1) card.style.fontSize = '30rem';
        else if (numSlots === 4) card.style.fontSize = '15rem';
        else if (numSlots === 9) card.style.fontSize = '8rem';

        // Determine what goes inside this card
        const item = i < items.length ? items[i] : null;
        
        // Should we fill empty padded slots?
        const shouldFill = !item && (isPictureBookMode || text === '' || forceShapes);

        if (item) {
            if (item.type === 'text') {
                card.innerText = item.content;
                // Scale down font size so 3 lines of text can fit in the card
                if (numSlots === 1) card.style.fontSize = '12rem';
                else if (numSlots === 4) card.style.fontSize = '5rem';
                else if (numSlots === 9) card.style.fontSize = '3rem';
                card.style.lineHeight = '1.2';
                card.style.textAlign = 'center';
            } else if (item.type === 'char' && item.content !== ' ') {
                card.innerText = item.content;
            } else if (item.type === 'icon') {
                const centerIcon = document.createElement('span');
                centerIcon.innerText = item.content.replace('emoji-', '');
                centerIcon.className = 'filter-emoji';
                card.appendChild(centerIcon);
            } else if (item.content === ' ') {
                fillWithShape(card);
            }
        } else if (shouldFill) {
            fillWithShape(card);
        }

        // Helper to fill empty slots
        function fillWithShape(targetCard) {
            if (!isPictureBookMode && currentThemeClass !== 'theme-none' && themeIcons[currentThemeClass]) {
                const iconPool = themeIcons[currentThemeClass];
                const randomIcon = iconPool[Math.floor(Math.random() * iconPool.length)];
                let centerIcon;
                if (randomIcon.startsWith('emoji-')) {
                    centerIcon = document.createElement('span');
                    centerIcon.innerText = randomIcon.replace('emoji-', '');
                    centerIcon.className = 'filter-emoji';
                } else {
                    centerIcon = document.createElement('i');
                    centerIcon.className = `${randomIcon}`;
                }
                targetCard.appendChild(centerIcon);
            } else {
                const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
                const shapeDiv = document.createElement('div');
                shapeDiv.className = shapeType;
                targetCard.appendChild(shapeDiv);
            }
        }

        // Add corner theme icons ONLY if a theme is selected AND we are not in picture book mode
        if (!isPictureBookMode && currentThemeClass !== 'theme-none' && themeIcons[currentThemeClass]) {
            const iconPool = themeIcons[currentThemeClass];
            const positions = ['corner-tl', 'corner-tr', 'corner-bl', 'corner-br'];
            
            // Randomly pick 4 icons from the pool for THIS specific card
            let shuffledPool = [...iconPool].sort(() => 0.5 - Math.random());
            
            for (let j = 0; j < 4; j++) {
                // Use a random icon, looping back if the pool is smaller than 4 (like the paw theme)
                const randomIcon = shuffledPool[j % shuffledPool.length];
                
                let iconElem;
                if (randomIcon.startsWith('emoji-')) {
                    iconElem = document.createElement('span');
                    iconElem.innerText = randomIcon.replace('emoji-', '');
                    iconElem.className = `corner-icon ${positions[j]} filter-emoji`;
                } else {
                    iconElem = document.createElement('i');
                    iconElem.className = `${randomIcon} corner-icon ${positions[j]}`;
                }
                card.appendChild(iconElem);
            }
        }
        
        currentPage.appendChild(card);
    }
};

// Handle PDF Download
const downloadPDF = async () => {
    // Update button state to show progress
    const originalText = btnDownload.innerHTML;
    btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 렌더링 중...';
    btnDownload.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'letter');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const pages = document.querySelectorAll('.pdf-page');

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage(); // Add a new PDF page for subsequent grids

            // Use html2canvas to take a screenshot of the specific page grid
            const canvas = await html2canvas(pages[i], {
                scale: 2, // High resolution
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // Add image to PDF exactly fitting the page
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
        
        // Trigger download
        const fileName = inputName.value ? `High_Contrast_${inputName.value}.pdf` : 'High_Contrast_Book.pdf';
        pdf.save(fileName);

    } catch (error) {
        console.error("PDF 생성 오류:", error);
        alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
        // Restore button state
        btnDownload.innerHTML = originalText;
        btnDownload.disabled = false;
    }
};

// Event Listeners
inputName.addEventListener('input', () => renderCards(false));
checkPictureBook.addEventListener('change', () => {
    inputName.disabled = checkPictureBook.checked;
    renderCards(false);
});
selectLayout.addEventListener('change', updateLayout);
selectTheme.addEventListener('change', updateTheme);
selectBorder.addEventListener('change', () => renderCards());

btnAddShapes.addEventListener('click', () => {
    // Re-render, forcing shapes into empty slots
    renderCards(true);
});

btnDownload.addEventListener('click', downloadPDF);

// Initial Render
inputName.disabled = checkPictureBook.checked;
renderCards();
