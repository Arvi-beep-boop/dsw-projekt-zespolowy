package com.example.slotserver.engine.game.systems;

import com.example.slotserver.engine.core.WinLineCalculator;
import com.example.slotserver.engine.core.WinLineData;
import com.example.slotserver.engine.game.GameState;
import com.example.slotserver.engine.game.constants.GameConstants;

public final class CalculateLineWinSystem {
    private CalculateLineWinSystem() {

    }

    public static void calculateLineWins(final WinLineCalculator winLineCalculator, final GameState gameState) {
        gameState.winLineWinData = winLineCalculator.calculateLineWins(gameState.grid);

        final var multi = gameState.winLineWinData.stream().mapToInt(WinLineData::getMult).sum();
        // todo: replace default bet with the value received from the client.
        final var winMoney = Math.multiplyExact(multi, GameConstants.DEFAULT_BET);

        gameState.stepWinMoney = winMoney;
        gameState.cumulativeWinMoney = Math.addExact(gameState.cumulativeWinMoney, winMoney);
    }
}
