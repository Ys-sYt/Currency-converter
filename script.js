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
        // Netlifyリダイレクトルールを使ってAPIにアクセス
        const response = await fetch('/api/latest?base=EUR');
        console.log('APIレスポンス:', response);
        const data = await response.json();
        console.log('取得したデータ:', data);
        
        
        if (data.result === 'success') {
            currentRates = {
                EUR_JPY: data.rates.JPY,
                EUR_TRY: data.rates.TRY,
                JPY_EUR: 1 / data.rates.JPY,
                JPY_TRY: data.rates.TRY / data.rates.JPY,
                TRY_EUR: 1 / data.rates.TRY,
                TRY_JPY: data.rates.JPY / data.rates.TRY
            };
            
            
            // レート表示を更新
            document.getElementById('eur-jpy').textContent = currentRates.EUR_JPY.toFixed(2);
            document.getElementById('eur-try').textContent = currentRates.EUR_TRY.toFixed(2);
            
            // 更新時間を表示
            const now = new Date();
            document.getElementById('last-update').textContent = now.toLocaleString();
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
    const tryInput = document.getElementById('try');
    
    // 入力元の値を取得
    const value = parseFloat(document.getElementById(source).value);
    
    if (isNaN(value)) {
        // 数値でない場合は他のフィールドをクリア
        if (source !== 'jpy') jpyInput.value = '';
        if (source !== 'eur') eurInput.value = '';
        if (source !== 'try') tryInput.value = '';
        return;
    }
    
    // 入力元に基づいて換算
    if (source === 'jpy') {
        eurInput.value = (value * currentRates.JPY_EUR).toFixed(2);
        tryInput.value = (value * currentRates.JPY_TRY).toFixed(2);
    } else if (source === 'eur') {
        jpyInput.value = (value * currentRates.EUR_JPY).toFixed(2);
        tryInput.value = (value * currentRates.EUR_TRY).toFixed(2);
    } else if (source === 'try') {
        jpyInput.value = (value * currentRates.TRY_JPY).toFixed(2);
        eurInput.value = (value * currentRates.TRY_EUR).toFixed(2);
    }
}

// デモ用のダミーデータを設定する関数（API接続に失敗した場合）
function setDummyData() {
    currentRates = {
        EUR_JPY: 160.45,
        EUR_TRY: 35.78,
        JPY_EUR: 1 / 160.45,
        JPY_TRY: 35.78 / 160.45,
        TRY_EUR: 1 / 35.78,
        TRY_JPY: 160.45 / 35.78
    };
    
    document.getElementById('eur-jpy').textContent = currentRates.EUR_JPY.toFixed(2);
    document.getElementById('eur-try').textContent = currentRates.EUR_TRY.toFixed(2);
    
    // ダミーの更新時間を表示
    document.getElementById('last-update').textContent = '(サンプルデータ)';
}

// ページ読み込み時に実行
window.addEventListener('DOMContentLoaded', () => {
    initialize();
});