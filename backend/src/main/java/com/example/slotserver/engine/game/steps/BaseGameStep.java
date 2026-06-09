package com.example.slotserver.engine.game.steps;

import com.example.slotserver.engine.core.GameStep;
import com.example.slotserver.engine.core.ReelSpinProvider;
import com.example.slotserver.engine.core.WinLineCalculator;
import com.example.slotserver.engine.game.GameState;
import com.example.slotserver.engine.game.StepResultMapper;
import com.example.slotserver.engine.game.constants.GameConstants;
import com.example.slotserver.model.SpinResult;

import java.security.SecureRandom;

import static com.example.slotserver.engine.game.systems.CalculateLineWinSystem.calculateLineWins;
import static com.example.slotserver.engine.game.systems.TriggerFreeSpinsSystem.triggerFreeSpins;

public class BaseGameStep implements GameStep {
    private final ReelSpinProvider reelSpinProvider;
    private final WinLineCalculator winLineCalculator;
    private final SecureRandom ro;

    public BaseGameStep(final ReelSpinProvider reelSpinProvider, final WinLineCalculator winLineCalculator, final SecureRandom ro) {
        this.reelSpinProvider = reelSpinProvider;
        this.winLineCalculator = winLineCalculator;
        this.ro = ro;
    }

    @Override
    public void execute(GameState gameState) {
        final var reelStops = GameConstants.FORCED_RESULTS.get(gameState.forcedResultID);
        gameState.reelStops = reelStops == null ? reelSpinProvider.getReelStops() : reelStops.getForcedStops();
        reelSpinProvider.setGridReelStops(gameState.reelStops, gameState.grid);

        calculateLineWins(winLineCalculator, gameState);

        triggerFreeSpins(gameState);
    }

    @Override
    public SpinResult mapStepData(GameState gameState) {
        final SpinResult spinResult = new SpinResult();
        StepResultMapper.mapBaseGameStep(spinResult, gameState);
        return spinResult;
    }
}
