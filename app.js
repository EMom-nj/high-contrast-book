// --- Global Settings DOM Elements ---
const toggleAdvanced = document.getElementById('toggle-advanced');
const advancedSettingsGrid = document.getElementById('advanced-settings-grid');
const sliderTargetAge = document.getElementById('slider-target-age');
const valTargetAge = document.getElementById('val-target-age');
const sliderInflation = document.getElementById('slider-inflation');
const valInflation = document.getElementById('val-inflation');
const inputGoal = document.getElementById('input-goal');
const toggleTax = document.getElementById('toggle-tax');
const insightText = document.getElementById('smart-insight-text');

// --- Trump Account DOM Elements ---
const birthYearInput = document.getElementById('birth-year');
const sliderContribution = document.getElementById('slider-contribution');
const valContribution = document.getElementById('val-contribution');
const sliderRate = document.getElementById('slider-rate');
const valRate = document.getElementById('val-rate');
const baseAmountDisplay = document.getElementById('base-amount');
const finalBalanceDisplay = document.getElementById('final-balance');

// --- 529 Plan DOM Elements ---
const base529Input = document.getElementById('base-529');
const sliderContribution529 = document.getElementById('slider-contribution-529');
const valContribution529 = document.getElementById('val-contribution-529');
const sliderRate529 = document.getElementById('slider-rate-529');
const valRate529 = document.getElementById('val-rate-529');
const baseAmountDisplay529 = document.getElementById('base-amount-529');
const finalBalanceDisplay529 = document.getElementById('final-balance-529');

// Chart Contexts
const ctxTrump = document.getElementById('growthChartTrump').getContext('2d');
const ctx529 = document.getElementById('growthChart529').getContext('2d');
let chartTrump;
let chart529;

// Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
};

// Initialize Both Charts (Stacked Line Charts)
const initCharts = () => {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { 
                display: true,
                labels: { color: '#64748b', font: { family: 'Outfit' } }
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
                }
            },
            annotation: {
                annotations: {
                    goalLine: {
                        type: 'line',
                        yMin: 100000,
                        yMax: 100000,
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                            display: true,
                            content: '목표 금액',
                            position: 'start',
                            backgroundColor: 'rgba(245, 158, 11, 0.8)'
                        }
                    }
                }
            }
        },
        scales: {
            y: {
                stacked: false, // Turn off global stack to allow separate inflation line
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                    color: '#64748b',
                    callback: (value) => '$' + (value / 1000) + 'k'
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            }
        }
    };

    const buildDatasets = (color1, color2) => [
        {
            label: '총 납입액 (원금)',
            data: [],
            borderColor: color1,
            backgroundColor: color1.replace('1)', '0.2)'),
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            stack: 'Stack 0',
            tension: 0.4
        },
        {
            label: '발생한 이자',
            data: [],
            borderColor: color2,
            backgroundColor: color2.replace('1)', '0.4)'),
            borderWidth: 2,
            pointRadius: 0,
            fill: '-1',
            stack: 'Stack 0',
            tension: 0.4
        },
        {
            label: '실제 구매력 (물가반영)',
            data: [],
            borderColor: '#94a3b8',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0.4
        }
    ];

    chartTrump = new Chart(ctxTrump, {
        type: 'line',
        data: {
            labels: [],
            datasets: buildDatasets('rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)')
        },
        options: JSON.parse(JSON.stringify(commonOptions)) // Deep copy
    });

    chart529 = new Chart(ctx529, {
        type: 'line',
        data: {
            labels: [],
            datasets: buildDatasets('rgba(139, 92, 246, 1)', 'rgba(16, 185, 129, 1)')
        },
        options: JSON.parse(JSON.stringify(commonOptions)) // Deep copy
    });
};

// Calculate and Update
const calculateGrowth = () => {
    // Advanced Settings Toggle
    const useAdvanced = toggleAdvanced.checked;
    
    if (useAdvanced) {
        advancedSettingsGrid.classList.remove('disabled');
    } else {
        advancedSettingsGrid.classList.add('disabled');
    }

    // Global Settings
    const targetAge = useAdvanced ? (parseInt(sliderTargetAge.value) || 18) : 18;
    const inflationRate = useAdvanced ? ((parseFloat(sliderInflation.value) || 0) / 100) : 0;
    const targetGoal = useAdvanced ? (parseInt(inputGoal.value) || 0) : 0;
    const applyTax = useAdvanced ? toggleTax.checked : false;

    valTargetAge.innerText = `${targetAge}세`;
    valInflation.innerText = `${sliderInflation.value}%`;

    const labels = Array.from({length: targetAge + 1}, (_, i) => `${i}세`);
    chartTrump.data.labels = labels;
    chart529.data.labels = labels;
    
    // Update Goal Lines
    chartTrump.options.plugins.annotation.annotations.goalLine.yMin = targetGoal;
    chartTrump.options.plugins.annotation.annotations.goalLine.yMax = targetGoal;
    chart529.options.plugins.annotation.annotations.goalLine.yMin = targetGoal;
    chart529.options.plugins.annotation.annotations.goalLine.yMax = targetGoal;

    // --- Trump Account Logic ---
    const birthYear = parseInt(birthYearInput.value) || new Date().getFullYear();
    const annualContribTrump = parseInt(sliderContribution.value) || 0;
    const ratePercentTrump = parseFloat(sliderRate.value) || 0;
    const rateTrump = ratePercentTrump / 100;
    const baseTrump = birthYear >= 2025 ? 1000 : 0;
    
    valContribution.innerText = `${formatCurrency(annualContribTrump)}/년`;
    valRate.innerText = `${ratePercentTrump}%`;
    baseAmountDisplay.innerText = formatCurrency(baseTrump);
    
    let currentBalanceTrump = baseTrump;
    let totalContribTrump = baseTrump;
    let contribHistoryTrump = [totalContribTrump];
    let interestHistoryTrump = [0];
    let purchasingPowerTrump = [baseTrump];
    
    for (let i = 1; i <= targetAge; i++) {
        totalContribTrump += annualContribTrump;
        currentBalanceTrump += annualContribTrump;
        currentBalanceTrump = currentBalanceTrump * (1 + rateTrump);
        
        contribHistoryTrump.push(totalContribTrump);
        interestHistoryTrump.push(currentBalanceTrump - totalContribTrump);
        purchasingPowerTrump.push(currentBalanceTrump / Math.pow(1 + inflationRate, i));
    }

    // Apply Tax (15% on interest) if enabled
    let finalTrumpBalance = currentBalanceTrump;
    if (applyTax) {
        const totalInterest = currentBalanceTrump - totalContribTrump;
        const taxAmount = totalInterest * 0.15;
        finalTrumpBalance = currentBalanceTrump - taxAmount;
        // Adjust final year in arrays for visualization
        interestHistoryTrump[targetAge] -= taxAmount;
        purchasingPowerTrump[targetAge] = finalTrumpBalance / Math.pow(1 + inflationRate, targetAge);
    }
    finalBalanceDisplay.innerText = formatCurrency(finalTrumpBalance);

    // --- 529 Plan Logic ---
    const base529 = parseInt(base529Input.value) || 0;
    const annualContrib529 = parseInt(sliderContribution529.value) || 0;
    const ratePercent529 = parseFloat(sliderRate529.value) || 0;
    const rate529 = ratePercent529 / 100;
    
    valContribution529.innerText = `${formatCurrency(annualContrib529)}/년`;
    valRate529.innerText = `${ratePercent529}%`;
    baseAmountDisplay529.innerText = formatCurrency(base529);
    
    let currentBalance529 = base529;
    let totalContrib529 = base529;
    let contribHistory529 = [totalContrib529];
    let interestHistory529 = [0];
    let purchasingPower529 = [base529];
    
    for (let i = 1; i <= targetAge; i++) {
        totalContrib529 += annualContrib529;
        currentBalance529 += annualContrib529;
        currentBalance529 = currentBalance529 * (1 + rate529);
        
        contribHistory529.push(totalContrib529);
        interestHistory529.push(currentBalance529 - totalContrib529);
        purchasingPower529.push(currentBalance529 / Math.pow(1 + inflationRate, i));
    }
    const final529Balance = currentBalance529; // 529 is tax-free
    finalBalanceDisplay529.innerText = formatCurrency(final529Balance);

    // --- Update Charts ---
    chartTrump.data.datasets[0].data = contribHistoryTrump;
    chartTrump.data.datasets[1].data = interestHistoryTrump;
    chartTrump.data.datasets[2].data = purchasingPowerTrump;
    chartTrump.update();

    chart529.data.datasets[0].data = contribHistory529;
    chart529.data.datasets[1].data = interestHistory529;
    chart529.data.datasets[2].data = purchasingPower529;
    chart529.update();

    // --- Smart Insights Logic ---
    const diff = final529Balance - finalTrumpBalance;
    const diffReal = purchasingPower529[targetAge] - purchasingPowerTrump[targetAge];
    const is529Better = diff > 0;
    
    let taxText = applyTax ? "세금 15%와 " : "";
    let insightStr = `현재 설정대로라면, ${taxText}물가상승률 ${sliderInflation.value}%를 고려할 때 `;
    
    if (is529Better) {
        insightStr += `목표 연령(${targetAge}세)에 <strong>529 플랜</strong>이 트럼프 계좌보다 약 <strong>${formatCurrency(diff)}</strong> 더 유리합니다! (실제 가치 차이: ${formatCurrency(diffReal)})`;
    } else {
        insightStr += `목표 연령(${targetAge}세)에 <strong>트럼프 아기 계좌</strong>가 529 플랜보다 약 <strong>${formatCurrency(Math.abs(diff))}</strong> 더 유리합니다! (실제 가치 차이: ${formatCurrency(Math.abs(diffReal))})`;
    }
    
    if (finalTrumpBalance >= targetGoal && final529Balance >= targetGoal) {
        insightStr += `<br><span style="color:#10b981"><i class="fa-solid fa-party-horn"></i> 축하합니다! 두 계좌 모두 목표 금액(${formatCurrency(targetGoal)})을 달성했습니다!</span>`;
    } else if (final529Balance >= targetGoal) {
        insightStr += `<br><span style="color:#10b981"><i class="fa-solid fa-check-circle"></i> 529 플랜만이 목표 금액(${formatCurrency(targetGoal)})을 달성했습니다.</span>`;
    } else if (finalTrumpBalance >= targetGoal) {
        insightStr += `<br><span style="color:#10b981"><i class="fa-solid fa-check-circle"></i> 트럼프 계좌만이 목표 금액(${formatCurrency(targetGoal)})을 달성했습니다.</span>`;
    }
    
    insightText.innerHTML = insightStr;
};

// Event Listeners for Global Settings
toggleAdvanced.addEventListener('change', calculateGrowth);
sliderTargetAge.addEventListener('input', calculateGrowth);
sliderInflation.addEventListener('input', calculateGrowth);
inputGoal.addEventListener('input', calculateGrowth);
toggleTax.addEventListener('change', calculateGrowth);

// Event Listeners for Trump
birthYearInput.addEventListener('input', calculateGrowth);
sliderContribution.addEventListener('input', calculateGrowth);
sliderRate.addEventListener('input', calculateGrowth);

// Event Listeners for 529
base529Input.addEventListener('input', calculateGrowth);
sliderContribution529.addEventListener('input', calculateGrowth);
sliderRate529.addEventListener('input', calculateGrowth);

// Initialize
initCharts();
calculateGrowth();
