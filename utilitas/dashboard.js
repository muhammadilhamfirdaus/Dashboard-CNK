// dashboard.js

function toggleMenu(id) {
    const menu = document.getElementById(id);
    const arrow = menu.previousElementSibling.querySelector('span:last-child');
    menu.classList.toggle('hidden');
    arrow.style.transform = menu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('/utilitas/sidebar.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(html => {
            document.getElementById('sidebar-container').innerHTML = html;
            initializeDashboardScripts();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            document.getElementById('sidebar-container').innerHTML = 
                '<p class="p-4 text-red-500">Gagal memuat sidebar.</p>';
        });
});

function initializeDashboardScripts() {
    const sidebar = document.getElementById("sidebar");
    const resizer = document.getElementById("resizer");
    const main = document.getElementById("main-content");
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (!sidebar || !main || !hamburgerBtn || !sidebarCloseBtn || !sidebarOverlay) {
         console.error("Initialization failed: Core elements not found.");
         return;
    }

    const openSidebar = () => {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
    };
    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    };
    hamburgerBtn.addEventListener('click', openSidebar);
    sidebarCloseBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    let isResizing = false;
    if (resizer) { 
        resizer.addEventListener("mousedown", (e) => {
            if (window.innerWidth < 768) return;
            e.preventDefault();
            isResizing = true;
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
        });
    }

    document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
        let newWidth = e.clientX;
        if (newWidth < 150) newWidth = 150;
        if (newWidth > 500) newWidth = 500;
        sidebar.style.width = `${newWidth}px`;
        main.style.marginLeft = `${newWidth}px`;
        scaleDynamicIframes();
    });

    document.addEventListener("mouseup", () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = "default";
            document.body.style.userSelect = "auto";
        }
    });

    const currentPage = window.location.href;
    const menuItems = document.querySelectorAll('.menu-item a');
    menuItems.forEach(link => {
        if (link.href === currentPage) {
            link.classList.add('bg-gray-200', 'font-bold');
        }
    });
    
    setTimeout(() => location.reload(), 300000);

    scaleDynamicIframes();
    window.addEventListener('resize', scaleDynamicIframes);
}

/**
 * Menyesuaikan skala atau ukuran iframe berdasarkan ukuran layar.
 */
function scaleDynamicIframes() {
    const isDesktop = window.innerWidth >= 1280; // Breakpoint xl:

    // --- [LOGIKA BARU] UNTUK GRAFIK 1 ---
    const staticWrappers = document.querySelectorAll('.static-scale-wrapper');
    staticWrappers.forEach(wrapper => {
        if (isDesktop) {
            // Ukuran di desktop tetap seperti semula
            wrapper.style.transform = 'scale(0.48)';
        } else {
            // Ukuran di mobile diperbesar
            wrapper.style.transform = 'scale(0.5)'; 
        }
    });

    // --- [LOGIKA LAMA] UNTUK GRAFIK 2 ---
    const dynamicContainers = document.querySelectorAll('.dynamic-scale-wrapper');
    dynamicContainers.forEach(container => {
        const scrollableParent = container.closest('.overflow-x-auto');
        if (!isDesktop && scrollableParent) {
            // MOBILE: Buat jadi scrollable
            container.style.transform = 'none';
            container.style.height = '790px';
            container.style.width = '1950px';
        } else {
            // DESKTOP: Scale agar pas
            const containerWidth = container.parentElement.offsetWidth;
            if (containerWidth === 0) return;
            const iframeOriginalWidth = 1950;
            const scale = containerWidth / iframeOriginalWidth;
            container.style.transform = `scale(${scale})`;
            container.style.transformOrigin = 'top left';
            const iframeOriginalHeight = 790;
            container.style.height = `${iframeOriginalHeight * scale}px`;
            container.style.width = '100%';
        }
    });
}