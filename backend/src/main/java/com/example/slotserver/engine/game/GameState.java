package com.example.slotserver.engine.game;

import com.example.slotserver.engine.core.GameMode;
import com.example.slotserver.engine.core.Grid;
import com.example.slotserver.engine.core.WinLineData;
import com.example.slotserver.engine.game.constants.GameConstants;

import java.util.ArrayList;
import java.util.List;

public final class GameState {

    public GameMode gameMode = GameMode.BASE_GAME;

    public final Grid grid = new Grid(GameConstants.WIDTH,  GameConstants.HEIGHT);
    public int[] reelStops = new int[GameConstants.WIDTH];

    public List<WinLineData> winLineWinData = new ArrayList<WinLineData>();

    public long stepWinMoney = 0;
    public long cumulativeWinMoney = 0;

    public int numFreeSpinsAwarded = 0;
    public int numFreeSpinsPlayed = 0;
    public int totalNumberFreeSpins = 0;

}
