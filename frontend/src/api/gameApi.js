export const SYMBOL_MAP = {
    1: 'H1', 2: 'H2', 3: 'M1', 4: 'M2', 5: 'L1', 6: 'L2', 7: 'L3', 8: 'SCATTER', 9: 'WILD'
};

export const WIN_LINES = {
    0: [{col: 0, row: 0}, {col: 1, row: 0}, {col: 2, row: 0}], // Górny wiersz
    1: [{col: 0, row: 1}, {col: 1, row: 1}, {col: 2, row: 1}], // Środkowy wiersz
    2: [{col: 0, row: 2}, {col: 1, row: 2}, {col: 2, row: 2}], // Dolny wiersz
    3: [{col: 0, row: 0}, {col: 1, row: 1}, {col: 2, row: 2}], // Przekątna w dół
    4: [{col: 0, row: 2}, {col: 1, row: 1}, {col: 2, row: 0}]  // Przekątna w górę
};

const API_URL = '/api/v1';

export const fetchInitialState = async () => {
    try {
        const response = await fetch(`${API_URL}/init`);
        if (!response.ok) throw new Error(`Błąd serwera: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Błąd podczas pobierania stanu początkowego:", error);
        return null;
    }
};

export const spinReelsAPI = async (betAmount, forcedResultID = null) => {
    try {
        const payload = { bet: betAmount };
        // Jeśli przesłano ID z menu, dodajemy je do requesta
        if (forcedResultID !== null) {
            payload.forcedResultID = forcedResultID;
        }

        const response = await fetch(`${API_URL}/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error("Odrzucono zakład: Brak środków lub nieprawidłowa stawka!");
            }
            throw new Error(`Błąd serwera: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const reloadBalance = async () => {
    try {
        const response = await fetch(`${API_URL}/reload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Błąd przeładowania konta: ${response.status}`);
        }
        return true;
        
    } catch (error) {
        console.error("Błąd komunikacji podczas reloadu:", error);
        throw error;
    }
};