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

    public static final Map<Integer, Integer> PAY_TABLE = Map.ofEntries(
            Map.entry(WILD, 100),
            Map.entry(H1, 50),
            Map.entry(H2, 25),
            Map.entry(M1, 20),
            Map.entry(M2, 15),
            Map.entry(L1, 10),
            Map.entry(L2, 5),
            Map.entry(L3, 5)
    );

    public static final int NUM_FREE_SPINS = 5;

    public static final int DEFAULT_BET = 10;
}
