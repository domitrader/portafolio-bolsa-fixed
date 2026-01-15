// Funciones globales
function showTab(tab) {
    const searchTab = document.getElementById('search-tab');
    const portfolioTab = document.getElementById('portfolio-tab');
    if (tab === 'search') {
        searchTab.style.display = 'block';
        portfolioTab.style.display = 'none';
    } else {
        searchTab.style.display = 'none';
        portfolioTab.style.display = 'block';
        loadPortfolios();
    }
}

// Buscador de acciones
async function searchStock() {
    const query = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('searchResults');
    
    if (!query) {
        resultsDiv.innerHTML = '<p>Por favor, ingresa un símbolo o nombre de empresa</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<div class="loading">Analizando mercados...</div>';
    
    try {
        // Usar Yahoo Finance API con CORS proxy
        const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`);
        
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `<div class="error">Error al buscar. Probando con datos de ejemplo...</div>`;
        // Mostrar datos de ejemplo si falla
        displaySampleResults(query);
    }
}

function displayResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (!data.quotes || data.quotes.length === 0) {
        resultsDiv.innerHTML = '<p>No se encontraron resultados</p>';
        return;
    }
    
    let html = '<h3>Resultados:</h3>';
    data.quotes.forEach(quote => {
        html += `
            <div class="stock-card">
                <h4>${quote.symbol}</h4>
                <p><strong>${quote.shortname || quote.longname || 'N/A'}</strong></p>
                <p>Tipo: ${quote.quoteType || 'N/A'}</p>
                <p>Exchange: ${quote.exchange || 'N/A'}</p>
                <button onclick="addToPortfolio('${quote.symbol}', '${(quote.shortname || quote.longname || '').replace(/'/g, "\\'")}')">➕ Agregar al Portafolio</button>
            </div>
        `;
    });
    resultsDiv.innerHTML = html;
}

function displaySampleResults(query) {
    const resultsDiv = document.getElementById('searchResults');
    const samples = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'EQUITY', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'EQUITY', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'EQUITY', exchange: 'NASDAQ' }
    ];
    
    let html = '<h3>Resultados de ejemplo:</h3>';
    samples.forEach(stock => {
        if (stock.symbol.includes(query.toUpperCase()) || stock.name.toLowerCase().includes(query.toLowerCase())) {
            html += `
                <div class="stock-card">
                    <h4>${stock.symbol}</h4>
                    <p><strong>${stock.name}</strong></p>
                    <p>Tipo: ${stock.type}</p>
                    <p>Exchange: ${stock.exchange}</p>
                    <button onclick="addToPortfolio('${stock.symbol}', '${stock.name}')">➕ Agregar al Portafolio</button>
                </div>
            `;
        }
    });
    
    if (html === '<h3>Resultados de ejemplo:</h3>') {
        html += '<p>No se encontraron coincidencias</p>';
    }
    
    resultsDiv.innerHTML = html;
}

// Gestión de portafolios
function addToPortfolio(symbol, name) {
    let portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    
    // Crear portafolio por defecto si no existe
    if (portfolios.length === 0) {
        portfolios.push({
            id: Date.now(),
            name: 'Mi Portafolio',
            stocks: []
        });
    }
    
    // Agregar al primer portafolio
    portfolios[0].stocks.push({
        symbol,
        name,
        addedDate: new Date().toISOString()
    });
    
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
    alert(`${symbol} agregado al portafolio!`);
}

function loadPortfolios() {
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const listDiv = document.getElementById('portfolioList');
    
    if (portfolios.length === 0) {
        listDiv.innerHTML = '<p>No tienes portafolios. Busca acciones y agrégalas para crear tu primer portafolio.</p>';
        return;
    }
    
    let html = '';
    portfolios.forEach(portfolio => {
        html += `
            <div class="portfolio-item">
                <h3>${portfolio.name}</h3>
                <p>Acciones: ${portfolio.stocks.length}</p>
                <div style="margin-top: 10px;">
        `;
        
        portfolio.stocks.forEach((stock, index) => {
            html += `
                <div style="background: #f9f9f9; padding: 8px; margin: 5px 0; border-radius: 5px;">
                    <strong>${stock.symbol}</strong> - ${stock.name}
                    <button onclick="removeStock(${portfolio.id}, ${index})" style="float: right; background: #ff5555; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✖</button>
                </div>
            `;
        });
        
        html += `
                </div>
                <button onclick="deletePortfolio(${portfolio.id})" style="margin-top: 10px; background: #ff5555; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Eliminar Portafolio</button>
            </div>
        `;
    });
    
    listDiv.innerHTML = html;
}

function removeStock(portfolioId, stockIndex) {
    let portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    if (portfolio) {
        portfolio.stocks.splice(stockIndex, 1);
        localStorage.setItem('portfolios', JSON.stringify(portfolios));
        loadPortfolios();
    }
}

function deletePortfolio(portfolioId) {
    if (!confirm('¿Seguro que quieres eliminar este portafolio?')) return;
    
    let portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    portfolios = portfolios.filter(p => p.id !== portfolioId);
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
    loadPortfolios();
}

// Enter para buscar
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchStock();
            }
        });
    }
});
