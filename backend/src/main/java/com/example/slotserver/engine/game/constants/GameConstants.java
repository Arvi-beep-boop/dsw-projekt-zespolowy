package com.example.slotserver.engine.game.constants;

import com.example.slotserver.engine.core.ForcedResult;

import java.util.Map;

import static com.example.slotserver.engine.game.constants.SymbolCodes.*;

public final class GameConstants {
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
            Map.entry(H1, Map.of(3, 50)),
            Map.entry(H2, Map.of(3, 25)),
            Map.entry(M1, Map.of(3, 20)),
            Map.entry(M2, Map.of(3, 15)),
            Map.entry(L1, Map.of(3, 10)),
            Map.entry(L2, Map.of(3, 5)),
            Map.entry(L3, Map.of(3, 5))
    );
    public static final int NUM_FREE_SPINS = 5;
    public static final int NUM_SCATTERS_TO_TRIGGER_FS = 3;
    public static final int DEFAULT_BET = 10;

    public static final Map<Integer, ForcedResult> FORCED_RESULTS = Map.ofEntries(
            Map.entry(1, new ForcedResult(new int[]{6, 18, 45}, "H1x3" )),
            Map.entry(2, new ForcedResult(new int[]{67, 60, 2}, "H2x3" )),
            Map.entry(3, new ForcedResult(new int[]{8, 28, 39}, "M1x3" )),
            Map.entry(4, new ForcedResult(new int[]{21, 20, 21}, "M2x3" )),
            Map.entry(5, new ForcedResult(new int[]{4, 8, 3}, "L1x3" )),
            Map.entry(6, new ForcedResult(new int[]{3, 4, 4}, "L2x3" )),
            Map.entry(7, new ForcedResult(new int[]{16, 45, 43}, "L3x3" )),
            Map.entry(8, new ForcedResult(new int[]{1, 2, 8}, "free-spins" ))
    );

    private GameConstants() {
    }
}
