package com.example.slotserver.engine.game.params;

import com.example.slotserver.engine.core.GameMode;

import static com.example.slotserver.engine.game.constants.SymbolCodes.*;

public final class ReelSet {
    private ReelSet() {}

    public static final int[][] BASE_REEL_SET = {
            {L1, SCATTER, WILD, L2, L1, L3, H1, L3, M1, H2, L2, M2, SCATTER, L3, M1, L2, L3, H1, L1, L2, L2, M2, L2, L1, SCATTER, H2, L3, M2, M1, L3, WILD, L2, L2, L1, H1, SCATTER, L3, M2, L3, WILD, L2, L3, L1, M1, SCATTER, H2, L2, M2, L2, SCATTER, L2, H1, L2, M2, L1, L1, L1, M1, SCATTER, L3, WILD, H1, L3, L2, L3, M2, L3, H2, L1, L3, WILD, L3, M2, L2},
            {L3, L1, SCATTER, WILD, L2, L2, M2, SCATTER, L1, WILD, L3, L1, H2, L3, WILD, H2, SCATTER, L1, H1, L2, M2, M1, L3, WILD, L3, M2, SCATTER, M2, M1, L2, H2, L2, L1, SCATTER, H1, L1, L1, M2, M2, M1, L2, SCATTER, L1, L2, H2, L3, L1, M1, L2, L3, H2, L2, M2, L3, L1, H1, L2, L2, L2, L3, H2, L2, M2, L3, L1, L2, H2, L3, L1, L1, L1, L1, L3, M2, L3, L2, H2, L3, M1, L3},
            {L2, L2, H2, L1, L2, L1, WILD, WILD, SCATTER, M1, L3, M2, L1, L2, L3, H1, SCATTER, M1, L1, WILD, L3, M2, SCATTER, H2, L2, L2, M2, M1, SCATTER, H1, L2, L1, M2, L3, M1, SCATTER, H2, L2, L3, M1, SCATTER, L1, WILD, L3, M2, H1, L2, L2, M2, SCATTER, H1, L3, L1, M1, L3, H2, L3, WILD, SCATTER, L3, M2, L3, L3, H1, L2, L2, L2, L2, L1, L3, M2, L3, L1, L3, L3, WILD, L3, L2, M2, L3, L2, L1, L2, M2, L2}
    };

    public static final int[][] FREE_REEL_SET = {
            {M1, WILD, H2, WILD, H2, M2, H1, M1, M1, WILD, WILD, WILD, H2, M1, H1, M2, M2, H2, WILD, L1, L2, H1, H1, WILD, L1, M2, H2, WILD, L1, M1, H2, L2, H1, M1, H2, M2, L1, H1, L3, H2, L1, M1, H1, M2, L2, L3, H1, L3},
            {M1, WILD, H2, WILD, H2, M2, H1, M1, M1, WILD, WILD, WILD, H2, M1, H1, M2, M2, H2, WILD, L1, L2, H1, H1, WILD, L1, M2, H2, WILD, L1, M1, H2, L2, H1, M1, H2, M2, L1, H1, L3, H2, L1, M1, H1, M2, L2, L3, WILD, L3, WILD},
            {M1, WILD, H2, WILD, H2, M2, H1, M1, M1, WILD, WILD, WILD, H2, M1, H1, M2, M2, H2, WILD, L1, L2, H1, H1, WILD, L1, M2, H2, WILD, L1, M1, H2, L2, H1, M1, H2, M2, L1, H1, L3, H2, L1, M1, H1, M2, L2, L3, WILD, L3, WILD, WILD, WILD, H1}
    };

    public int[][] getReelSet(GameMode gameMode) {
        if(gameMode == GameMode.BASE_GAME){
            return BASE_REEL_SET;
        }
        if(gameMode == GameMode.FREE_GAME){
            return FREE_REEL_SET;
        }
        return null;
    }
}
