export const getWinSoundKey = (result) => {
/*
 * Kalkulator priorytetu dźwięków wygranej.
 * 1. Pobiera dane o wylosowanych liniach (result).
 * 2. Sprawdza ID symboli, które złożyły się na wygraną.
 * 3. Grupuje je w kategorie: High (1, 2, 9), Medium (3, 4) i Low (5, 6, 7).
 * 4. Zwraca nazwę dźwięku o najwyższej randze (np. 'win-high'). 
 * Jeśli w jednym spinie wpadnie kilka różnych linii, odpala dzwięk najwyższej wartości.
 */
    if (!result.winLineWinData || result.winLineWinData.length === 0) {
        return null;
    }

    let hasHigh = false;
    let hasMedium = false;
    let hasLow = false;

    for (const line of result.winLineWinData) {
        const symbolId = line.symbol; 
        
        if (symbolId === 1 || symbolId === 2 || symbolId === 9) {
            hasHigh = true;
        } 
        else if (symbolId === 3 || symbolId === 4) {
            hasMedium = true;
        }
        else if (symbolId === 5 || symbolId === 6 || symbolId === 7) {
            hasLow = true;
        }
    }

    if (hasHigh) return 'win-high';
    if (hasMedium) return 'win-medium';
    if (hasLow) return 'win-low';
    
    return null;
};