package com.example.slotserver.model;

import java.util.List;

public class SpinResponse {
    List<SpinResult> gameResult;
    long newBalance;


    public SpinResponse(final List<SpinResult> gameResult, final long newBalance) {
        this.gameResult = List.copyOf(gameResult);
        this.newBalance = newBalance;
    }

    public List<SpinResult> getGameResult() {
        return gameResult;
    }

    public long getNewBalance() {
        return newBalance;
    }

}
