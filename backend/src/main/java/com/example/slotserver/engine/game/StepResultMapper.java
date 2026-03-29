package com.example.slotserver.engine.game;

import com.example.slotserver.engine.core.GameMode;
import com.example.slotserver.engine.core.Grid;
import com.example.slotserver.model.SpinResult;

import java.util.List;

public class StepResultMapper {

    public static void mapBaseGameStep(final SpinResult data, final GameState gameState) {
        mapCommon(data, gameState);
        data.gameMode = GameMode.BASE_GAME;
    }

    public static void mapFreeGameStep(final SpinResult data, final GameState gameState) {
        mapCommon(data, gameState);
        data.gameMode = GameMode.FREE_GAME;
    }

    private static void mapCommon(final SpinResult data, final GameState gameState) {
        data.grid = new Grid(gameState.grid);
        data.reelStops = gameState.reelStops;
        data.win = gameState.stepWinMoney;
        data.winLineWinData = List.copyOf(gameState.winLineWinData);
        data.cumulativeWinMoney = gameState.cumulativeWinMoney;
        data.numFreeSpinsAwarded = gameState.numFreeSpinsAwarded;
        data.numFreeSpinsPlayed = gameState.numFreeSpinsPlayed;
        data.totalNumberFreeSpins = gameState.totalNumberFreeSpins;
    }
}
