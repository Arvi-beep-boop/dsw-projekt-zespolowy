package com.example.slotserver.engine.game.systems;

import com.example.slotserver.engine.core.GameMode;
import com.example.slotserver.engine.game.GameState;
import com.example.slotserver.engine.game.constants.GameConstants;
import com.example.slotserver.engine.game.constants.SymbolCodes;

public final class TriggerFreeSpinsSystem {
    private TriggerFreeSpinsSystem() {
        throw new IllegalStateException("Utility class");
    }

    public static void triggerFreeSpins(final GameState gameState) {

        if (gameState.grid.count(SymbolCodes.SCATTER) == GameConstants.NUM_SCATTERS_TO_TRIGGER_FS) {
            gameState.numFreeSpinsAwarded = GameConstants.NUM_FREE_SPINS;
            gameState.totalNumberFreeSpins = GameConstants.NUM_FREE_SPINS;
            gameState.gameMode = GameMode.FREE_GAME;
        }
    }
}
