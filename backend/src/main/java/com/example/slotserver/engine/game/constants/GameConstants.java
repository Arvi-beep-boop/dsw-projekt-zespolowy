package com.example.slotserver.engine.game.constants;

import java.util.Map;

import static com.example.slotserver.engine.game.constants.SymbolCodes.*;

public final class GameConstants {
    private GameConstants() {}

    public static final int WIDTH = 3;
    public static final int HEIGHT = 3;

    public static final int[][] WIN_LINES = {
            {0, 0, 0},
            {1, 1, 1},
            {2, 2, 2},
            {0, 1, 2},
            {2, 1, 0}
    };

    public static final Map<Integer, Map<Integer, Integer>> PAY_TABLE = Map.ofEntries(
            Map.entry(WILD, Map.of(3, 100)),
            Map.entry(H1,   Map.of(3, 50)),
            Map.entry(H2,   Map.of(3, 25)),
            Map.entry(M1,   Map.of(3, 20)),
            Map.entry(M2,   Map.of(3, 15)),
            Map.entry(L1,   Map.of(3, 10)),
            Map.entry(L2,   Map.of(3, 5)),
            Map.entry(L3,   Map.of(3, 5))
    );

    public static final int NUM_FREE_SPINS = 5;
    public static final int NUM_SCATTERS_TO_TRIGGER_FS = 3;

    public static final int DEFAULT_BET = 10;
}
