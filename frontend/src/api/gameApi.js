export const SYMBOL_MAP = {
    1: 'H1', 2: 'H2', 3: 'M1', 4: 'M2', 5: 'L1', 6: 'L2', 7: 'L3', 8: 'SCATTER', 9: 'WILD'
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

export const spinReelsAPI = async (betAmount) => {
    try {
        const response = await fetch(`${API_URL}/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bet: betAmount })
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