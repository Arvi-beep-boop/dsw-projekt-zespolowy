package com.example.slotserver.engine.core;

import java.util.*;

public final class WinLineCalculator {

    private final int[][] winLines;
    private final int wild;
    private final Set<Integer> excluded;
    private final Map<Integer, Map<Integer, Integer>> payTable;


    public WinLineCalculator(final int[][] winLines, Map<Integer, Map<Integer, Integer>> payTable, final int wild, final int... excluded) {
        this.winLines = winLines;
        this.payTable = payTable;
        this.wild = wild;
        this.excluded = new HashSet<>();
        for (int e : excluded) {
            this.excluded.add(e);
        }
    }

    public List<WinLineData> calculateLineWins(final Grid grid) {
        List<WinLineData> results = new ArrayList<>();


        for (int lineId = 0; lineId < winLines.length; lineId++) {
            int[] line = winLines[lineId];

            int wildCount = 0;
            int activeSymbol = -1;
            int activeMatchCount = 0;

            for (int reel = 0; reel < grid.width(); reel++) {
                int symbol = grid.getSymbolAt(line[reel], reel);

                if (excluded.contains(symbol)) break;

                // Track Pure Wilds
                if (symbol == wild && activeSymbol == -1) {
                    wildCount++;
                }

                // Track Substituted Win
                if (activeSymbol == -1) {
                    if (symbol != wild) {
                        activeSymbol = symbol;
                    }
                    activeMatchCount++;
                } else if (symbol == activeSymbol || symbol == wild) {
                    activeMatchCount++;
                } else {
                    break;
                }
            }

            // Evaluate both options and pick the best
            WinLineData bestWin = null;

            // Option A: Pure Wild Win
            int wildPay = getPayout(wild, wildCount);
            bestWin = new WinLineData(wild, wildCount, lineId, wildPay);

            // Option B: Substituted Win (only if better than Wild win)
            if (activeSymbol != -1) {
                int subPay = getPayout(activeSymbol, activeMatchCount);
                if (subPay > bestWin.getMult()) {
                    bestWin = new WinLineData(activeSymbol, activeMatchCount, lineId, subPay);
                }
            }

            if (bestWin.getMult() > 0) {
                results.add(bestWin);
            }
        }
        return results;
    }

    private int getPayout(final int symbol, final int length) {
        Map<Integer, Integer> payouts = payTable.get(symbol);

        if (payouts == null) {
            throw new IllegalArgumentException("Symbol " + symbol + " not found in payout table");
        }

        return Math.divideExact(payouts.getOrDefault(length, 0), winLines.length);
    }

}
