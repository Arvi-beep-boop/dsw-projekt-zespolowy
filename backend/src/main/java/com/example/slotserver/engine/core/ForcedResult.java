package com.example.slotserver.engine.core;

public class ForcedResult {
    final int[] forcedStops;
    final String name;

    public ForcedResult(final int[] forcedStops, final String name) {
        this.forcedStops = forcedStops;
        this.name = name;
    }

    public int[] getForcedStops() {
        return forcedStops;
    }
}
