package com.example.slotserver.engine.game.steps;

import com.example.slotserver.engine.core.GameStep;
import com.example.slotserver.engine.core.ReelSpinProvider;
import com.example.slotserver.engine.core.WinLineCalculator;
import com.example.slotserver.engine.game.GameState;
import com.example.slotserver.engine.game.StepResultMapper;
import com.example.slotserver.model.SpinResult;

import java.security.SecureRandom;

import static com.example.slotserver.engine.game.systems.CalculateLineWinSystem.calculateLineWins;

public class FreeGameStep implements GameStep {
    private final ReelSpinProvider reelSpinProvider;
    private final WinLineCalculator winLineCalculator;
    private final SecureRandom ro;

    public FreeGameStep(final ReelSpinProvider reelSpinProvider, final WinLineCalculator winLineCalculator, final SecureRandom ro) {
        this.reelSpinProvider = reelSpinProvider;
        this.winLineCalculator = winLineCalculator;
        this.ro = ro;
    }

    @Override
    public void execute(GameState gameState) {
        gameState.numFreeSpinsPlayed++;

        gameState.reelStops = reelSpinProvider.getReelStops();
        reelSpinProvider.setGridReelStops(gameState.reelStops, gameState.grid);

        calculateLineWins(winLineCalculator, gameState);

        gameState.winLineWinData = winLineCalculator.calculateLineWins(gameState.grid);
    }

    @Override
    public SpinResult mapStepData(GameState gameState) {
        final SpinResult spinResult = new SpinResult();
        StepResultMapper.mapFreeGameStep(spinResult, gameState);
        return spinResult;
    }
}
