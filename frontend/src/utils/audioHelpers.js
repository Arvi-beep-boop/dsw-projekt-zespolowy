/**
 * Określa priorytet dźwięku wygranej dla danego obrotu.
 * Analizuje zwycięskie linie i w przypadku trafień o różnej wartości,
 * zwraca klucz dźwięku o najwyższej randze (High > Medium > Low).
 */
export const getWinSoundKey = (result) => {
    // Weryfikacja, czy w danym obrocie wystąpiła jakakolwiek wygrana na liniach
    if (!result.winLineWinData || result.winLineWinData.length === 0) {
        return null;
    }

    // Flagi rejestrujące wystąpienie symboli z poszczególnych kategorii
    let hasHigh = false;
    let hasMedium = false;
    let hasLow = false;

    // Iteracja przez zwycięskie linie w celu przypisania symboli do odpowiednich grup
    for (const line of result.winLineWinData) {
        const symbolId = line.symbol; 
        
        // Grupa o najwyższym priorytecie
        if (symbolId === 1 || symbolId === 2 || symbolId === 9) {
            hasHigh = true;
        } 
        // Grupa o średnim priorytecie
        else if (symbolId === 3 || symbolId === 4) {
            hasMedium = true;
        }
        // Grupa o najniższym priorytecie
        else if (symbolId === 5 || symbolId === 6 || symbolId === 7) {
            hasLow = true;
        }
    }

    // Zwraca klucz pliku audio zgodnie z ustaloną hierarchią ważności
    if (hasHigh) return 'win-high';
    if (hasMedium) return 'win-medium';
    if (hasLow) return 'win-low';
    
    return null;
};