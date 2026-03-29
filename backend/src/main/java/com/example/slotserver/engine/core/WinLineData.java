package com.example.slotserver.engine.core;

public class WinLineData {
    private final int symbol;
    private final int length;
    private final int winLineId;
    private final int mult;

    public WinLineData(int symbol, int length, int winLineId, int mult) {
        this.symbol = symbol;
        this.length = length;
        this.winLineId = winLineId;
        this.mult = mult;
    }

    public int getSymbol() {
        return symbol;
    }

    public int getLength() {
        return length;
    }

    public int getWinLineId() {
        return winLineId;
    }

    public int getMult() {
        return mult;
    }
}

