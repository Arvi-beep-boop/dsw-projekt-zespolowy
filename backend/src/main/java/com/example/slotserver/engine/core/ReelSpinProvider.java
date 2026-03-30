package com.example.slotserver.engine.core;

import java.security.SecureRandom;

public final class ReelSpinProvider {
    final private int[][] reelSet;
    final private SecureRandom ro;

    public ReelSpinProvider(final int[][] reelSet, final SecureRandom ro) {
        this.reelSet = reelSet;
        this.ro = ro;
    }

    public int[] getReelStops() {
        int[] reelStops = new int[reelSet.length];
        for (int i = 0; i < reelSet.length; i++) {
            final int stop = ro.nextInt(reelSet[i].length);
            reelStops[i] = stop;
        }
        return reelStops;
    }

    public void setGridReelStops(final int[] reelStops, final Grid grid) {
        for (int i = 0; i < reelStops.length; i++) {
            final int stop = reelStops[i];
            final int[] idx = {
                    (stop - 1 + reelSet[i].length) % reelSet[i].length,
                    stop,
                    (stop + 1) % reelSet[i].length,
            };
            for (int j = 0; j < idx.length; j++) {
                int symbol = reelSet[i][idx[j]];
                grid.setSymbolAt(j, i, symbol);
            }
        }
    }
}
