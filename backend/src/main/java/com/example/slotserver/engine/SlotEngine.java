package com.example.slotserver.engine;

import com.example.slotserver.engine.core.ReelSpinProvider;
import com.example.slotserver.engine.core.WinLineCalculator;
import com.example.slotserver.engine.game.GameState;
import com.example.slotserver.engine.game.constants.GameConstants;
import com.example.slotserver.engine.game.constants.SymbolCodes;
import com.example.slotserver.engine.game.params.ReelSet;
import com.example.slotserver.engine.game.steps.BaseGameStep;
import com.example.slotserver.engine.game.steps.FreeGameStep;
import com.example.slotserver.model.SpinRequest;
import com.example.slotserver.model.SpinResult;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Component
public class SlotEngine {

    final BaseGameStep baseGameStep;
    final FreeGameStep freeGameStep;
    final SecureRandom ro = new SecureRandom();
    final WinLineCalculator winLineCalculator;

    public SlotEngine() {
        winLineCalculator = new WinLineCalculator(GameConstants.WIN_LINES, GameConstants.PAY_TABLE, SymbolCodes.WILD, SymbolCodes.SCATTER);
        baseGameStep = new BaseGameStep(new ReelSpinProvider(ReelSet.BASE_REEL_SET, ro), winLineCalculator, ro);
        freeGameStep = new FreeGameStep(new ReelSpinProvider(ReelSet.FREE_REEL_SET, ro), winLineCalculator, ro);
    }

    public List<SpinResult> spin(final SpinRequest spinRequest) {

        final List<SpinResult> spinResults = new ArrayList<>();

        final GameState gameState = new GameState(spinRequest.getBet());

        baseGameStep.execute(gameState);
        spinResults.add(baseGameStep.mapStepData(gameState));

        while (gameState.numFreeSpinsPlayed < gameState.totalNumberFreeSpins) {
            freeGameStep.execute(gameState);
            spinResults.add(freeGameStep.mapStepData(gameState));
        }

        return spinResults;
    }
}
