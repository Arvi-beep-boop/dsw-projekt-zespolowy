package com.example.slotserver.engine.core;

import java.util.ArrayList;
import java.util.Map;

public class WinLineCalculator {

    private final int width;
    private final int[][] winLines;
    private final int wild;
    private final int scatter;
    private final Map<Integer, Integer> payTable;


    public WinLineCalculator(final int width, final int[][] winLines,  Map<Integer, Integer> payTable, final int wild, final int scatter) {
        this.width = width;
        this.winLines = winLines;
        this.payTable = payTable;
        this.wild = wild;
        this.scatter = scatter;
    }

    public void findLineWins() {

        // for each winline
        // map symbols to binary code and store them in int[width]
        // if & operation on them is != 0 then it is a match
    }

}
