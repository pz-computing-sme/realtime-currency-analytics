// Function to load Google Analytics and AdSense scripts
function loadTrackingScripts() {
    // Google Analytics (GA4)
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-28M35M65LC';
    document.head.appendChild(gaScript);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-28M35M65LC');
    
    // Google AdSense
    const adsenseScript = document.createElement('script');
    adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1946141108985994';
    adsenseScript.async = true;
    adsenseScript.crossOrigin = 'anonymous';
    document.head.appendChild(adsenseScript);
}

// Check for existing cookie consent and load tracking scripts if accepted
if (localStorage.getItem('cookieConsent') === 'accepted') {
    loadTrackingScripts();
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // ============ Menu Toggle ============
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const closeMenu = document.querySelector('.close-menu');

    // Function to close the menu
    const closeMenuFunction = () => {
        mainNav.classList.remove('active');
        menuToggle.classList.remove('active');
    };

    // Reset menu on page load
    closeMenuFunction();
    
    // Close menu when navigating within a single page application
    if (window.location.hash) {
        closeMenuFunction();
    }

    // Toggle menu function
    const toggleMenu = () => {
        mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    };

    // Event listeners for menu
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    closeMenu.addEventListener('click', closeMenuFunction);

    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenuFunction();
        }
    });

    // Update menu state when navigating back
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            closeMenuFunction();
        }
    });

    // ============ Currency Converter ============
    const moedaOrigem = document.getElementById('moeda-origem');
    const quantidade = document.getElementById('quantidade');
    const resultados = document.querySelector('.resultados');

    const moedasAlvo = [
        { codigo: 'BRL', nome: 'Real Brasileiro', bandeira: 'br', localidade: 'pt-BR' },
        { codigo: 'USD', nome: 'Dólar Americano', bandeira: 'us', localidade: 'en-US' },
        { codigo: 'EUR', nome: 'Euro', bandeira: 'eu', localidade: 'de-DE' },
        { codigo: 'GBP', nome: 'Libra Esterlina', bandeira: 'gb', localidade: 'en-GB' },
        { codigo: 'JPY', nome: 'Iene Japonês', bandeira: 'jp', localidade: 'ja-JP' },
        { codigo: 'CHF', nome: 'Franco Suíço', bandeira: 'ch', localidade: 'de-CH' },
        { codigo: 'CAD', nome: 'Dólar Canadense', bandeira: 'ca', localidade: 'en-CA' },
        { codigo: 'AUD', nome: 'Dólar Australiano', bandeira: 'au', localidade: 'en-AU' },
        { codigo: 'NZD', nome: 'Dólar Neozelandês', bandeira: 'nz', localidade: 'en-NZ' },
        { codigo: 'CNY', nome: 'Yuan Chinês', bandeira: 'cn', localidade: 'zh-CN' }
    ];

    // Create currency result boxes
    moedasAlvo.forEach(moeda => {
        const div = document.createElement('div');
        div.className = `moeda-box ${moeda.codigo === 'BRL' ? 'brasil' : ''}`;
        div.innerHTML = ` 
            <img src="https://flagcdn.com/${moeda.bandeira}.svg" 
                 class="bandeira" 
                 alt="${moeda.nome}" 
                 loading="lazy">
            <div>
                <h3 ${moeda.codigo === 'BRL' ? 'class="destaque"' : ''} 
                    id="valor-${moeda.codigo}">0.00</h3>
                <p>${moeda.nome}</p>
                <p class="taxa" id="taxa-${moeda.codigo}">Taxa: carregando...</p>
            </div>
        `;
        resultados.appendChild(div);
    });

    // Format currency values
    const formatarMoeda = (valor, moeda, localidade) => {
        try {
            return new Intl.NumberFormat(localidade, {
                style: 'currency',
                currency: moeda,
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            }).format(valor);
        } catch (e) {
            return `${valor.toFixed(2)} ${moeda}`;
        }
    };

    let cacheData = null;

    // Update currency conversion
    async function atualizarConversao() {
        const moedaBase = moedaOrigem.value;
        const valor = parseFloat(quantidade.value) || 0;

        try {
            const response = await fetch(`https://api.frankfurter.app/latest?from=${moedaBase}`);
            
            if (!response.ok) {
                if (cacheData) return;
                throw new Error('Erro na API');
            }

            const data = await response.json();
            cacheData = data;

            moedasAlvo.forEach(moeda => {
                const taxa = data.rates[moeda.codigo];
                const valorElemento = document.getElementById(`valor-${moeda.codigo}`);
                const taxaElemento = document.getElementById(`taxa-${moeda.codigo}`);

                if (taxa) {
                    valorElemento.textContent = formatarMoeda(valor * taxa, moeda.codigo, moeda.localidade);
                    taxaElemento.textContent = `Taxa: 1 ${moedaBase} = ${formatarMoeda(taxa, moeda.codigo, moeda.localidade)}`;
                } else {
                    valorElemento.textContent = 'Indisponível';
                    taxaElemento.textContent = 'Taxa não encontrada';
                }
            });

        } catch (error) {
            if (cacheData) {
                moedasAlvo.forEach(moeda => {
                    const taxa = cacheData.rates[moeda.codigo];
                    if (taxa) {
                        const valorConvertido = valor * taxa;
                        document.getElementById(`valor-${moeda.codigo}`).textContent = 
                            formatarMoeda(valorConvertido, moeda.codigo, moeda.localidade);
                    }
                });
            }
        }
    }

    let timeout;
    function handleUpdate() {
        clearTimeout(timeout);
        timeout = setTimeout(atualizarConversao, 300);
    }

    // Event listeners for currency converter
    moedaOrigem.addEventListener('change', handleUpdate);
    quantidade.addEventListener('input', handleUpdate);

    // ============ Scroll Button ============
    const scrollButton = document.querySelector('.scroll-top');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 200) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });

    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ============ Cookie Banner ============
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookiesBtn');
    const rejectBtn = document.getElementById('rejectCookiesBtn');

    // Show banner if no consent stored
    if (!localStorage.getItem('cookieConsent')) {
        cookieBanner.style.display = 'block';
    }

    // Accept cookies function
    function acceptCookies() {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.style.display = 'none';
        loadTrackingScripts();
    }

    // Reject cookies function
    function rejectCookies() {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieBanner.style.display = 'none';
        // Additional cleanup could be added here if needed
    }

    // Attach event listeners to cookie buttons
    if (acceptBtn) {
        acceptBtn.addEventListener('click', acceptCookies);
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', rejectCookies);
    }

    // Initialize currency converter
    atualizarConversao();
    setInterval(atualizarConversao, 30000);
});