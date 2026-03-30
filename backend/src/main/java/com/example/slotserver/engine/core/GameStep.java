package com.example.slotserver.engine.core;

import com.example.slotserver.engine.game.GameState;
import com.example.slotserver.model.SpinResult;

public interface GameStep {
    void execute(GameState gameState);

    SpinResult mapStepData(GameState gameState);
}
