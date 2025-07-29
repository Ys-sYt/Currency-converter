// レート情報を保持するオブジェクト
let rates = {};
let lastUpdate = null;

// 初期化関数
async function initialize() {
    try {
        // レート取得
        await fetchRates();
        // UIに反映
        updateRateDisplay();
    } catch (error) {
        console.error('初期化エラー:', error);
        // エラー時はダミーデータを使用
        setDummyData();
    }
}

// Open Exchange Rates APIからレートを取得
async function fetchRates() {
    try {
        // Netlifyプロキシを使用
        const response = await fetch('/api/latest.json');
        
        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 取得したレートを保存
        rates.usd = {
            jpy: data.rates.JPY,
            eur: data.rates.EUR,
            try: data.rates.TRY
        };
        
        // 他の通貨間のレートを計算
        calculateCrossRates();
        
        // 更新時間を記録
        lastUpdate = new Date(data.timestamp * 1000);
        
        return true;
    } catch (error) {
        console.error('レート取得エラー:', error);
        throw error;
    }
}

// クロスレートを計算
function calculateCrossRates() {
    // EUR基準のレート
    rates.eur = {
        usd: 1 / rates.usd.eur,
        jpy: rates.usd.jpy / rates.usd.eur,
        try: rates.usd.try / rates.usd.eur
    };
    
    // JPY基準のレート
    rates.jpy = {
        usd: 1 / rates.usd.jpy,
        eur: 1 / rates.eur.jpy,
        try: rates.usd.try / rates.usd.jpy
    };
    
    // TRY基準のレート
    rates.try = {
        usd: 1 / rates.usd.try,
        eur: 1 / rates.eur.try,
        jpy: 1 / rates.jpy.try
    };
}

// レート表示を更新
function updateRateDisplay() {
    // USD基準のレート表示
    document.getElementById('usd-jpy').textContent = rates.usd.jpy.toFixed(2);
    document.getElementById('usd-eur').textContent = rates.usd.eur.toFixed(4);
    document.getElementById('usd-try').textContent = rates.usd.try.toFixed(2);
    
    // EUR基準のレート表示
    document.getElementById('eur-jpy').textContent = rates.eur.jpy.toFixed(2);
    document.getElementById('eur-usd').textContent = rates.eur.usd.toFixed(4);
    document.getElementById('eur-try').textContent = rates.eur.try.toFixed(2);
    
    // 更新日時を表示
    document.getElementById('last-update').textContent = lastUpdate.toLocaleString();
}

// 通貨換算関数
function convert(source) {
    // 各入力フィールドを取得
    const jpyInput = document.getElementById('jpy');
    const usdInput = document.getElementById('usd');
    const eurInput = document.getElementById('eur');
    const tryInput = document.getElementById('try');
    
    // 入力値を取得
    const value = parseFloat(document.getElementById(source).value);
    
    // 数値でない場合はクリア
    if (isNaN(value)) {
        if (source !== 'jpy') jpyInput.value = '';
        if (source !== 'usd') usdInput.value = '';
        if (source !== 'eur') eurInput.value = '';
        if (source !== 'try') tryInput.value = '';
        return;
    }
    
    // 入力元に基づいて他の通貨に換算
    switch (source) {
        case 'jpy':
            usdInput.value = (value * rates.jpy.usd).toFixed(2);
            eurInput.value = (value * rates.jpy.eur).toFixed(2);
            tryInput.value = (value * rates.jpy.try).toFixed(2);
            break;
            
        case 'usd':
            jpyInput.value = (value * rates.usd.jpy).toFixed(2);
            eurInput.value = (value * rates.usd.eur).toFixed(2);
            tryInput.value = (value * rates.usd.try).toFixed(2);
            break;
            
        case 'eur':
            jpyInput.value = (value * rates.eur.jpy).toFixed(2);
            usdInput.value = (value * rates.eur.usd).toFixed(2);
            tryInput.value = (value * rates.eur.try).toFixed(2);
            break;
            
        case 'try':
            jpyInput.value = (value * rates.try.jpy).toFixed(2);
            usdInput.value = (value * rates.try.usd).toFixed(2);
            eurInput.value = (value * rates.try.eur).toFixed(2);
            break;
    }
}

// APIが利用できない場合のダミーデータ
function setDummyData() {
    rates = {
        usd: {
            jpy: 149.8,
            eur: 0.93,
            try: 32.45
        }
    };
    
    // 他の通貨間のレートを計算
    calculateCrossRates();
    
    // 現在時刻を更新時間として設定
    lastUpdate = new Date();
    
    // UIに反映
    updateRateDisplay();
    
    // 警告メッセージを表示
    document.getElementById('last-update').textContent = lastUpdate.toLocaleString() + ' (サンプルデータ)';
}

// ページ読み込み時に初期化を実行
window.addEventListener('DOMContentLoaded', initialize);