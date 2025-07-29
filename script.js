// 為替レートを保存する変数
let currentRates = {};

// 初期化関数
async function initialize() {
    try {
        // 現在のレートを取得
        await fetchCurrentRates();
    } catch (error) {
        console.error('初期化中にエラーが発生しました:', error);
        // エラー時にはダミーデータを表示
        setDummyData();
    }
}

// 現在のレートを取得する関数
async function fetchCurrentRates() {
    try {
        // Netlifyリダイレクトルールを使ってAPIにアクセス (USDがデフォルトベース)
        const response = await fetch('/api/latest.json');
        console.log('APIレスポンス:', response);
        const data = await response.json();
        console.log('取得したデータ:', data);
        
        if (data.rates) {
            // USDベースのレートを直接取得
            const usdToJpy = data.rates.JPY;
            const usdToEur = data.rates.EUR;
            const usdToTry = data.rates.TRY;
            
            // 各通貨ペアのレートを計算
            currentRates = {
                // USD基準のレート
                USD_JPY: usdToJpy,
                USD_EUR: usdToEur,
                USD_TRY: usdToTry,
                
                // EUR基準のレート
                EUR_USD: 1 / usdToEur,
                EUR_JPY: usdToJpy / usdToEur,
                EUR_TRY: usdToTry / usdToEur,
                
                // JPY基準のレート
                JPY_USD: 1 / usdToJpy,
                JPY_EUR: usdToEur / usdToJpy,
                JPY_TRY: usdToTry / usdToJpy,
                
                // TRY基準のレート
                TRY_USD: 1 / usdToTry,
                TRY_EUR: usdToEur / usdToTry,
                TRY_JPY: usdToJpy / usdToTry
            };
            
            // レート表示を更新
            document.getElementById('usd-jpy').textContent = currentRates.USD_JPY.toFixed(2);
            document.getElementById('usd-eur').textContent = currentRates.USD_EUR.toFixed(4);
            document.getElementById('usd-try').textContent = currentRates.USD_TRY.toFixed(2);
            
            // 更新時間を表示 (APIからのタイムスタンプを使用)
            const updateDate = new Date(data.timestamp * 1000);
            document.getElementById('last-update').textContent = updateDate.toLocaleString();
        } else {
            throw new Error('APIからのレスポンスエラー');
        }
    } catch (error) {
        console.error('レート取得中にエラーが発生しました:', error);
        throw error;
    }
}

// 通貨換算関数
function convert(source) {
    // 入力値を取得
    const jpyInput = document.getElementById('jpy');
    const eurInput = document.getElementById('eur');
    const usdInput = document.getElementById('usd');
    const tryInput = document.getElementById('try');
    
    // 入力元の値を取得
    const value = parseFloat(document.getElementById(source).value);
    
    if (isNaN(value)) {
        // 数値でない場合は他のフィールドをクリア
        if (source !== 'jpy') jpyInput.value = '';
        if (source !== 'eur') eurInput.value = '';
        if (source !== 'usd') usdInput.value = '';
        if (source !== 'try') tryInput.value = '';
        return;
    }
    
    // 入力元に基づいて換算
    if (source === 'jpy') {
        eurInput.value = (value * currentRates.JPY_EUR).toFixed(2);
        usdInput.value = (value * currentRates.JPY_USD).toFixed(2);
        tryInput.value = (value * currentRates.JPY_TRY).toFixed(2);
    } else if (source === 'eur') {
        jpyInput.value = (value * currentRates.EUR_JPY).toFixed(2);
        usdInput.value = (value * currentRates.EUR_USD).toFixed(2);
        tryInput.value = (value * currentRates.EUR_TRY).toFixed(2);
    } else if (source === 'usd') {
        jpyInput.value = (value * currentRates.USD_JPY).toFixed(2);
        eurInput.value = (value * currentRates.USD_EUR).toFixed(2);
        tryInput.value = (value * currentRates.USD_TRY).toFixed(2);
    } else if (source === 'try') {
        jpyInput.value = (value * currentRates.TRY_JPY).toFixed(2);
        eurInput.value = (value * currentRates.TRY_EUR).toFixed(2);
        usdInput.value = (value * currentRates.TRY_USD).toFixed(2);
    }
}

// デモ用のダミーデータを設定する関数（API接続に失敗した場合）
function setDummyData() {
    currentRates = {
        // USD基準のダミーレート
        USD_JPY: 150.25,
        USD_EUR: 0.93,
        USD_TRY: 32.15,
        
        // その他の通貨ペアを計算
        EUR_USD: 1 / 0.93,
        EUR_JPY: 150.25 / 0.93,
        EUR_TRY: 32.15 / 0.93,
        
        JPY_USD: 1 / 150.25,
        JPY_EUR: 0.93 / 150.25,
        JPY_TRY: 32.15 / 150.25,
        
        TRY_USD: 1 / 32.15,
        TRY_EUR: 0.93 / 32.15,
        TRY_JPY: 150.25 / 32.15
    };
    
    // ダミーレートを表示
    document.getElementById('usd-jpy').textContent = currentRates.USD_JPY.toFixed(2);
    document.getElementById('usd-eur').textContent = currentRates.USD_EUR.toFixed(4);
    document.getElementById('usd-try').textContent = currentRates.USD_TRY.toFixed(2);
    
    // ダミーの更新時間を表示
    document.getElementById('last-update').textContent = '(サンプルデータ)';
}

// ページ読み込み時に実行
window.addEventListener('DOMContentLoaded', () => {
    initialize();
});