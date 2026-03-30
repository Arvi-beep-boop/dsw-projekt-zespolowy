package com.example.slotserver.model;

import com.example.slotserver.engine.core.GameMode;
import com.example.slotserver.engine.core.Grid;
import com.example.slotserver.engine.core.WinLineData;

import java.util.List;

public class SpinResult {

    public GameMode gameMode;
    public Grid grid;
    public int[] reelStops;
    public long win;
    public List<WinLineData> winLineWinData;

    public long cumulativeWinMoney;
    public int numFreeSpinsAwarded;
    public int numFreeSpinsPlayed;
    public int totalNumberFreeSpins;

}
